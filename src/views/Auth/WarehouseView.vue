<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import TableWarehouse from '@/components/warehouse/TableWarehouse.vue'
import AutoCompleteInput from '@/components/AutoCompleteInput.vue'
import axios from 'axios'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

// Reactive variables
const warehouseList = ref([])
const isLoading = ref(false)
const error = ref(null)

// Warehouse Input Ref
const warehouseAddress = ref('')
const warehouseName = ref('')
const warehouseLat = ref('')
const warehouseLng = ref('')
const warehouseCode = ref('')
const warehouseStatus = ref('Active')

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Maintenance', label: 'Maintenance' },
]

function codeGenerator() {
  const existingCodes = warehouseList.value
    .map((w) => getWarehouseAttribute(w, 'code'))
    .filter((code) => /^G\d+$/.test(code))

  if (existingCodes.length === 0) {
    return 'G1'
  }

  const numbers = existingCodes.map((code) => parseInt(code.slice(1), 10))
  const maxNumber = Math.max(...numbers)

  return `G${maxNumber + 1}`
}

// Map instance and markers
let map = null
const markers = ref({})

// Helper function to get warehouse attribute (handles both Strapi and regular objects)
function getWarehouseAttribute(warehouse, attribute) {
  // For Strapi format (warehouse.attributes.field)
  if (warehouse.attributes && warehouse.attributes[attribute] !== undefined) {
    return warehouse.attributes[attribute]
  }

  // For regular object format (warehouse.field)
  if (warehouse[attribute] !== undefined) {
    return warehouse[attribute]
  }

  // Handle common field mappings
  const fieldMappings = {
    code: ['warehouse_code', 'code'],
    address: ['warehouse_address', 'address'],
    status: ['status_warehouse', 'status'],
    name: ['warehouse_name', 'name'],
    lat: ['latitude', 'lat'],
    lng: ['longitude', 'lng'],
  }

  if (fieldMappings[attribute]) {
    for (const field of fieldMappings[attribute]) {
      if (warehouse.attributes && warehouse.attributes[field] !== undefined) {
        return warehouse.attributes[field]
      }
      if (warehouse[field] !== undefined) {
        return warehouse[field]
      }
    }
  }

  return null
}

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
        warehouse_address: warehouseAddress.value,
        warehouse_code: warehouseCode.value,
        status_warehouse: warehouseStatus.value || 'Active',
        warehouse_name: warehouseName.value || 'Unnamed Warehouse',
        latitude: warehouseLat.value,
        longitude: warehouseLng.value,
      },
    }

    const response = await axios.post(`${STRAPI_URL}/api/warehouses`, newWarehouse)

    // Add to local list
    const addedWarehouse = response.data.data || response.data
    warehouseList.value.push(addedWarehouse)

    // Clear form
    warehouseAddress.value = ''
    warehouseName.value = ''
    warehouseLat.value = ''
    warehouseLng.value = ''
    warehouseCode.value = codeGenerator()
    warehouseStatus.value = 'Active'

    // Add marker to map
    if (map && addedWarehouse) {
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

// Function to create custom popup content
function createWarehousePopup(warehouse) {
  const name = getWarehouseAttribute(warehouse, 'name') || 'Unknown Warehouse'
  const address = getWarehouseAttribute(warehouse, 'address') || 'Unknown Address'

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
  const lat = getWarehouseAttribute(warehouse, 'lat')
  const lng = getWarehouseAttribute(warehouse, 'lng')
  const code = getWarehouseAttribute(warehouse, 'code')

  if (!lat || !lng || !code) {
    console.warn('Missing coordinates or code for warehouse:', warehouse)
    return
  }

  const marker = L.marker([lat, lng]).addTo(map)
  const popupContent = createWarehousePopup(warehouse)
  marker.bindPopup(popupContent)

  // Store marker reference for later use
  markers.value[code] = marker
}

// Function to show location on map
function showLocationOnMap(warehouse) {
  const lat = getWarehouseAttribute(warehouse, 'lat')
  const lng = getWarehouseAttribute(warehouse, 'lng')
  const code = getWarehouseAttribute(warehouse, 'code')

  console.log('Showing location:', { lat, lng, code, warehouse })

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
  } else {
    console.warn('Cannot show location - missing map, marker, or coordinates')
  }
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

  warehouseCode.value = codeGenerator()

  // Initialize map
  map = L.map('map').setView([-6.903, 107.6191], 10) // Bandung, Indonesia

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  console.log('Map initialized, adding markers for', warehouseList.value.length, 'warehouses')

  // Add markers for loaded warehouses
  warehouseList.value.forEach((warehouse) => {
    addMarkerToMap(warehouse)
  })
})
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
        <div v-if="isLoading" class="text-sm">
          <i class="fa-solid fa-spinner fa-spin mr-2"></i>
          Loading...
        </div>
      </div>
      <div id="map" class="w-full h-full min-h-[400px]"></div>
    </div>

    <div class="flex flex-col md:flex-row-reverse mt-10 pb-10 gap-4">
      <!-- Table Warehouse -->
      <TableWarehouse
        :warehouseList="warehouseList"
        @deleteWarehouse="deleteWarehouse"
        @showLocationOnMap="showLocationOnMap"
      />

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
              <div class="flex flex-col md:flex-row gap-4">
                <StandardFloatingInput
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Warehouse Name"
                  label="Warehouse Name"
                  v-model="warehouseName"
                  class="max-w-md w-full"
                  required
                />
                <StandardFloatingInput
                  id="code"
                  type="text"
                  name="code"
                  placeholder="Warehouse Code"
                  label="Warehouse Code"
                  v-model="warehouseCode"
                  class="max-w-md w-full"
                  required
                  disabled
                />
              </div>
              <StandardFloatingInput
                id="address"
                type="text"
                name="address"
                placeholder="Warehouse Address"
                label="Warehouse Address"
                v-model="warehouseAddress"
                class=" w-full"
                required
              />
              <div class="flex flex-col md:flex-row gap-4">
                <StandardFloatingInput
                  id="warehouseLat"
                  type="text"
                  name="warehouseLat"
                  placeholder="Latitude"
                  label="Latitude"
                  v-model="warehouseLat"
                  class="max-w-md w-full"
                  required
                />
                <StandardFloatingInput
                  id="warehouseLng"
                  type="text"
                  name="warehouseLng"
                  placeholder="Longitude"
                  label="Longitude"
                  v-model="warehouseLng"
                  class="max-w-md w-full"
                  required
                />
              </div>
              <AutoCompleteInput
                id="status"
                label="Status"
                v-model="warehouseStatus"
                :options="statusOptions"
                class="w-full"
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
</style>
