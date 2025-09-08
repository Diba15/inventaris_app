<script setup>
import { ref, computed, defineComponent } from 'vue'

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

// --- Sample Data ---
const overviewStats = ref([
  { title: 'Total Inbound', value: 'Rp 70.3 Jt', change: '+12%', icon: TrendingUpIcon },
  { title: 'Total Outbound', value: 'Rp 55.4 Jt', change: '-5%', icon: TrendingDownIcon },
  { title: 'Active Suppliers', value: '5', change: '+2', icon: UsersIcon },
  { title: 'Items in Stock', value: '5,678', change: '+8%', icon: PackageIcon },
])

const inboundData = ref([
  {
    id: 'INB001',
    date: '2025-09-08',
    supplier: 'PT Sumber Makmur',
    items: 150,
    value: 'Rp 15,000,000',
    status: 'Completed',
  },
  {
    id: 'INB002',
    date: '2025-09-07',
    supplier: 'CV Jaya Abadi',
    items: 200,
    value: 'Rp 25,000,000',
    status: 'Processing',
  },
  {
    id: 'INB003',
    date: '2025-09-06',
    supplier: 'PT Mitra Sejahtera',
    items: 100,
    value: 'Rp 12,500,000',
    status: 'Completed',
  },
  {
    id: 'INB004',
    date: '2025-09-05',
    supplier: 'UD Berkah Jaya',
    items: 75,
    value: 'Rp 8,750,000',
    status: 'Pending',
  },
  {
    id: 'INB005',
    date: '2025-09-04',
    supplier: 'PT Mandiri Sejati',
    items: 180,
    value: 'Rp 22,000,000',
    status: 'Completed',
  },
])

const outboundData = ref([
  {
    id: 'OUT001',
    date: '2025-09-08',
    customer: 'Toko Sinar Jaya',
    items: 80,
    value: 'Rp 12,000,000',
    status: 'Shipped',
  },
  {
    id: 'OUT002',
    date: '2025-09-07',
    customer: 'Supermarket Metro',
    items: 120,
    value: 'Rp 18,500,000',
    status: 'Delivered',
  },
  {
    id: 'OUT003',
    date: '2025-09-06',
    customer: 'Warung Pak Budi',
    items: 45,
    value: 'Rp 5,250,000',
    status: 'Processing',
  },
  {
    id: 'OUT004',
    date: '2025-09-05',
    customer: 'Minimarket 24',
    items: 90,
    value: 'Rp 13,200,000',
    status: 'Delivered',
  },
  {
    id: 'OUT005',
    date: '2025-09-04',
    customer: 'Toko Serba Ada',
    items: 65,
    value: 'Rp 9,800,000',
    status: 'Shipped',
  },
])

const supplierHistory = ref([
  {
    supplier: 'PT Sumber Makmur',
    totalOrders: 25,
    totalValue: 'Rp 125,000,000',
    avgDelivery: '3 days',
    rating: 4.8,
  },
  {
    supplier: 'CV Jaya Abadi',
    totalOrders: 18,
    totalValue: 'Rp 95,000,000',
    avgDelivery: '4 days',
    rating: 4.5,
  },
  {
    supplier: 'PT Mitra Sejahtera',
    totalOrders: 22,
    totalValue: 'Rp 110,000,000',
    avgDelivery: '2 days',
    rating: 4.9,
  },
  {
    supplier: 'UD Berkah Jaya',
    totalOrders: 15,
    totalValue: 'Rp 75,000,000',
    avgDelivery: '5 days',
    rating: 4.2,
  },
  {
    supplier: 'PT Mandiri Sejati',
    totalOrders: 30,
    totalValue: 'Rp 150,000,000',
    avgDelivery: '3 days',
    rating: 4.7,
  },
])

// --- Computed properties for filtering ---
const filteredInboundData = computed(() => {
  if (!searchTerm.value) return inboundData.value
  const search = searchTerm.value.toLowerCase()
  return inboundData.value.filter(
    (item) =>
      item.supplier.toLowerCase().includes(search) || item.id.toLowerCase().includes(search),
  )
})

const filteredOutboundData = computed(() => {
  if (!searchTerm.value) return outboundData.value
  const search = searchTerm.value.toLowerCase()
  return outboundData.value.filter(
    (item) =>
      item.customer.toLowerCase().includes(search) || item.id.toLowerCase().includes(search),
  )
})

const filteredSupplierData = computed(() => {
  if (!searchTerm.value) return supplierHistory.value
  const search = searchTerm.value.toLowerCase()
  return supplierHistory.value.filter((supplier) =>
    supplier.supplier.toLowerCase().includes(search),
  )
})

// --- Methods ---
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'processing':
    case 'shipped':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getRatingStars = (rating) => {
  const fullStar = '<span class="text-yellow-400">★</span>'
  const emptyStar = '<span class="text-gray-300">★</span>'
  return fullStar.repeat(Math.floor(rating)) + emptyStar.repeat(5 - Math.floor(rating))
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
              Kelola dan analisis data inbound, outbound, dan supplier.
            </p>
          </div>
          <div class="flex gap-2">
            <button
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg
                class="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Export Page
            </button>
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
          </div>

          <div class="flex gap-2 items-center w-full md:w-auto">
            <div class="relative flex-grow">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="w-4 h-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari transaksi atau supplier..."
                v-model="searchTerm"
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-sub)] focus:border-transparent"
              />
            </div>
            <select
              v-model="dateRange"
              class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-sub)] focus:border-transparent bg-white"
            >
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="90days">3 Bulan Terakhir</option>
              <option value="1year">1 Tahun Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 bg-gray-50/50 rounded-b-xl">
        <!-- Overview Tab -->
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
                  <p
                    :class="stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'"
                    class="text-sm mt-2 flex items-center gap-1"
                  >
                    <svg
                      v-if="stat.change.startsWith('+')"
                      class="w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
                      />
                    </svg>
                    {{ stat.change }} dari bulan lalu
                  </p>
                </div>
                <component :is="stat.icon" class="w-10 h-10 opacity-30" />
              </div>
            </div>
          </div>
        </div>

        <!-- Table View Tabs (Inbound, Outbound) -->
        <div v-if="activeTab === 'inbound' || activeTab === 'outbound'">
          <div class="overflow-x-auto">
            <table class="w-full bg-white border border-gray-200 rounded-lg text-sm">
              <thead class="bg-gray-100 text-gray-600 uppercase">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">ID Transaksi</th>
                  <th class="px-4 py-3 text-left font-semibold">Tanggal</th>
                  <th class="px-4 py-3 text-left font-semibold">
                    {{ activeTab === 'inbound' ? 'Supplier' : 'Customer' }}
                  </th>
                  <th class="px-4 py-3 text-left font-semibold">Jumlah Item</th>
                  <th class="px-4 py-3 text-left font-semibold">Nilai</th>
                  <th class="px-4 py-3 text-left font-semibold">Status</th>
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
                    <td class="px-4 py-3 font-medium text-gray-800">{{ item.id }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.date }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.supplier }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.items }} items</td>
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ item.value }}</td>
                    <td class="px-4 py-3">
                      <span
                        :class="getStatusColor(item.status)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        >{{ item.status }}</span
                      >
                    </td>
                    <td class="px-4 py-3">
                      <button class="text-gray-500 hover:text-[var(--color-sub)] transition-colors">
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
                    <td class="px-4 py-3 font-medium text-gray-800">{{ item.id }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.date }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.customer }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ item.items }} items</td>
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ item.value }}</td>
                    <td class="px-4 py-3">
                      <span
                        :class="getStatusColor(item.status)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        >{{ item.status }}</span
                      >
                    </td>
                    <td class="px-4 py-3">
                      <button class="text-gray-500 hover:text-[var(--color-sub)] transition-colors">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="7" class="text-center py-10 text-gray-500">
                    <i class="fa-solid fa-box-open text-3xl mb-2"></i>
                    <p>Tidak ada data ditemukan.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Suppliers Tab -->
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
                <div
                  v-html="getRatingStars(supplier.rating)"
                  class="flex items-center text-lg"
                ></div>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Orders:</span
                  ><span class="font-medium text-gray-800">{{ supplier.totalOrders }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Value:</span
                  ><span class="font-semibold text-green-600">{{ supplier.totalValue }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Avg. Delivery:</span
                  ><span class="font-medium text-gray-800">{{ supplier.avgDelivery }}</span>
                </div>
              </div>
              <div class="mt-6 pt-4 border-t border-gray-200">
                <button
                  class="w-full bg-[var(--color-sub)] text-white py-2 px-4 rounded-lg hover:brightness-90 transition-all font-semibold"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 text-gray-500">
            <i class="fa-solid fa-users-slash text-3xl mb-2"></i>
            <p>Tidak ada data supplier ditemukan.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
