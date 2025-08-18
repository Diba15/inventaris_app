<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import L from 'leaflet'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'

// Dummy warehouse data
const warehouseList = ref([
  {
    code: 'G1',
    name: 'Gudang 1',
    address: 'Jl. Salak, Lkr. Sel., Kec. Lengkong, Kota Bandung, Jawa Barat 40263',
    capacity: '1000 m²',
    status: 'Active',
    lat: -6.9175,
    lng: 107.6191,
    created_at: '2024-01-15 00:00:00',
  },
  {
    code: 'G2',
    name: 'Gudang 2',
    address: 'Jl. Sudirman, Jakarta Pusat, DKI Jakarta 10110',
    capacity: '1500 m²',
    status: 'Active',
    lat: -6.1944,
    lng: 106.8229,
    created_at: '2024-01-20 00:00:00',
  },
  {
    code: 'G3',
    name: 'Gudang 3',
    address: 'Jl. Thamrin, Jakarta Selatan, DKI Jakarta 12190',
    capacity: '800 m²',
    status: 'Maintenance',
    lat: -6.1944,
    lng: 106.8229,
    created_at: '2024-02-01 00:00:00',
  },
  {
    code: 'G4',
    name: 'Gudang 4',
    address: 'Jl. Gatot Subroto, Jakarta Selatan, DKI Jakarta 12930',
    capacity: '2000 m²',
    status: 'Active',
    lat: -6.2088,
    lng: 106.8456,
    created_at: '2024-02-10 00:00:00',
  },
  {
    code: 'G5',
    name: 'Gudang 5',
    address: 'Jl. Hayam Wuruk, Jakarta Barat, DKI Jakarta 11180',
    capacity: '1200 m²',
    status: 'Active',
    lat: -6.1468,
    lng: 106.8271,
    created_at: '2024-02-15 00:00:00',
  },
  {
    code: 'G6',
    name: 'Gudang 6',
    address: 'Jl. Asia Afrika, Kota Bandung, Jawa Barat 40111',
    capacity: '900 m²',
    status: 'Inactive',
    lat: -6.9218,
    lng: 107.6071,
    created_at: '2024-03-01 00:00:00',
  },
  {
    code: 'G7',
    name: 'Gudang 7',
    address: 'Jl. Diponegoro, Kota Bandung, Jawa Barat 40115',
    capacity: '1100 m²',
    status: 'Active',
    lat: -6.903,
    lng: 107.6132,
    created_at: '2024-03-10 00:00:00',
  },
  {
    code: 'G8',
    name: 'Gudang 8',
    address: 'Jl. Merdeka, Kota Bandung, Jawa Barat 40117',
    capacity: '1300 m²',
    status: 'Maintenance',
    lat: -6.9218,
    lng: 107.6071,
    created_at: '2024-03-15 00:00:00',
  },
  {
    code: 'G9',
    name: 'Gudang 9',
    address: 'Jl. Braga, Kota Bandung, Jawa Barat 40111',
    capacity: '950 m²',
    status: 'Active',
    lat: -6.9175,
    lng: 107.6091,
    created_at: '2024-03-20 00:00:00',
  },
  {
    code: 'G10',
    name: 'Gudang 10',
    address: 'Jl. Cihampelas, Kota Bandung, Jawa Barat 40131',
    capacity: '1050 m²',
    status: 'Inactive',
    lat: -6.8947,
    lng: 107.6063,
    created_at: '2024-03-25 00:00:00',
  },
  {
    code: 'G11',
    name: 'Gudang 11',
    address: 'Jl. Setiabudi, Kota Bandung, Jawa Barat 40141',
    capacity: '1700 m²',
    status: 'Active',
    lat: -6.8736,
    lng: 107.6307,
    created_at: '2024-04-01 00:00:00',
  },
  {
    code: 'G12',
    name: 'Gudang 12',
    address: 'Jl. Pasteur, Kota Bandung, Jawa Barat 40161',
    capacity: '1600 m²',
    status: 'Maintenance',
    lat: -6.8951,
    lng: 107.5733,
    created_at: '2024-04-05 00:00:00',
  },
  {
    code: 'G13',
    name: 'Gudang 13',
    address: 'Jl. Dago, Kota Bandung, Jawa Barat 40135',
    capacity: '1400 m²',
    status: 'Active',
    lat: -6.8667,
    lng: 107.6128,
    created_at: '2024-04-10 00:00:00',
  },
  {
    code: 'G14',
    name: 'Gudang 14',
    address: 'Jl. Riau, Kota Bandung, Jawa Barat 40115',
    capacity: '1250 m²',
    status: 'Inactive',
    lat: -6.903,
    lng: 107.6102,
    created_at: '2024-04-15 00:00:00',
  },
  {
    code: 'G15',
    name: 'Gudang 15',
    address: 'Jl. Sukajadi, Kota Bandung, Jawa Barat 40162',
    capacity: '1800 m²',
    status: 'Active',
    lat: -6.878,
    lng: 107.5936,
    created_at: '2024-04-20 00:00:00',
  },
])

// Reactive Variable
const warehouseAddress = ref('')

// Map instance and markers
let map = null
const markers = ref({})

// Simple state management for pagination only
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
  return [...warehouseList.value].sort((a, b) => {
    let aValue = a[sortKey.value]
    let bValue = b[sortKey.value]

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
function createWarehousePopup(name, address) {
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

// Function to show location on map (FIXED)
function showLocationOnMap(lat, lng, warehouseCode) {
  if (map && markers.value[warehouseCode]) {
    // Animate to the selected marker location
    map.setView([lat, lng], 15, {
      animate: true,
      duration: 1.5
    })

    // Open the popup for the selected marker
    setTimeout(() => {
      markers.value[warehouseCode].openPopup()
    }, 1000)
  }
}

onMounted(() => {
  // Initialize map once
  map = L.map('map').setView([-6.903, 107.6191], 10) // Bandung, Indonesia

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  console.log(warehouseList.value)

  // Add markers and store references
  warehouseList.value.forEach((location) => {
    const marker = L.marker([location.lat, location.lng]).addTo(map)
    const popupContent = createWarehousePopup(location.name, location.address)
    marker.bindPopup(popupContent)

    // Store marker reference for later use
    markers.value[location.code] = marker
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
    <div class="bg-white rounded-xl shadow min-h-8/12">
      <div
        class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <h1 class="text-xl font-bold self-start md:self-center">Warehouse</h1>
      </div>
      <div id="map" class="w-full h-full"></div>
    </div>

    <div class="flex flex-col md:flex-row mt-10 pb-10 gap-4">
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
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 text-base text-sm">
                <tr
                  v-for="(warehouse, index) in sortedWarehouses"
                  :key="warehouse.code"
                  :class="[
                    'hover:bg-gray-300 transition-colors',
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
                  ]"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ warehouse.code }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                    {{ warehouse.address }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <p :class="statusClass(warehouse.status)">{{ warehouse.status }}</p>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{
                      new Date(warehouse.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                    <div class="text-blue-500 hover:text-blue-700 text-xl">
                      <button
                        @click="showLocationOnMap(warehouse.lat, warehouse.lng, warehouse.code)"
                        class="hover:scale-110 transition-transform"
                        :title="`View ${warehouse.name} on map`"
                      >
                        <i class="fa-solid fa-eye"></i>
                      </button>
                    </div>
                    <button class="text-red-500 hover:text-red-700 text-xl hover:scale-110 transition-transform">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>

                <!-- No results state -->
                <tr v-if="sortedAllWarehouses.length === 0">
                  <td colspan="8" class="text-center py-4">No warehouses available</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Enhanced Pagination -->
          <div id="pagination" class="flex justify-between text-base px-4 text-sm items-center">
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
          <form
            method="post"
            enctype="multipart/form-data"
            action=""
            id="add_product"
            class="flex flex-col gap-4 my-4"
            @submit.prevent
          >
            <div class="flex flex-col gap-4 w-full">
              <StandardFloatingInput
                id="address"
                type="text"
                name="address"
                placeholder="Warehouse Address"
                label="Warehouse Address"
                v-model="warehouseAddress"
                class="max-w-md w-full"
              />
              <button
                type="button"
                class="bg-sub text-white px-4 py-2 w-fit h-[40px] rounded-xl hover:bg-yellow-600 transition-colors cursor-pointer"
              >
                Add Product
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
</style>
