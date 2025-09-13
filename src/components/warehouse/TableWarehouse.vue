<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  warehouseList: {
    type: Array,
    default: () => [],
  },
})

// Reactive variables
const isLoading = ref(false)

const emit = defineEmits([
  'deleteWarehouse',
  'showLocationOnMap',
])

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
    'code': ['warehouse_code', 'code'],
    'address': ['warehouse_address', 'address'],
    'status': ['status_warehouse', 'status'],
    'name': ['warehouse_name', 'name'],
    'created_at': ['createdAt', 'created_at']
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

function deleteWarehouse(warehouse) {
  const id = warehouse.id
  const code = getWarehouseAttribute(warehouse, 'code')
  emit('deleteWarehouse', id, code)
}

function showLocationOnMap(warehouse) {
  emit('showLocationOnMap', warehouse)
}

// Pagination state
const startPage = ref(0)
const currentPage = ref(1)
const sortOrder = ref('asc')
const sortKey = ref('created_at')

// Pagination calculations
const limit = 5
const start = computed(() => startPage.value * limit)

const startPageCount = computed(() => startPage.value * 5 + 1)
const endPageCount = computed(() => {
  const end = startPage.value * 5 + 5
  return end > sortedAllWarehouses.value.length ? sortedAllWarehouses.value.length : end
})

// Computed property to sort ALL warehouses first
const sortedAllWarehouses = computed(() => {
  // FIX: Remove .value from props access
  if (!props.warehouseList || props.warehouseList.length === 0) return []

  return [...props.warehouseList].sort((a, b) => {
    let aValue = getWarehouseAttribute(a, sortKey.value)
    let bValue = getWarehouseAttribute(b, sortKey.value)

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
  return sortedAllWarehouses.value.slice(start.value, start.value + limit)
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
</script>

<template>
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
              :key="warehouse.id || index"
              :class="[
                'hover:bg-gray-300 transition-colors',
                index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
              ]"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                {{ getWarehouseAttribute(warehouse, 'code') || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                {{ getWarehouseAttribute(warehouse, 'address') || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <p :class="statusClass(getWarehouseAttribute(warehouse, 'status'))">
                  {{ getWarehouseAttribute(warehouse, 'status') || 'Unknown' }}
                </p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{
                  getWarehouseAttribute(warehouse, 'created_at')
                    ? new Date(getWarehouseAttribute(warehouse, 'created_at')).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'
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
                  @click="deleteWarehouse(warehouse)"
                  class="text-red-500 hover:text-red-700 text-xl hover:scale-110 transition-transform"
                  :disabled="isLoading"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </td>
            </tr>

            <!-- Loading state -->
            <tr v-if="isLoading">
              <td colspan="5" class="text-center py-8">
                <div class="text-gray-500">
                  <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>Loading warehouses...</p>
                </div>
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
        v-if="!isLoading && sortedAllWarehouses.length > 0"
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
</template>

<style scoped>
/* Warehouse table styles */
.warehouse-grid {
  overflow-x: auto;
}

.hover-table tbody tr:hover {
  background-color: #f3f4f6;
}
</style>
