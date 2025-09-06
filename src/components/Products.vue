<script setup>
import { ref, computed, nextTick, watchEffect, onMounted } from 'vue'

defineOptions({
  name: 'products_component',
})

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  totalDataOnMounted: {
    type: Number,
    default: 0,
  },
})

// Props for the component
const emit = defineEmits(['deleteProduct', 'openDeleteModal'])
const startPage = ref(0)
const totalData = ref(0)
const currentPage = ref(1)
const searchTerm = ref('') // Add reactive search term

const startPageCount = computed(() => startPage.value * 5 + 1)
const endPageCount = computed(() => {
  const end = startPage.value * 5 + 5
  return end > filteredProducts.value.length ? filteredProducts.value.length : end
})

onMounted(() => {
  watchEffect(() => {
    totalData.value = props.totalDataOnMounted || filteredProducts.value.length
  })
})

const sortOrder = ref('asc')
const sortKey = ref('product_category')

// Enhanced search functionality
const filteredProducts = computed(() => {
  if (!searchTerm.value.trim()) {
    return props.products
  }

  const search = searchTerm.value.toLowerCase().trim()

  return props.products.filter((product) => {
    // Search in multiple fields
    const searchableFields = [
      product.product_name?.toLowerCase() || '',
      product.product_code?.toLowerCase() || '',
      product.product_description?.toLowerCase() || '',
      product.product_category?.category?.toLowerCase() || '', // If category is nested
      product.product_price?.toString() || '',
      product.product_qty?.toString() || '',
    ]

    // Check if any field contains the search term
    return searchableFields.some((field) => field.includes(search))
  })
})

// Filter products per page
const limit = 5
const start = computed(() => startPage.value * limit)
const end = computed(() => startPage.value * limit + limit)

const paginatedProducts = computed(() => {
  return filteredProducts.value.slice(start.value, end.value)
})

// Computed property to sort products based on the selected key and order
const sortedProducts = computed(() => {
  return [...paginatedProducts.value].sort((a, b) => {
    let aValue = a[sortKey.value]
    let bValue = b[sortKey.value]

    // Handle nested values like product_category.category
    if (sortKey.value === 'product_category' && typeof aValue === 'object') {
      aValue = aValue?.category || ''
      bValue = bValue?.category || ''
    }

    // Handle null/undefined values
    if (aValue == null) aValue = ''
    if (bValue == null) bValue = ''

    // Convert to string for comparison
    aValue = aValue.toString().toLowerCase()
    bValue = bValue.toString().toLowerCase()

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1

    return 0
  })
})

// Function to handle pagination
function nextPage() {
  if (startPage.value < Math.ceil(filteredProducts.value.length / limit) - 1) {
    startPage.value++
  }
  currentPage.value = startPage.value + 1
  nextTick(() => {
    const input = document.querySelector('#current-page input')
    if (input) {
      input.value = currentPage.value
    }
  })
}

function prevPage() {
  if (startPage.value > 0) {
    startPage.value--
  }
  currentPage.value = startPage.value + 1
  nextTick(() => {
    const input = document.querySelector('#current-page input')
    if (input) {
      input.value = currentPage.value
    }
  })
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredProducts.value.length / limit)
  if (page >= 1 && page <= totalPages) {
    startPage.value = page - 1
    currentPage.value = page
  }
}

// Function to sort products by a key ascending and descending
function sortBy(key) {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  sortKey.value = key
}

// Enhanced search function
const handleSearch = (event) => {
  searchTerm.value = event.target.value
  // Reset to first page when searching
  startPage.value = 0
  currentPage.value = 1

  nextTick(() => {
    const input = document.querySelector('#current-page input')
    if (input) {
      input.value = 1
    }
  })
}

// Function to clear search
const clearSearch = () => {
  searchTerm.value = ''
  startPage.value = 0
  currentPage.value = 1

  nextTick(() => {
    const searchInput = document.querySelector('#searchProduct')
    const pageInput = document.querySelector('#current-page input')
    if (searchInput) searchInput.value = ''
    if (pageInput) pageInput.value = 1
  })
}

// Function to open delete modal
function openDeleteModal(id, imageId) {
  emit('openDeleteModal', id, imageId)
}

// Computed for pagination info
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / limit))
const hasResults = computed(() => filteredProducts.value.length > 0)
const isSearching = computed(() => searchTerm.value.trim().length > 0)
</script>

<template>
  <div>
    <!-- Enhanced Search Bar -->
    <div class="flex items-center px-4 relative">
      <input
        type="text"
        id="searchProduct"
        placeholder="Search by name, code, description, price, or quantity..."
        class="mb-2 px-2 py-1 rounded-l w-full max-w-[400px] bg-white border-l border-t border-b border-[#d1d5db] text-base focus:outline-none"
        @input="handleSearch"
        :value="searchTerm"
      />

      <!-- Clear search button -->
      <button
        v-if="isSearching"
        @click="clearSearch"
        class="mb-2 bg-white px-2 py-1 border-t border-b border-[#d1d5db] text-gray-500 hover:text-gray-700 focus:outline-none"
        title="Clear search"
      >
        <i class="fa fa-times"></i>
      </button>

      <!-- Search icon -->
      <i
        class="mb-2 fa fa-search text-xl focus:outline-none bg-white px-2 py-1.5 rounded-r text-gray-400 border-r border-t border-b border-[#d1d5db]"
      ></i>
    </div>

    <!-- Search Results Info -->
    <div v-if="isSearching" class="px-4 mb-2 text-sm text-gray-600">
      <span v-if="hasResults">
        Found {{ filteredProducts.length }} result(s) for "{{ searchTerm }}"
      </span>
      <span v-else class="text-orange-600"> No results found for "{{ searchTerm }}" </span>
    </div>

    <div class="product-grid overflow-x-auto shadow-lg rounded-xl">
      <table
        class="w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden hover-table"
      >
        <thead class="bg-base text-white">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_code')"
            >
              Product Code
              <span v-if="sortKey === 'product_code'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_name')"
            >
              Product Name
              <span v-if="sortKey === 'product_name'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_description')"
            >
              Description
              <span v-if="sortKey === 'product_description'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_price')"
            >
              Price
              <span v-if="sortKey === 'product_price'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_qty')"
            >
              Quantity
              <span v-if="sortKey === 'product_qty'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('createdAt')"
            >
              Created At
              <span v-if="sortKey === 'createdAt'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 text-base text-sm">
          <tr
            v-for="(product, index) in sortedProducts"
            :key="product.id"
            :class="[
              'hover:bg-gray-300 transition-colors',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
            ]"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-html="highlightSearchTerm(product.product_code, searchTerm)"></span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-html="highlightSearchTerm(product.product_name, searchTerm)"></span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-html="highlightSearchTerm(product.product_description, searchTerm)"></span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
              Rp.<span
                v-html="highlightSearchTerm(product.product_price?.toString() || '', searchTerm)"
              ></span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-blue-600 font-semibold">
              <span
                v-html="highlightSearchTerm(product.product_qty?.toString() || '', searchTerm)"
              ></span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{
                new Date(product.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap flex gap-2">
              <RouterLink
                :to="{ name: 'edit-product', params: { id: product.documentId } }"
                class="text-blue-500 hover:text-blue-700 text-xl"
              >
                <button>
                  <i class="fa-solid fa-eye"></i>
                </button>
              </RouterLink>
              <button
                class="text-red-500 hover:text-red-700 text-xl"
                @click="openDeleteModal(product.documentId, product.product_image?.id)"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
          <tr v-if="!hasResults && isSearching">
            <td colspan="7" class="text-center py-8 text-gray-500">
              <div class="flex flex-col items-center">
                <i class="fa fa-search text-4xl mb-2 text-gray-300"></i>
                <p class="text-lg">No products found</p>
                <p class="text-sm">Try adjusting your search terms</p>
                <button
                  @click="clearSearch"
                  class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </td>
          </tr>
          <tr v-else-if="!hasResults && !isSearching">
            <td colspan="7" class="text-center py-4">No products available</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Enhanced Pagination -->
    <div id="pagination" class="flex justify-between text-base px-4 mt-2 text-sm items-center">
      <div>
        {{ startPageCount }} - {{ endPageCount }} of {{ filteredProducts.length }}
        <span v-if="isSearching" class="text-gray-500">
          (filtered from {{ props.products.length }} total)
        </span>
      </div>
      <div class="flex gap-2 items-center" v-if="totalPages > 1">
        <div
          class="p-1 cursor-pointer"
          :class="{ 'text-gray-400 cursor-not-allowed': currentPage === 1 }"
          @click="prevPage()"
        >
          <i class="fa fa-angle-left"></i>
        </div>
        <div id="current-page" class="p-1 cursor-pointer">
          <span>
            <input
              type="number"
              min="1"
              :max="totalPages"
              :value="currentPage"
              @input="goToPage(parseInt($event.target.value))"
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
</template>

<script>
// Helper function to highlight search terms
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm || !text) return text

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.toString().replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

export default {
  methods: {
    highlightSearchTerm,
  },
}
</script>

<style scoped>
.hover-table tbody tr:hover {
  background-color: #f3f4f6;
}

mark {
  background-color: #fef08a;
  padding: 2px 4px;
  border-radius: 3px;
}
</style>
