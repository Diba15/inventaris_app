<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'
import axios from 'axios'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import AlertComponent from '@/components/AlertComponent.vue'

// --- ENVIRONMENT & STATE ---
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL
const allCategories = ref([])
const products = ref([])
const isLoading = ref(true)
const searchTerm = ref('')

// --- SORTING STATE ---
const sortKey = ref('category')
const sortOrder = ref('asc')

// --- PAGINATION STATE ---
const currentPage = ref(1)
const itemsPerPage = ref(5) // Consistent with products component

// --- MODAL STATE ---
const isModalOpen = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const currentCategory = reactive({
  documentId: null,
  category: '',
})
const isDeleteModalOpen = ref(false)
const categoryToDelete = ref(null)

// --- DATA FETCHING ---
const fetchData = async () => {
  isLoading.value = true
  try {
    const [categoriesRes, productsRes] = await Promise.all([
      axios.get(`${STRAPI_URL}/api/product-categories?sort=category:asc`),
      axios.get(`${STRAPI_URL}/api/products?populate=product_category`),
    ])
    allCategories.value = categoriesRes.data.data
    products.value = productsRes.data.data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    push.error('Gagal memuat data.')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

// --- COMPUTED PROPERTIES ---
const filteredCategories = computed(() => {
  // 1. Calculate product counts
  const categoryCounts = products.value.reduce((acc, product) => {
    const categoryId = product.product_category?.documentId
    if (categoryId) {
      acc[categoryId] = (acc[categoryId] || 0) + 1
    }
    return acc
  }, {})

  let categoriesWithCount = allCategories.value.map((cat) => ({
    ...cat,
    productCount: categoryCounts[cat.documentId] || 0,
  }))

  // 2. Filter by search query
  if (searchTerm.value.trim()) {
    const search = searchTerm.value.toLowerCase().trim()
    categoriesWithCount = categoriesWithCount.filter((cat) =>
      cat.category.toLowerCase().includes(search),
    )
  }

  return categoriesWithCount
})

const sortedCategories = computed(() => {
  // 3. Sort the filtered results
  return [...filteredCategories.value].sort((a, b) => {
    let aValue = a[sortKey.value]
    let bValue = b[sortKey.value]

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredCategories.value.length / itemsPerPage.value)
})

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedCategories.value.slice(start, end)
})

const isSearching = computed(() => searchTerm.value.trim().length > 0)
const hasResults = computed(() => filteredCategories.value.length > 0)

const startPageCount = computed(() => {
  if (filteredCategories.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})
const endPageCount = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredCategories.value.length)
})

// --- WATCHERS ---
watch(searchTerm, () => {
  currentPage.value = 1
})

// --- HELPER FUNCTIONS ---
const highlightSearchTerm = (text, term) => {
  if (!term || !text) return text
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.toString().replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

// --- MODAL ACTIONS ---
const openAddModal = () => {
  modalMode.value = 'add'
  currentCategory.documentId = null
  currentCategory.category = ''
  isModalOpen.value = true
}

const openEditModal = (category) => {
  modalMode.value = 'edit'
  currentCategory.documentId = category.documentId
  currentCategory.category = category.category
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const openDeleteModal = (category) => {
  categoryToDelete.value = category
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  categoryToDelete.value = null
}

// --- CRUD & UI ACTIONS ---
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const clearSearch = () => {
  searchTerm.value = ''
}

const saveCategory = async () => {
  if (!currentCategory.category.trim()) {
    push.warning('Nama kategori tidak boleh kosong.')
    return
  }
  const notif = push.promise({ message: 'Menyimpan kategori...' })
  try {
    const data = { category: currentCategory.category }
    if (modalMode.value === 'add') {
      await axios.post(`${STRAPI_URL}/api/product-categories`, { data })
    } else {
      await axios.put(`${STRAPI_URL}/api/product-categories/${currentCategory.documentId}`, {
        data,
      })
    }
    await fetchData()
    closeModal()
    notif.resolve({ type: 'success', message: 'Kategori berhasil disimpan!' })
  } catch (error) {
    console.error('Failed to save category:', error)
    notif.reject({ type: 'error', message: 'Gagal menyimpan kategori.' })
  }
}

const confirmDelete = async () => {
  if (!categoryToDelete.value) return
  if (categoryToDelete.value.productCount > 0) {
    push.error({
      title: 'Gagal Menghapus',
      message: 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.',
    })
    closeDeleteModal()
    return
  }
  const notif = push.promise({ message: 'Menghapus kategori...' })
  try {
    await axios.delete(`${STRAPI_URL}/api/product-categories/${categoryToDelete.value.documentId}`)
    await fetchData()
    closeDeleteModal()
    notif.resolve({ type: 'success', message: 'Kategori berhasil dihapus!' })
  } catch (error) {
    console.error('Failed to delete category:', error)
    notif.reject({ type: 'error', message: 'Gagal menghapus kategori.' })
  }
}

// --- PAGINATION METHODS ---
const goToPage = (page) => {
  const pageNumber = parseInt(page, 10)
  if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber
  }
}
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<template>
  <div class="px-4">
    <main class="mt-4">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow p-6">
        <div
          class="bg-base text-secondary p-6 -m-6 rounded-t-xl flex justify-between items-center flex-col md:flex-row gap-4"
        >
          <div>
            <h1 class="text-2xl font-bold">Categories Management</h1>
            <p class="text-[var(--color-secondary)] opacity-80 mt-1">
              Add, edit, or delete your product categories.
            </p>
          </div>
          <button
            @click="openAddModal"
            class="bg-white/20 hover:bg-white/30 self-end-safe text-white px-4 py-2 min-w-[150px] h-[40px] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-plus"></i>
            <span>Add Category</span>
          </button>
        </div>

        <!-- Search and Table -->
        <div class="mt-6 p-4">
          <div class="relative w-full max-w-lg mb-4">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="fa fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Search categories..."
              class="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 text-base placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sub focus:border-sub"
            />
            <div v-if="isSearching" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                @click="clearSearch"
                class="text-gray-500 hover:text-red-500 transition-colors focus:outline-none"
                title="Clear search"
              >
                <i class="fa fa-times-circle"></i>
              </button>
            </div>
          </div>

          <div v-if="isSearching" class="mb-2 text-sm text-gray-600">
            <span v-if="hasResults">
              Found {{ filteredCategories.length }} result(s) for "{{ searchTerm }}"
            </span>
            <span v-else class="text-orange-600"> No results found for "{{ searchTerm }}" </span>
          </div>

          <div class="overflow-x-auto shadow-lg rounded-xl">
            <table class="w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
              <thead
                class="bg-base text-white text-left text-xs font-medium uppercase tracking-wider"
              >
                <tr>
                  <th class="px-6 py-3 cursor-pointer select-none" @click="sortBy('category')">
                    Category Name
                    <span v-if="sortKey === 'category'" class="ml-1">
                      <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                    </span>
                  </th>
                  <th class="px-6 py-3 cursor-pointer select-none" @click="sortBy('productCount')">
                    Total Products
                    <span v-if="sortKey === 'productCount'" class="ml-1">
                      <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                    </span>
                  </th>
                  <th class="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 text-sm">
                <tr v-if="isLoading">
                  <td colspan="3" class="text-center py-10 text-gray-500">Memuat data...</td>
                </tr>
                <tr v-else-if="!hasResults && isSearching">
                  <td colspan="3" class="text-center py-8 text-gray-500">
                    <div class="flex flex-col items-center">
                      <i class="fa fa-search text-4xl mb-2 text-gray-300"></i>
                      <p class="text-lg">Kategori tidak ditemukan</p>
                      <p class="text-sm">Coba sesuaikan kata kunci pencarian Anda</p>
                      <button
                        @click="clearSearch"
                        class="mt-2 px-4 py-2 bg-sub text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        Hapus Pencarian
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="paginatedCategories.length === 0">
                  <td colspan="3" class="text-center py-10 text-gray-500">
                    Belum ada kategori yang ditambahkan.
                  </td>
                </tr>
                <tr
                  v-for="(category, index) in paginatedCategories"
                  :key="category.documentId"
                  :class="[
                    'transition-colors',
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                    'hover:bg-gray-100',
                  ]"
                >
                  <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    <span v-html="highlightSearchTerm(category.category, searchTerm)"></span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                    <span
                      class="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-700 text-xs font-medium"
                    >
                      {{ category.productCount }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      @click="openEditModal(category)"
                      class="text-blue-500 hover:text-blue-700 text-xl"
                      title="Edit"
                    >
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      @click="openDeleteModal(category)"
                      class="text-red-500 hover:text-red-700 text-xl"
                      title="Delete"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between text-base px-4 mt-2 text-sm items-center">
            <div>
              <span v-if="hasResults">
                {{ startPageCount }} - {{ endPageCount }} of {{ filteredCategories.length }}
              </span>
              <span v-else> Tidak ada hasil </span>
            </div>
            <div class="flex gap-2 items-center" v-if="totalPages > 1">
              <div
                class="p-1 cursor-pointer"
                :class="{ 'text-gray-400 cursor-not-allowed': currentPage === 1 }"
                @click="prevPage()"
              >
                <i class="fa fa-angle-left"></i>
              </div>
              <div id="current-page" class="p-1">
                <span>
                  <input
                    type="number"
                    min="1"
                    :max="totalPages"
                    :value="currentPage"
                    @input="goToPage($event.target.value)"
                    @keyup.enter="$event.target.blur()"
                    class="px-2 py-1 max-w-[50px] text-center border rounded"
                  />
                </span>
                <span class="ml-1 text-gray-500">/ {{ totalPages }}</span>
              </div>
              <div
                class="p-1 cursor-pointer"
                :class="{ 'text-gray-400 cursor-not-allowed': currentPage === totalPages }"
                @click="nextPage()"
              >
                <i class="fa fa-angle-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div
        v-if="isModalOpen"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
              {{ modalMode === 'add' ? 'Add New Category' : 'Edit Category' }}
            </h2>
            <form @submit.prevent="saveCategory">
              <StandardFloatingInput
                id="category_name"
                label="Category Name"
                placeholder="Example: Electronics"
                v-model="currentCategory.category"
                required
              />
              <div class="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-5 py-2 text-white bg-sub hover:bg-sub/90 rounded-lg font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <AlertComponent
        :show="isDeleteModalOpen"
        type="delete"
        :message="`Anda yakin ingin menghapus kategori '${categoryToDelete?.category}'? Tindakan ini tidak dapat dibatalkan.`"
        @close="closeDeleteModal"
        @confirm="confirmDelete"
      />

      <Notivue v-slot="item">
        <Notification :item="item" :theme="pastelTheme">
          <NotificationProgress :item="item" />
        </Notification>
      </Notivue>
    </main>
  </div>
</template>

<style scoped>
mark {
  background-color: #fef08a;
  padding: 2px 4px;
  border-radius: 3px;
}
</style>
