<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { defineComponent } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'

defineOptions({
  name: 'ReportsView',
})

// --- ENVIRONMENT & ROUTER ---
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL
const router = useRouter()

// --- ICONS (as Functional Components) ---
const TrendingUpIcon = defineComponent({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-2.25m3.75 2.25L16.5 6" /></svg>`,
})
const TrendingDownIcon = defineComponent({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" /></svg>`,
})
const UsersIcon = defineComponent({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.518 2.72a3 3 0 01-4.682-2.72A9.094 9.094 0 016 18.72m0-3.75v-5.25A3.375 3.375 0 019.375 6h5.25A3.375 3.375 0 0118 9.75v5.25m0-3.75l-3.75-3.75M6 12l3.75-3.75" /></svg>`,
})
const PackageIcon = defineComponent({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>`,
})

// --- Reactive State ---
const activeTab = ref('overview')
const dateRange = ref('30days')
const searchTerm = ref('')
const isLoading = ref(true)
const isExporting = ref(false)
const isExportDropdownOpen = ref(false)

// --- Data Refs ---
const products = ref([])
const outbounds = ref([])
const suppliers = ref([])
const warehouses = ref([])

// --- Modal State ---
const isWarehouseModalOpen = ref(false)
const selectedWarehouseDetails = ref(null)

// --- Data Fetching ---
const fetchData = async () => {
  isLoading.value = true
  try {
    const [productsRes, outboundsRes, suppliersRes, warehousesRes] = await Promise.all([
      axios.get(`${STRAPI_URL}/api/products?populate=*`),
      axios.get(`${STRAPI_URL}/api/outbound-products?populate=*`),
      axios.get(`${STRAPI_URL}/api/suppliers`),
      axios.get(`${STRAPI_URL}/api/warehouses`),
    ])
    products.value = productsRes.data.data
    outbounds.value = outboundsRes.data.data
    suppliers.value = suppliersRes.data.data
    warehouses.value = warehousesRes.data.data
  } catch (error) {
    console.error('Failed to fetch report data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

// --- Date Filtering Logic ---
const filteredDataByDate = computed(() => {
  const now = new Date()
  let startDate = new Date()

  if (dateRange.value === 'all') {
    return { products: products.value, outbounds: outbounds.value }
  }

  switch (dateRange.value) {
    case '7days':
      startDate.setDate(now.getDate() - 7)
      break
    case '30days':
      startDate.setDate(now.getDate() - 30)
      break
    case '90days':
      startDate.setMonth(now.getMonth() - 3)
      break
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  const filterFn = (item) => new Date(item.createdAt) >= startDate

  return {
    products: products.value.filter(filterFn),
    outbounds: outbounds.value.filter(filterFn),
  }
})

// --- Computed properties for Stats and Tables ---

const overviewStats = computed(() => {
  const { products: filteredProducts, outbounds: filteredOutbounds } = filteredDataByDate.value
  const totalInboundValue = filteredProducts.reduce(
    (sum, p) => sum + (p.product_price || 0) * (p.product_qty || 0),
    0,
  )
  const totalOutboundValue = filteredOutbounds.reduce(
    (sum, o) => sum + (o.product?.product_price || 0) * (o.qty || 0),
    0,
  )
  const totalStock = products.value.reduce((sum, p) => sum + (p.product_qty || 0), 0)

  const formatCurrency = (value) => {
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} Jt`
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} Rb`
    return `Rp ${value.toLocaleString('id-ID')}`
  }

  return [
    {
      title: 'Total Inbound',
      value: formatCurrency(totalInboundValue),
      change: `${filteredProducts.length} transactions`,
      icon: TrendingUpIcon,
    },
    {
      title: 'Total Outbound',
      value: formatCurrency(totalOutboundValue),
      change: `${filteredOutbounds.length} transactions`,
      icon: TrendingDownIcon,
    },
    { title: 'Active Suppliers', value: suppliers.value.length, change: `Total`, icon: UsersIcon },
    {
      title: 'Items in Stock',
      value: totalStock.toLocaleString('id-ID'),
      change: `Total`,
      icon: PackageIcon,
    },
  ]
})

const filteredInboundData = computed(() => {
  const { products: dateFiltered } = filteredDataByDate.value
  if (!searchTerm.value) return dateFiltered
  const search = searchTerm.value.toLowerCase()
  return dateFiltered.filter(
    (item) =>
      item.supplier_id?.supplier_name?.toLowerCase().includes(search) ||
      item.in_id?.toLowerCase().includes(search) ||
      item.product_name?.toLowerCase().includes(search),
  )
})

const filteredOutboundData = computed(() => {
  const { outbounds: dateFiltered } = filteredDataByDate.value
  if (!searchTerm.value) return dateFiltered
  const search = searchTerm.value.toLowerCase()
  return dateFiltered.filter(
    (item) =>
      item.destination?.toLowerCase().includes(search) ||
      item.out_id?.toLowerCase().includes(search) ||
      item.product?.product_name?.toLowerCase().includes(search),
  )
})

const filteredSupplierData = computed(() => {
  const supplierReports = suppliers.value.map((supplier) => {
    const supplierProducts = products.value.filter(
      (p) => p.supplier_id?.documentId === supplier.documentId,
    )
    const totalValue = supplierProducts.reduce(
      (sum, p) => sum + (p.product_price || 0) * (p.product_qty || 0),
      0,
    )
    return {
      supplier: supplier.supplier_name,
      totalOrders: supplierProducts.length,
      totalValue: `Rp ${totalValue.toLocaleString('id-ID')}`,
    }
  })

  if (!searchTerm.value) return supplierReports
  const search = searchTerm.value.toLowerCase()
  return supplierReports.filter((s) => s.supplier.toLowerCase().includes(search))
})

const filteredWarehouseData = computed(() => {
  const warehouseReport = warehouses.value.map((warehouse) => {
    const productsInWarehouse = products.value.filter(
      (p) =>
        Array.isArray(p.warehouse) &&
        p.warehouse.some((wh) => wh.documentId === warehouse.documentId),
    )
    const totalStock = productsInWarehouse.reduce((sum, p) => sum + (p.product_qty || 0), 0)
    return {
      ...warehouse,
      productCount: productsInWarehouse.length,
      totalStock: totalStock,
      products: productsInWarehouse.map((p) => ({ name: p.product_name, qty: p.product_qty })),
    }
  })

  if (!searchTerm.value) return warehouseReport
  const search = searchTerm.value.toLowerCase()
  return warehouseReport.filter((w) => w.warehouse_name.toLowerCase().includes(search))
})

// --- Methods ---
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const viewDetails = (item, type) => {
  if (type === 'inbound') router.push({ name: 'edit-product', params: { id: item.documentId } })
  else router.push({ name: 'outbound-details', params: { id: item.documentId } })
}

const openWarehouseModal = (warehouse) => {
  selectedWarehouseDetails.value = warehouse
  isWarehouseModalOpen.value = true
}

const closeWarehouseModal = () => {
  isWarehouseModalOpen.value = false
  selectedWarehouseDetails.value = null
}

watch(activeTab, () => {
  searchTerm.value = '' // Reset search term when switching tabs
})

// --- EXPORT LOGIC ---
const exportToExcel = (sheets, filename) => {
  isExporting.value = true
  const wb = XLSX.utils.book_new()

  sheets.forEach((sheet) => {
    const ws = XLSX.utils.json_to_sheet(sheet.data)

    // Auto-fit column widths
    const cols = []
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let max_width = 0
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_address = { c: C, r: R }
        const cell_ref = XLSX.utils.encode_cell(cell_address)
        if (ws[cell_ref]) {
          const cell_text = ws[cell_ref].v ? String(ws[cell_ref].v) : ''
          if (cell_text.length > max_width) {
            max_width = cell_text.length
          }
        }
      }
      cols[C] = { wch: max_width + 2 } // +2 for padding
    }
    ws['!cols'] = cols

    // Apply number format for currency columns
    if (sheet.currencyColumns) {
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        sheet.currencyColumns.forEach((C) => {
          const cell_address = { c: C, r: R }
          const cell_ref = XLSX.utils.encode_cell(cell_address)
          if (ws[cell_ref] && typeof ws[cell_ref].v === 'number') {
            ws[cell_ref].z = '"Rp"#,##0'
          }
        })
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  })

  XLSX.writeFile(wb, `${filename}.xlsx`)
  isExporting.value = false
  isExportDropdownOpen.value = false
}

const handleExportCurrentView = () => {
  let data, sheetName, currencyColumns

  switch (activeTab.value) {
    case 'overview':
      data = overviewStats.value.map((s) => ({ Title: s.title, Value: s.value, Change: s.change }))
      sheetName = 'Overview'
      break
    case 'inbound':
      data = filteredInboundData.value.map((i) => ({
        ID: i.in_id,
        Date: formatDate(i.createdAt),
        Supplier: i.supplier_id?.supplier_name,
        Product: i.product_name,
        Quantity: i.product_qty,
        Value: i.product_price * i.product_qty,
      }))
      sheetName = 'Inbound Report'
      currencyColumns = [5] // Column F
      break
    case 'outbound':
      data = filteredOutboundData.value.map((o) => ({
        ID: o.out_id,
        Date: formatDate(o.createdAt),
        Customer: o.destination,
        Product: o.product?.product_name,
        Quantity: o.qty,
        Value: (o.product?.product_price || 0) * o.qty,
      }))
      sheetName = 'Outbound Report'
      currencyColumns = [5] // Column F
      break
    case 'suppliers':
      data = filteredSupplierData.value.map((s) => ({
        ...s,
        totalValue: parseFloat(s.totalValue.replace(/[^0-9]/g, '')),
      }))
      sheetName = 'Suppliers Report'
      currencyColumns = [2] // Column C
      break
    case 'warehouses':
      data = filteredWarehouseData.value.map((w) => ({
        Warehouse: w.warehouse_name,
        'Product Types': w.productCount,
        'Total Stock': w.totalStock,
      }))
      sheetName = 'Warehouses Report'
      break
    default:
      return
  }
  exportToExcel(
    [{ data, name: sheetName, currencyColumns }],
    `Report_${sheetName.replace(' ', '_')}_${new Date().toISOString().slice(0, 10)}`,
  )
}

const handleExportAll = () => {
  const overviewData = {
    name: 'Overview',
    data: overviewStats.value.map((s) => ({ Title: s.title, Value: s.value, Change: s.change })),
  }
  const inboundData = {
    name: 'Inbound',
    data: products.value.map((i) => ({
      ID: i.in_id,
      Date: formatDate(i.createdAt),
      Supplier: i.supplier_id?.supplier_name,
      Product: i.product_name,
      Quantity: i.product_qty,
      Value: i.product_price * i.product_qty,
    })),
    currencyColumns: [5],
  }
  const outboundData = {
    name: 'Outbound',
    data: outbounds.value.map((o) => ({
      ID: o.out_id,
      Date: formatDate(o.createdAt),
      Customer: o.destination,
      Product: o.product?.product_name,
      Quantity: o.qty,
      Value: (o.product?.product_price || 0) * o.qty,
    })),
    currencyColumns: [5],
  }
  const suppliersData = {
    name: 'Suppliers',
    data: filteredSupplierData.value.map((s) => ({
      ...s,
      totalValue: parseFloat(s.totalValue.replace(/[^0-9]/g, '')),
    })),
    currencyColumns: [2],
  }
  const warehousesData = {
    name: 'Warehouses',
    data: filteredWarehouseData.value.map((w) => ({
      Warehouse: w.warehouse_name,
      'Product Types': w.productCount,
      'Total Stock': w.totalStock,
    })),
  }

  exportToExcel(
    [overviewData, inboundData, outboundData, suppliersData, warehousesData],
    `Full_Report_${new Date().toISOString().slice(0, 10)}`,
  )
}
</script>

<template>
  <div class="flex flex-col m-4 gap-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-lg">
      <div class="bg-base text-white p-6 rounded-t-xl">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold">Analytics & Reports</h1>
            <p class="text-[var(--color-secondary)] opacity-80 mt-1">
              Manage and analyze your inbound, outbound, and supplier data.
            </p>
          </div>
          <div class="relative">
            <button
              @click="isExportDropdownOpen = !isExportDropdownOpen"
              :disabled="isExporting"
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              <i
                :class="isExporting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-download'"
                class="w-4 h-4"
              ></i>
              <span>{{ isExporting ? 'Exporting...' : 'Export' }}</span>
              <i
                class="fa-solid fa-chevron-down w-4 h-4 transition-transform"
                :class="{ 'rotate-180': isExportDropdownOpen }"
              ></i>
            </button>
            <div
              v-if="isExportDropdownOpen"
              @click="isExportDropdownOpen = false"
              class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20"
            >
              <a
                @click.prevent="handleExportCurrentView"
                href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >Export Current View (Excel)</a
              >
              <a
                @click.prevent="handleExportAll"
                href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >Export All Reports (Excel)</a
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div class="flex gap-2 flex-wrap">
            <button
              @click="activeTab = 'overview'"
              :class="
                activeTab === 'overview'
                  ? 'bg-[var(--color-sub)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              class="px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Overview
            </button>
            <button
              @click="activeTab = 'inbound'"
              :class="
                activeTab === 'inbound'
                  ? 'bg-[var(--color-sub)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              class="px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Inbound
            </button>
            <button
              @click="activeTab = 'outbound'"
              :class="
                activeTab === 'outbound'
                  ? 'bg-[var(--color-sub)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              class="px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Outbound
            </button>
            <button
              @click="activeTab = 'suppliers'"
              :class="
                activeTab === 'suppliers'
                  ? 'bg-[var(--color-sub)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              class="px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Suppliers
            </button>
            <button
              @click="activeTab = 'warehouses'"
              :class="
                activeTab === 'warehouses'
                  ? 'bg-[var(--color-sub)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              class="px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Warehouses
            </button>
          </div>
          <div class="flex gap-2 items-center w-full md:w-auto">
            <div class="relative flex-grow" v-if="activeTab !== 'overview'">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fa-solid fa-search w-4 h-4 text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search..."
                v-model="searchTerm"
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-sub)] focus:border-transparent text-gray-600"
              />
            </div>
            <select
              v-model="dateRange"
              class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-sub)] focus:border-transparent bg-white text-gray-600"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 3 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 bg-gray-50/50 rounded-b-xl h-fit">
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(stat, index) in overviewStats"
              :key="index"
              class="bg-gradient-to-br from-base to-gray-800 p-6 rounded-xl text-white shadow-lg"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-secondary opacity-80 text-sm">{{ stat.title }}</p>
                  <p class="text-3xl font-bold mt-1">{{ stat.value }}</p>
                  <p class="text-sm mt-2 flex items-center gap-1 text-gray-300">
                    {{ stat.change }}
                  </p>
                </div>
                <component :is="stat.icon" class="w-10 h-10 opacity-30" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="activeTab === 'inbound' || activeTab === 'outbound'">
          <div class="overflow-x-auto">
            <table class="w-full bg-white border border-gray-200 rounded-lg text-sm">
              <thead class="bg-base text-white uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">ID</th>
                  <th class="px-4 py-3 text-left font-semibold">Date</th>
                  <th class="px-4 py-3 text-left font-semibold">
                    {{ activeTab === 'inbound' ? 'Supplier' : 'Customer' }}
                  </th>
                  <th class="px-4 py-3 text-left font-semibold">Product</th>
                  <th class="px-4 py-3 text-left font-semibold">Quantity</th>
                  <th class="px-4 py-3 text-left font-semibold">Value</th>
                  <th class="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="activeTab === 'inbound' && filteredInboundData.length > 0">
                  <tr
                    v-for="(item, index) in filteredInboundData"
                    :key="item.id"
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'"
                    class="hover:bg-yellow-50 transition-colors"
                  >
                    <td class="px-4 py-3 font-medium text-gray-800">{{ item.in_id }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ formatDate(item.createdAt) }}</td>
                    <td class="px-4 py-3 text-gray-600">
                      {{ item.supplier_id?.supplier_name || '-' }}
                    </td>
                    <td class="px-4 py-3 text-gray-600">{{ item.product_name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.product_qty }} items</td>
                    <td class="px-4 py-3 font-semibold text-gray-800">
                      Rp {{ (item.product_price * item.product_qty).toLocaleString('id-ID') }}
                    </td>
                    <td class="px-4 py-3">
                      <button
                        @click="viewDetails(item, 'inbound')"
                        class="text-gray-500 hover:text-[var(--color-sub)] transition-colors"
                      >
                        <i class="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </template>
                <template v-else-if="activeTab === 'outbound' && filteredOutboundData.length > 0">
                  <tr
                    v-for="(item, index) in filteredOutboundData"
                    :key="item.id"
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'"
                    class="hover:bg-yellow-50 transition-colors"
                  >
                    <td class="px-4 py-3 font-medium text-gray-800">{{ item.out_id }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ formatDate(item.createdAt) }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.destination }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.product?.product_name || '-' }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.qty }} items</td>
                    <td class="px-4 py-3 font-semibold text-gray-800">
                      Rp
                      {{ ((item.product?.product_price || 0) * item.qty).toLocaleString('id-ID') }}
                    </td>
                    <td class="px-4 py-3">
                      <button
                        @click="viewDetails(item, 'outbound')"
                        class="text-gray-500 hover:text-[var(--color-sub)] transition-colors"
                      >
                        <i class="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="7" class="text-center py-10 text-gray-500">
                    <i class="fa-solid fa-box-open text-3xl mb-2"></i>
                    <p>No data found.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="activeTab === 'suppliers'">
          <div
            v-if="filteredSupplierData.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="supplier in filteredSupplierData"
              :key="supplier.supplier"
              class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-800 text-lg">{{ supplier.supplier }}</h3>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Transactions:</span
                  ><span class="font-medium text-gray-800">{{ supplier.totalOrders }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Value:</span
                  ><span class="font-semibold text-green-600">{{ supplier.totalValue }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 text-gray-500">
            <i class="fa-solid fa-users-slash text-3xl mb-2"></i>
            <p>No supplier data found.</p>
          </div>
        </div>
        <div v-if="activeTab === 'warehouses'">
          <div
            v-if="filteredWarehouseData.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="warehouse in filteredWarehouseData"
              :key="warehouse.documentId"
              class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <h3 class="font-semibold text-gray-800 text-lg mb-4">
                {{ warehouse.warehouse_name }}
              </h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Product Types:</span
                  ><span class="font-medium text-gray-800">{{ warehouse.productCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Stock:</span
                  ><span class="font-medium text-gray-800">{{ warehouse.totalStock }} items</span>
                </div>
              </div>
              <div class="mt-6 pt-4 border-t border-gray-200">
                <button
                  @click="openWarehouseModal(warehouse)"
                  class="w-full bg-[var(--color-sub)] text-white py-2 px-4 rounded-lg hover:brightness-90 transition-all font-semibold"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 text-gray-500">
            <i class="fa-solid fa-warehouse text-3xl mb-2"></i>
            <p>No warehouse data found.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Warehouse Details Modal -->
    <div
      v-if="isWarehouseModalOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeWarehouseModal"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">
            {{ selectedWarehouseDetails?.warehouse_name }}
          </h2>
          <button @click="closeWarehouseModal" class="text-gray-400 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-gray-500">
              <tr>
                <th class="py-2 pr-4 font-semibold">Product Name</th>
                <th class="py-2 pl-4 font-semibold text-right">Total Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in selectedWarehouseDetails?.products"
                :key="product.name"
                class="border-t"
              >
                <td class="py-3 pr-4 text-gray-800">{{ product.name }}</td>
                <td class="py-3 pl-4 text-gray-800 font-medium text-right">{{ product.qty }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
