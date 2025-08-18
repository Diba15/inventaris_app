<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import L from 'leaflet'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import axios from 'axios'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

// Reactive variables
const warehouseList = ref([])
const warehouseAddress = ref('')
const isLoading = ref(false)
const error = ref(null)

// API function to get warehouses
const getWarehouse = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await axios.get(`${STRAPI_URL}/api/warehouses`)
    // Handle different response structures from Strapi
    warehouseList.value = response.data.data || response.data || []
    console.log('Warehouses loaded:', warehouseList.value)
  } catch (err) {
    console.error('Error fetching warehouses:', err)
    error.value = 'Failed to load warehouses'
    warehouseList.value = []
  } finally {
    isLoading.value = false
  }
}

// API function to add new warehouse
const addWarehouse = async () => {
  if (!warehouseAddress.value.trim()) {
    alert('Please enter a warehouse address')
    return
  }

  isLoading.value = true
  try {
    const newWarehouse = {
      data: {
        address: warehouseAddress.value,
        code: `WH${Date.now()}`, // Generate simple code
        status: 'Active',
        name: `Warehouse ${warehouseAddress.value.split(',')[0]}`,
        // You might need to geocode the address to get lat/lng
        lat: -6.903 + (Math.random() - 0.5) * 0.1, // Random coordinates for demo
        lng: 107.6191 + (Math.random() - 0.5) * 0.1,
      },
    }

    const response = await axios.post(`${STRAPI_URL}/api/warehouses`, newWarehouse)

    // Add to local list
    const addedWarehouse = response.data.data || response.data
    warehouseList.value.push(addedWarehouse)

    // Clear form
    warehouseAddress.value = ''

    // Add marker to map
    if (map && addedWarehouse.lat && addedWarehouse.lng) {
      addMarkerToMap(addedWarehouse)
    }

    alert('Warehouse added successfully!')
  } catch (err) {
    console.error('Error adding warehouse:', err)
    alert('Failed to add warehouse')
  } finally {
    isLoading.value = false
  }
}

// API function to delete warehouse
const deleteWarehouse = async (warehouseId, warehouseCode) => {
  if (!confirm('Are you sure you want to delete this warehouse?')) {
    return
  }

  isLoading.value = true
  try {
    await axios.delete(`${STRAPI_URL}/api/warehouses/${warehouseId}`)

    // Remove from local list
    warehouseList.value = warehouseList.value.filter((w) => w.id !== warehouseId)

    // Remove marker from map
    if (markers.value[warehouseCode]) {
      map.removeLayer(markers.value[warehouseCode])
      delete markers.value[warehouseCode]
    }

    alert('Warehouse deleted successfully!')
  } catch (err) {
    console.error('Error deleting warehouse:', err)
    alert('Failed to delete warehouse')
  } finally {
    isLoading.value = false
  }
}

// Map instance and markers
let map = null
const markers = ref({})

// Pagination state
const startPage = ref(0)
const currentPage = ref(1)
const sortOrder = ref('asc')
const sortKey = ref('created_at')

// Pagination calculations
const limit = 5
const start = computed(() => startPage.value * limit)
const end = computed(() => startPage.value * limit + limit)

const startPageCount = computed(() => startPage.value * 5 + 1)
const endPageCount = computed(() => {
  const end = startPage.value * 5 + 5
  return end > sortedAllWarehouses.value.length ? sortedAllWarehouses.value.length : end
})

// Computed property to sort ALL warehouses first
const sortedAllWarehouses = computed(() => {
  if (!warehouseList.value || warehouseList.value.length === 0) return []

  return [...warehouseList.value].sort((a, b) => {
    let aValue = a.attributes ? a.attributes[sortKey.value] : a[sortKey.value]
    let bValue = b.attributes ? b.attributes[sortKey.value] : b[sortKey.value]

    if (aValue == null) aValue = ''
    if (bValue == null) bValue = ''

    if (sortKey.value === 'capacity') {
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

// Then paginate the sorted data
const sortedWarehouses = computed(() => {
  return sortedAllWarehouses.value.slice(start.value, end.value)
})

// Function to handle pagination
function nextPage() {
  if (startPage.value < Math.ceil(sortedAllWarehouses.value.length / limit) - 1) {
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
  const totalPages = Math.ceil(sortedAllWarehouses.value.length / limit)
  if (page >= 1 && page <= totalPages) {
    startPage.value = page - 1
    currentPage.value = page
  }
}

// Function to sort warehouses by a key
function sortBy(key) {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  sortKey.value = key
}

// Computed for pagination info
const totalPages = computed(() => Math.ceil(sortedAllWarehouses.value.length / limit))

// Function to create custom popup content
function createWarehousePopup(warehouse) {
  const name = warehouse?.warehouse_name || 'Unknown Warehouse'
  const address = warehouse?.warehouse_address || 'Unknown Address'

  return `
    <div class="warehouse-popup flex gap-4 items-center bg-base">
      <div class="popup-image">
        <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=80&h=80&fit=crop&crop=center"
          alt="Warehouse Interior"
          class="warehouse-img">
      </div>
      <div class="popup-content">
        <h3 class="popup-title font-bold text-[16px]">${name}</h3>
        <div class="popup-address w-full">
          ${address
            .split(',')
            .map((line) => `<div>${line.trim()}</div>`)
            .join('')}
        </div>
      </div>
    </div>
  `
}

// Function to add marker to map
function addMarkerToMap(warehouse) {
  const lat = warehouse?.latitude
  const lng = warehouse?.longitude
  const code = warehouse?.warehouse_code

  if (!lat || !lng || !code) return

  const marker = L.marker([lat, lng]).addTo(map)
  const popupContent = createWarehousePopup(warehouse)
  marker.bindPopup(popupContent)

  // Store marker reference for later use
  markers.value[code] = marker
}

// Function to show location on map
function showLocationOnMap(warehouse) {
  const lat = warehouse?.latitude
  const lng = warehouse?.longitude
  const code = warehouse?.warehouse_code

  if (map && markers.value[code] && lat && lng) {
    // Animate to the selected marker location
    map.setView([lat, lng], 15, {
      animate: true,
      duration: 1.5,
    })

    // Open the popup for the selected marker
    setTimeout(() => {
      markers.value[code].openPopup()
    }, 1000)
  }
}

// Function to get warehouse attribute
function getWarehouseAttribute(warehouse, attr) {
  return warehouse.attributes ? warehouse.attributes[attr] : warehouse[attr]
}

// Watch for changes in warehouse list to update map markers
watch(
  warehouseList,
  (newList) => {
    if (map && newList.length > 0) {
      // Clear existing markers
      Object.values(markers.value).forEach((marker) => {
        map.removeLayer(marker)
      })
      markers.value = {}

      // Add new markers
      newList.forEach((warehouse) => {
        addMarkerToMap(warehouse)
      })
    }
  },
  { deep: true },
)

onMounted(async () => {
  // Load warehouses first
  await getWarehouse()

  // Initialize map
  map = L.map('map').setView([-6.903, 107.6191], 10) // Bandung, Indonesia

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  // Add markers for loaded warehouses
  warehouseList.value.forEach((warehouse) => {
    addMarkerToMap(warehouse)
  })
})

function statusClass(status) {
  switch (status) {
    case 'Active':
      return 'py-1 px-4 bg-green-500 rounded-full w-fit text-white text-sm'
    case 'Inactive':
      return 'py-1 px-4 bg-red-500 rounded-full w-fit text-white text-sm'
    case 'Maintenance':
      return 'py-1 px-4 bg-yellow-500 rounded-full w-fit text-white text-sm'
    default:
      return 'py-1 px-4 bg-gray-500 rounded-full w-fit text-white text-sm'
  }
}
</script>

<template>
  <div class="flex flex-col gap-10 mx-4 my-4 h-full">
    <!-- Error message -->
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    >
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
      <button @click="getWarehouse" class="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm">
        Retry
      </button>
    </div>

    <div class="bg-white rounded-xl shadow min-h-8/12">
      <div
        class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <h1 class="text-xl font-bold self-start md:self-center">Warehouse Map</h1>
      </div>
      <div id="map" class="w-full h-full min-h-[400px]"></div>
    </div>

    <div class="flex flex-col md:flex-row mt-10 pb-10 gap-4">
      <!-- Table Warehouse -->
      <div class="rounded-xl max-h-fit w-full">
        <div class="flex flex-col gap-4">
          <!-- Enhanced Table -->
          <div class="warehouse-grid overflow-x-auto shadow-lg rounded-xl w-full">
            <table
              class="w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden hover-table"
            >
              <thead class="bg-base text-white">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                    @click="sortBy('code')"
                  >
                    Code
                    <span v-if="sortKey === 'code'">
                      <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                    </span>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                    @click="sortBy('address')"
                  >
                    Address
                    <span v-if="sortKey === 'address'">
                      <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                    </span>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                    @click="sortBy('status')"
                  >
                    Status
                    <span v-if="sortKey === 'status'">
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
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 text-base text-sm">
                <tr
                  v-for="(warehouse, index) in sortedWarehouses"
                  :key="getWarehouseAttribute(warehouse, 'code') || warehouse.id"
                  :class="[
                    'hover:bg-gray-300 transition-colors',
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
                  ]"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ getWarehouseAttribute(warehouse, 'warehouse_code') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                    {{ getWarehouseAttribute(warehouse, 'warehouse_address') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <p :class="statusClass(getWarehouseAttribute(warehouse, 'status_warehouse'))">
                      {{ getWarehouseAttribute(warehouse, 'status_warehouse') }}
                    </p>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{
                      new Date(
                        getWarehouseAttribute(warehouse, 'created_at') ||
                          getWarehouseAttribute(warehouse, 'createdAt'),
                      ).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                    <div class="text-blue-500 hover:text-blue-700 text-xl">
                      <button
                        @click="showLocationOnMap(warehouse)"
                        class="hover:scale-110 transition-transform"
                        :title="`View ${getWarehouseAttribute(warehouse, 'name')} on map`"
                      >
                        <i class="fa-solid fa-eye"></i>
                      </button>
                    </div>
                    <button
                      @click="
                        deleteWarehouse(warehouse.id, getWarehouseAttribute(warehouse, 'code'))
                      "
                      class="text-red-500 hover:text-red-700 text-xl hover:scale-110 transition-transform"
                      :disabled="isLoading"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>

                <!-- No results state -->
                <tr v-if="sortedAllWarehouses.length === 0 && !isLoading">
                  <td colspan="5" class="text-center py-8">
                    <div class="text-gray-500">
                      <i class="fa-solid fa-warehouse text-4xl mb-2"></i>
                      <p>No warehouses available</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Enhanced Pagination -->
          <div
            id="pagination"
            class="flex justify-between text-base px-4 text-sm items-center"
            v-if="!isLoading"
          >
            <div>{{ startPageCount }} - {{ endPageCount }} of {{ sortedAllWarehouses.length }}</div>
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

      <!-- Add Warehouse -->
      <div class="bg-white rounded-xl shadow w-full h-fit">
        <div
          class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
        >
          <h1 class="text-xl font-bold self-start md:self-center">Add Warehouse</h1>
        </div>
        <div class="px-6 py-2">
          <form @submit.prevent="addWarehouse" class="flex flex-col gap-4 my-4">
            <div class="flex flex-col gap-4 w-full">
              <StandardFloatingInput
                id="address"
                type="text"
                name="address"
                placeholder="Warehouse Address"
                label="Warehouse Address"
                v-model="warehouseAddress"
                class="max-w-md w-full"
                required
              />
              <button
                type="submit"
                :disabled="isLoading || !warehouseAddress.trim()"
                class="bg-sub text-white px-4 py-2 w-fit h-[40px] rounded-xl hover:bg-yellow-600 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Adding...' : 'Add Warehouse' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom popup styles */
:deep(.leaflet-popup-content-wrapper) {
  background: #4a5568;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  padding: 0;
  overflow: hidden;
  color: white;
}

:deep(.leaflet-popup-content) {
  margin: 0;
  padding: 0;
  min-width: 280px;
  max-width: 280px;
}

:deep(.leaflet-popup-tip) {
  background: #4a5568;
  border-top: none;
  border-left: none;
  border-right: none;
}

.warehouse-popup {
  display: flex;
  background: #4a5568;
  color: white;
  font-family: 'Inter', sans-serif;
}

.popup-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background: #718096;
  border-radius: 8px 0 0 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.warehouse-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px 0 0 8px;
}

.popup-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.popup-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
}

.popup-address {
  font-size: 12px;
  line-height: 1.4;
  color: #e2e8f0;
}

.popup-address div {
  margin-bottom: 2px;
}

/* Warehouse table styles */
.warehouse-grid {
  overflow-x: auto;
}

.hover-table tbody tr:hover {
  background-color: #f3f4f6;
}

/* Loading animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
