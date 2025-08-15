<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import L from 'leaflet'

// Dummy warehouse data
const warehouseList = ref([
  {
    id: 1,
    name: 'Gudang 1',
    address: 'Jl. Salak, Lkr. Sel., Kec. Lengkong, Kota Bandung, Jawa Barat 40263',
    capacity: '1000 m²',
    status: 'Active',
    manager: 'John Doe',
    created_at: '2024-01-15 00:00:00',
  },
  {
    id: 2,
    name: 'Gudang 2',
    address: 'Jl. Sudirman, Jakarta Pusat, DKI Jakarta 10110',
    capacity: '1500 m²',
    status: 'Active',
    manager: 'Jane Smith',
    created_at: '2024-01-20 00:00:00',
  },
  {
    id: 3,
    name: 'Gudang 3',
    address: 'Jl. Thamrin, Jakarta Selatan, DKI Jakarta 12190',
    capacity: '800 m²',
    status: 'Maintenance',
    manager: 'Bob Johnson',
    created_at: '2024-02-01 00:00:00',
  },
  {
    id: 4,
    name: 'Gudang 4',
    address: 'Jl. Gatot Subroto, Jakarta Selatan, DKI Jakarta 12930',
    capacity: '2000 m²',
    status: 'Active',
    manager: 'Alice Brown',
    created_at: '2024-02-10 00:00:00',
  },
  {
    id: 5,
    name: 'Gudang 5',
    address: 'Jl. Hayam Wuruk, Jakarta Barat, DKI Jakarta 11180',
    capacity: '1200 m²',
    status: 'Active',
    manager: 'Charlie Wilson',
    created_at: '2024-02-15 00:00:00',
  },
  {
    id: 6,
    name: 'Gudang 6',
    address: 'Jl. Asia Afrika, Kota Bandung, Jawa Barat 40111',
    capacity: '900 m²',
    status: 'Inactive',
    manager: 'Dewi Lestari',
    created_at: '2024-03-01 00:00:00',
  },
  {
    id: 7,
    name: 'Gudang 7',
    address: 'Jl. Diponegoro, Kota Bandung, Jawa Barat 40115',
    capacity: '1100 m²',
    status: 'Active',
    manager: 'Rudi Hartono',
    created_at: '2024-03-10 00:00:00',
  },
  {
    id: 8,
    name: 'Gudang 8',
    address: 'Jl. Merdeka, Kota Bandung, Jawa Barat 40117',
    capacity: '1300 m²',
    status: 'Maintenance',
    manager: 'Siti Aminah',
    created_at: '2024-03-15 00:00:00',
  },
  {
    id: 9,
    name: 'Gudang 9',
    address: 'Jl. Braga, Kota Bandung, Jawa Barat 40111',
    capacity: '950 m²',
    status: 'Active',
    manager: 'Andi Wijaya',
    created_at: '2024-03-20 00:00:00',
  },
  {
    id: 10,
    name: 'Gudang 10',
    address: 'Jl. Cihampelas, Kota Bandung, Jawa Barat 40131',
    capacity: '1050 m²',
    status: 'Inactive',
    manager: 'Maya Sari',
    created_at: '2024-03-25 00:00:00',
  },
  {
    id: 11,
    name: 'Gudang 11',
    address: 'Jl. Setiabudi, Kota Bandung, Jawa Barat 40141',
    capacity: '1700 m²',
    status: 'Active',
    manager: 'Budi Santoso',
    created_at: '2024-04-01 00:00:00',
  },
  {
    id: 12,
    name: 'Gudang 12',
    address: 'Jl. Pasteur, Kota Bandung, Jawa Barat 40161',
    capacity: '1600 m²',
    status: 'Maintenance',
    manager: 'Lina Marlina',
    created_at: '2024-04-05 00:00:00',
  },
  {
    id: 13,
    name: 'Gudang 13',
    address: 'Jl. Dago, Kota Bandung, Jawa Barat 40135',
    capacity: '1400 m²',
    status: 'Active',
    manager: 'Agus Salim',
    created_at: '2024-04-10 00:00:00',
  },
  {
    id: 14,
    name: 'Gudang 14',
    address: 'Jl. Riau, Kota Bandung, Jawa Barat 40115',
    capacity: '1250 m²',
    status: 'Inactive',
    manager: 'Yuni Astuti',
    created_at: '2024-04-15 00:00:00',
  },
  {
    id: 15,
    name: 'Gudang 15',
    address: 'Jl. Sukajadi, Kota Bandung, Jawa Barat 40162',
    capacity: '1800 m²',
    status: 'Active',
    manager: 'Fajar Pratama',
    created_at: '2024-04-20 00:00:00',
  },
])

// Simple state management for pagination only
const startPage = ref(0)
const currentPage = ref(1)
const sortOrder = ref('asc')
const sortKey = ref('name')

// Pagination calculations
const limit = 5
const start = computed(() => startPage.value * limit)
const end = computed(() => startPage.value * limit + limit)

const startPageCount = computed(() => startPage.value * 5 + 1)
const endPageCount = computed(() => {
  const end = startPage.value * 5 + 5
  return end > warehouseList.value.length ? warehouseList.value.length : end
})

// Filter warehouses per page
const paginatedWarehouses = computed(() => {
  return warehouseList.value.slice(start.value, end.value)
})

// Computed property to sort warehouses
const sortedWarehouses = computed(() => {
  return [...paginatedWarehouses.value].sort((a, b) => {
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

// Function to handle pagination
function nextPage() {
  if (startPage.value < Math.ceil(warehouseList.value.length / limit) - 1) {
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
  const totalPages = Math.ceil(warehouseList.value.length / limit)
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
const totalPages = computed(() => Math.ceil(warehouseList.value.length / limit))

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

onMounted(() => {
  // Import Leaflet dynamically to avoid SSR issues
  let map = L.map('map').setView([-6.2088, 106.8456], 13) // Jakarta, Indonesia

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  // Contoh menambahkan multiple markers
  const warehouseLocations = [
    {
      lat: -6.2088,
      lng: 106.8456,
      name: 'Gudang 1',
      address: 'Jl. Salak, Lkr. Sel., Kec. Lengkong, Kota Bandung, Jawa Barat 40263',
    },
    {
      lat: -6.1751,
      lng: 106.865,
      name: 'Gudang 2',
      address: 'Jl. Sudirman, Jakarta Pusat, DKI Jakarta 10110',
    },
    {
      lat: -6.2088,
      lng: 106.8456,
      name: 'Gudang 3',
      address: 'Jl. Thamrin, Jakarta Selatan, DKI Jakarta 12190',
    },
  ]

  warehouseLocations.forEach((location) => {
    const marker = L.marker([location.lat, location.lng]).addTo(map)
    const popupContent = createWarehousePopup(location.name, location.address)
    marker.bindPopup(popupContent)
  })
})
</script>

<template>
  <div class="flex flex-col gap-10 mx-4 my-4 h-full">
    <div class="bg-white rounded-xl shadow max-h-screen h-full">
      <div
        class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <h1 class="text-xl font-bold self-start md:self-center">Warehouse</h1>
      </div>
      <div id="map" class="w-full h-full"></div>
    </div>

    <div class="flex mt-10 gap-4">
      <div class="rounded-xl max-h-[100px] h-full max-w-xl w-full">
        <div class="flex flex-col gap-4">
          <!-- Enhanced Table -->
          <div class="warehouse-grid overflow-x-auto shadow-lg rounded-xl">
            <table
              class="w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden hover-table"
            >
              <thead class="bg-base text-white">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    No
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
                    @click="sortBy('manager')"
                  >
                    Manager
                    <span v-if="sortKey === 'manager'">
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
                  :key="warehouse.id"
                  :class="[
                    'hover:bg-gray-300 transition-colors',
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
                  ]"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ startPageCount + index }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                    {{ warehouse.address }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ warehouse.manager }}
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
                      <button>
                        <i class="fa-solid fa-eye"></i>
                      </button>
                    </div>
                    <button class="text-red-500 hover:text-red-700 text-xl">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>

                <!-- No results state -->
                <tr v-if="warehouseList.length === 0">
                  <td colspan="8" class="text-center py-4">No warehouses available</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Enhanced Pagination -->
          <div id="pagination" class="flex justify-between text-base px-4 text-sm items-center">
            <div>{{ startPageCount }} - {{ endPageCount }} of {{ warehouseList.length }}</div>
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
      <div class="bg-white rounded-xl shadow w-full">
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
            <div class="flex flex-col md:flex-row gap-4 items-center w-full">
              <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-col md:flex-row gap-4">
                  <AutoCompleteInput
                    id="product_category"
                    label="Select Category"
                    placeholder="Type to search categories..."
                    v-model="selectedCategory"
                    :options="categories"
                    option-label="category"
                    option-value="category"
                    :required="true"
                    class="w-full max-w-md"
                    @select="handleCategorySelect"
                  />
                  <input
                    name="product_code"
                    type="text"
                    class="border border-base p-2 rounded w-full max-w-fit bg-gray-100 text-base"
                    v-model="codeProduct"
                    disabled
                  />
                </div>
                <div class="flex flex-col flex-wrap gap-4 w-full">
                  <div class="flex flex-col md:flex-row gap-4">
                    <StandardFloatingInput
                      id="product_name"
                      type="text"
                      name="product_name"
                      placeholder="Product Name"
                      label="Product Name"
                      v-model="nameProduct"
                      class="max-w-md w-full"
                    />
                    <StandardFloatingInput
                      id="product_description"
                      type="text"
                      name="product_description"
                      placeholder="Description"
                      label="Description"
                      v-model="descriptionProduct"
                      class="max-w-md w-full"
                    />
                  </div>
                  <div class="flex flex-col md:flex-row gap-4">
                    <StandardFloatingInput
                      id="product_price"
                      type="text"
                      name="product_price"
                      placeholder="Price"
                      label="Price"
                      v-model="priceProduct"
                      class="max-w-md w-full"
                      @handlePriceInput="handlePriceInput"
                    />
                    <StandardFloatingInput
                      id="product_qty"
                      type="number"
                      name="product_qty"
                      placeholder="Quantity"
                      label="Quantity"
                      v-model="quantityProduct"
                      class="max-w-md w-full"
                    />
                  </div>
                </div>
              </div>
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
