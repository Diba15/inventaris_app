<script setup>
import { ref, computed, nextTick, watchEffect, onMounted } from 'vue'
import SupplierCard from '@/components/supplier/SupplierCard.vue'

const dummySupplierList = ref([
  {
    id: 1,
    name: 'Supplier 1',
    arrive_at: '2022-01-01',
    courier_name: 'JNE',
    total_cost: 10000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-01 00:00:00',
  },
  {
    id: 2,
    name: 'Supplier 2',
    arrive_at: '2022-01-02',
    courier_name: 'J&T',
    total_cost: 20000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-02 00:00:00',
  },
  {
    id: 3,
    name: 'Supplier 3',
    arrive_at: '2022-01-03',
    courier_name: 'SiCepat',
    total_cost: 30000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-03 00:00:00',
  },
  {
    id: 4,
    name: 'Supplier 4',
    arrive_at: '2022-01-04',
    courier_name: 'JNE',
    total_cost: 40000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-04 00:00:00',
  },
  {
    id: 5,
    name: 'Supplier 5',
    arrive_at: '2022-01-05',
    courier_name: 'J&T',
    total_cost: 50000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-05 00:00:00',
  },
  {
    id: 6,
    name: 'Supplier 6',
    arrive_at: '2022-01-06',
    courier_name: 'SiCepat',
    total_cost: 60000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-06 00:00:00',
  },
  {
    id: 7,
    name: 'Supplier 7',
    arrive_at: '2022-01-07',
    courier_name: 'JNE',
    total_cost: 70000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-07 00:00:00',
  },
  {
    id: 8,
    name: 'Supplier 8',
    arrive_at: '2022-01-08',
    courier_name: 'J&T',
    total_cost: 80000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-08 00:00:00',
  },
  {
    id: 9,
    name: 'Supplier 9',
    arrive_at: '2022-01-09',
    courier_name: 'SiCepat',
    total_cost: 90000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-09 00:00:00',
  },
  {
    id: 10,
    name: 'Supplier 10',
    arrive_at: '2022-01-10',
    courier_name: 'JNE',
    total_cost: 100000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-10 00:00:00',
  },
])

// Props for emits (similar to products component)
const emit = defineEmits(['deleteSupplier', 'openDeleteModal'])

// Enhanced state management
const startPage = ref(0)
const totalData = ref(0)
const currentPage = ref(1)
const searchTerm = ref('') // Add reactive search term
const sortOrder = ref('asc')
const sortKey = ref('name')

// Pagination calculations
const startPageCount = computed(() => startPage.value * 5 + 1)
const endPageCount = computed(() => {
  const end = startPage.value * 5 + 5
  return end > filteredSuppliers.value.length ? filteredSuppliers.value.length : end
})

onMounted(() => {
  watchEffect(() => {
    totalData.value = filteredSuppliers.value.length
  })
})

// Enhanced search functionality for both table and cards
const filteredSuppliers = computed(() => {
  if (!searchTerm.value.trim()) {
    return dummySupplierList.value
  }

  const search = searchTerm.value.toLowerCase().trim()

  return dummySupplierList.value.filter((supplier) => {
    // Search in multiple fields
    const searchableFields = [
      supplier.name?.toLowerCase() || '',
      supplier.arrive_at?.toLowerCase() || '',
      supplier.courier_name?.toLowerCase() || '',
      supplier.total_cost?.toString() || '',
      supplier.other?.toLowerCase() || '',
      supplier.created_at?.toLowerCase() || '',
    ]

    // Check if any field contains the search term
    return searchableFields.some((field) => field.includes(search))
  })
})

// Filtered suppliers for card carousel
const filteredSuppliersForCards = computed(() => filteredSuppliers.value)

// Filter suppliers per page
const limit = 5
const start = computed(() => startPage.value * limit)
const end = computed(() => startPage.value * limit + limit)

const paginatedSuppliers = computed(() => {
  return filteredSuppliers.value.slice(start.value, end.value)
})

// Computed property to sort suppliers based on the selected key and order
const sortedSuppliers = computed(() => {
  return [...paginatedSuppliers.value].sort((a, b) => {
    let aValue = a[sortKey.value]
    let bValue = b[sortKey.value]

    // Handle null/undefined values
    if (aValue == null) aValue = ''
    if (bValue == null) bValue = ''

    // Convert to string for comparison (except for numbers)
    if (sortKey.value === 'total_cost') {
      aValue = parseFloat(aValue) || 0
      bValue = parseFloat(bValue) || 0
    } else {
      aValue = aValue.toString().toLowerCase()
      bValue = bValue.toString().toLowerCase()
    }

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1

    return 0
  })
})

// Function to handle pagination
function nextPage() {
  if (startPage.value < Math.ceil(filteredSuppliers.value.length / limit) - 1) {
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
  const totalPages = Math.ceil(filteredSuppliers.value.length / limit)
  if (page >= 1 && page <= totalPages) {
    startPage.value = page - 1
    currentPage.value = page
  }
}

// Function to sort suppliers by a key ascending and descending
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
    const searchInput = document.querySelector('#searchSupplier')
    const pageInput = document.querySelector('#current-page input')
    if (searchInput) searchInput.value = ''
    if (pageInput) pageInput.value = 1
  })
}

// Function to open delete modal
function openDeleteModal(id) {
  emit('openDeleteModal', id)
}

// Computed for pagination info
const totalPages = computed(() => Math.ceil(filteredSuppliers.value.length / limit))
const hasResults = computed(() => filteredSuppliers.value.length > 0)
const isSearching = computed(() => searchTerm.value.trim().length > 0)

// Helper function to highlight search terms
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm || !text) return text

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.toString().replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}
</script>

<template>
  <div class="flex flex-col mx-4 my-10 gap-6">
    <div class="bg-white rounded-xl mb-4 shadow">
      <div
        class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <h1 class="text-xl font-bold self-start md:self-center">Suppliers</h1>
      </div>

      <div class="py-4 px-8 flex flex-col gap-4">
        <!-- Enhanced Search Bar -->
        <div class="flex items-center px-0 relative justify-center">
          <input
            type="text"
            id="searchSupplier"
            placeholder="Search suppliers by name, courier, cost, or description..."
            class="mb-2 p-2.5 rounded-s-xl w-full max-w-[600px] bg-white border-l border-t border-b border-black text-base focus:outline-none placeholder:text-center"
            @input="handleSearch"
            :value="searchTerm"
          />

          <!-- Clear search button -->
          <button
            v-if="isSearching"
            @click="clearSearch"
            class="mb-2 bg-white p-2.5 border-t border-b border-black text-gray-500 hover:text-gray-700 focus:outline-none"
            title="Clear search"
          >
            <i class="fa fa-times"></i>
          </button>

          <!-- Search icon -->
          <i
            class="mb-2 fa fa-search text-xl focus:outline-none bg-white px-2.5 py-3 rounded-e-xl text-gray-400 border-r border-t border-b border-black"
          ></i>
        </div>

        <!-- Search Results Info for Cards -->
        <div v-if="isSearching" class="px-0 mb-2 text-sm text-gray-600">
          <span v-if="filteredSuppliersForCards.length > 0">
            Found {{ filteredSuppliersForCards.length }} supplier(s) for "{{ searchTerm }}"
          </span>
          <span v-else class="text-orange-600"> No suppliers found for "{{ searchTerm }}" </span>
        </div>

        <!-- Enhanced Supplier Carousel -->
        <div
          id="supplier-carousel"
          class="flex flex-nowrap gap-10 items-center overflow-x-scroll max-w-screen"
        >
          <!-- Show filtered suppliers in cards -->
          <supplier-card
            v-for="supplier in filteredSuppliersForCards"
            :key="supplier.id"
            :name="supplier.name"
            :courier="supplier.courier_name"
            :cost="supplier.total_cost"
            :arrive-date="supplier.arrive_at"
            class="supplier-card-item"
            :class="{ highlighted: isSearching }"
          />

          <!-- No results state for cards -->
          <div
            v-if="!filteredSuppliersForCards.length && isSearching"
            class="flex flex-col items-center justify-center text-gray-400 min-w-[300px] p-8 border-2 border-dashed border-gray-300 rounded-lg"
          >
            <i class="fa fa-search text-4xl mb-2"></i>
            <p class="text-lg">No suppliers found</p>
            <p class="text-sm">Try different search terms</p>
            <button
              @click="clearSearch"
              class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Clear Search
            </button>
          </div>

          <!-- Add Supplier Button - always visible -->
          <div
            class="flex flex-col items-center text-base text-2xl font-extrabold cursor-pointer min-w-fit"
          >
            <h1>Tambah Supplier</h1>
            <i class="fa-solid fa-plus text-4xl"></i>
          </div>
        </div>
      </div>
    </div>

    <div>
      <!-- Enhanced Table -->
      <div class="product-grid overflow-x-auto shadow-lg rounded-xl">
        <table
          class="w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden hover-table"
        >
          <thead class="bg-base text-white">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                @click="sortBy('arrive_at')"
              >
                Arrive At
                <span v-if="sortKey === 'arrive_at'">
                  <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                </span>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                @click="sortBy('name')"
              >
                Supplier
                <span v-if="sortKey === 'name'">
                  <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                </span>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                @click="sortBy('courier_name')"
              >
                Courier Name
                <span v-if="sortKey === 'courier_name'">
                  <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                </span>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                @click="sortBy('total_cost')"
              >
                Total Cost
                <span v-if="sortKey === 'total_cost'">
                  <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                </span>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                @click="sortBy('created_at')"
              >
                Created At
                <span v-if="sortKey === 'created_at'">
                  <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                </span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 text-base text-sm">
            <tr
              v-for="(supplier, index) in sortedSuppliers"
              :key="supplier.id"
              :class="[
                'hover:bg-gray-300 transition-colors',
                index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
              ]"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-html="highlightSearchTerm(supplier.arrive_at, searchTerm)"></span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-html="highlightSearchTerm(supplier.name, searchTerm)"></span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-html="highlightSearchTerm(supplier.courier_name, searchTerm)"></span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                Rp.<span
                  v-html="highlightSearchTerm(supplier.total_cost?.toString() || '', searchTerm)"
                ></span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{
                  new Date(supplier.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                <div class="text-blue-500 hover:text-blue-700 text-xl">
                  <button>
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
                <button
                  class="text-red-500 hover:text-red-700 text-xl"
                  @click="openDeleteModal(supplier.id)"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </td>
            </tr>

            <!-- No results states -->
            <tr v-if="!hasResults && isSearching">
              <td colspan="7" class="text-center py-8 text-gray-500">
                <div class="flex flex-col items-center">
                  <i class="fa fa-search text-4xl mb-2 text-gray-300"></i>
                  <p class="text-lg">No suppliers found</p>
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
              <td colspan="7" class="text-center py-4">No suppliers available</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Enhanced Pagination -->
      <div id="pagination" class="flex justify-between text-base px-4 mt-2 text-sm items-center">
        <div>
          {{ startPageCount }} - {{ endPageCount }} of {{ filteredSuppliers.length }}
          <span v-if="isSearching" class="text-gray-500">
            (filtered from {{ dummySupplierList.length }} total)
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
  </div>
</template>

<style scoped>
#supplier-carousel::-webkit-scrollbar {
  display: none;
}

.hover-table tbody tr:hover {
  background-color: #f3f4f6;
}

mark {
  background-color: #fef08a;
  padding: 2px 4px;
  border-radius: 3px;
}
</style>
