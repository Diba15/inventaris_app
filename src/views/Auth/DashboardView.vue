<script setup>
import { reactive, nextTick, computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/StatCard.vue'
import axios from 'axios'

defineOptions({
  name: 'DashboardView',
})

// --- ENVIRONMENT & STORE ---
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// --- COMPONENT REFS ---
const chartRef = ref(null)

// --- DATA STATE ---
const products = ref([])
const outbounds = ref([])
const suppliers = ref([])
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Des']

// --- UI STATE ---
const currentDate = ref(new Date()) // Set to current date for real-time context
const isDatePickerOpen = ref(false)
const pickerYear = ref(new Date().getFullYear())
const state = reactive({
  isDropdownOpen: false,
  selectedFilter: { label: 'Monthly', value: 'monthly' },
  chartOptions: {
    chart: { type: 'line', height: 300, backgroundColor: 'transparent' },
    title: { text: `` },
    lang: { decimalPoint: ',', thousandsSep: '.' },
    accessibility: { enabled: false },
    xAxis: { categories: [], min: 0, max: 7, scrollbar: { enabled: true } },
    yAxis: { title: { text: 'Total' } },
    series: [
      { name: 'Inbound Items', data: [] },
      { name: 'Outbound Items Qty', data: [] },
    ],
    credits: { enabled: false },
  },
})

// --- COMPUTED PROPERTIES ---

// Stat cards data is now dynamic
const statData = computed(() => {
  const totalInboundStock = products.value.reduce((sum, p) => sum + (p.product_qty || 0), 0)
  const totalOutboundTransactions = outbounds.value.length

  return [
    {
      title: 'Total Inbound Stock',
      value: totalInboundStock.toLocaleString('id-ID'),
      icon: 'fa-boxes-packing',
      color: 'bg-sub',
      textColor: 'text-sub',
    },
    {
      title: 'Outbound Transaction',
      value: totalOutboundTransactions.toLocaleString('id-ID'),
      icon: 'fa-dolly',
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
    },
    {
      title: 'Total Supplier',
      value: suppliers.value.length.toLocaleString('id-ID'),
      icon: 'fa-users',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
    },
  ]
})

// Display date for the header navigation
const displayDate = computed(() => {
  switch (state.selectedFilter.value) {
    case 'weekly':
      return currentDate.value.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })
    case 'monthly':
      return currentDate.value.getFullYear().toString()
    case 'yearly': {
      const endYear = currentDate.value.getFullYear()
      const startYear = endYear - 4
      return `${startYear} - ${endYear}`
    }
    default:
      return ''
  }
})

// --- DATA FETCHING ---
const fetchData = async () => {
  try {
    const [productsRes, outboundsRes, suppliersRes] = await Promise.all([
      axios.get(`${STRAPI_URL}/api/products?populate=*`),
      axios.get(`${STRAPI_URL}/api/outbound-products?populate=*`),
      axios.get(`${STRAPI_URL}/api/suppliers?populate=*`),
    ])
    products.value = productsRes.data.data
    outbounds.value = outboundsRes.data.data
    suppliers.value = suppliersRes.data.data
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
}

// --- CHART LOGIC ---
const updateChartData = () => {
  const filter = state.selectedFilter.value
  let categories = []
  let inboundData = []
  let outboundData = []

  const now = currentDate.value

  if (filter === 'weekly') {
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weekCount = Math.ceil(daysInMonth / 7)
    categories = Array.from({ length: weekCount }, (_, i) => `Week ${i + 1}`)
    inboundData = Array(weekCount).fill(0)
    outboundData = Array(weekCount).fill(0)

    const filterByMonth = (item) => {
      const itemDate = new Date(item.createdAt)
      return itemDate.getFullYear() === year && itemDate.getMonth() === month
    }

    products.value.filter(filterByMonth).forEach((item) => {
      const weekIndex = Math.floor((new Date(item.createdAt).getDate() - 1) / 7)
      if (weekIndex >= 0 && weekIndex < weekCount) inboundData[weekIndex]++
    })
    outbounds.value.filter(filterByMonth).forEach((item) => {
      const weekIndex = Math.floor((new Date(item.createdAt).getDate() - 1) / 7)
      if (weekIndex >= 0 && weekIndex < weekCount) outboundData[weekIndex] += item.qty || 0
    })
  } else if (filter === 'monthly') {
    const year = now.getFullYear()
    categories = months
    inboundData = Array(12).fill(0)
    outboundData = Array(12).fill(0)

    const filterByYear = (item) => new Date(item.createdAt).getFullYear() === year

    products.value.filter(filterByYear).forEach((item) => {
      const monthIndex = new Date(item.createdAt).getMonth()
      inboundData[monthIndex]++
    })
    outbounds.value.filter(filterByYear).forEach((item) => {
      const monthIndex = new Date(item.createdAt).getMonth()
      outboundData[monthIndex] += item.qty || 0
    })
  } else if (filter === 'yearly') {
    const currentYear = now.getFullYear()
    categories = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i)
    inboundData = Array(5).fill(0)
    outboundData = Array(5).fill(0)

    const yearMap = new Map(categories.map((year, index) => [year, index]))

    products.value.forEach((item) => {
      const year = new Date(item.createdAt).getFullYear()
      if (yearMap.has(year)) {
        inboundData[yearMap.get(year)]++
      }
    })
    outbounds.value.forEach((item) => {
      const year = new Date(item.createdAt).getFullYear()
      if (yearMap.has(year)) {
        outboundData[yearMap.get(year)] += item.qty || 0
      }
    })
  }

  state.chartOptions.xAxis.categories = categories
  state.chartOptions.series = [
    { name: 'Inbound Entries', data: inboundData },
    { name: 'Outbound Items Qty', data: outboundData },
  ]

  nextTick(() => {
    if (chartRef.value && chartRef.value.chart) {
      chartRef.value.chart.update(state.chartOptions, true, true)
    }
  })

  localStorage.setItem('selectedFilter', JSON.stringify(state.selectedFilter))
}

// --- UI EVENT HANDLERS ---
const toggleDropdown = () => {
  state.isDropdownOpen = !state.isDropdownOpen
}

const changeFilter = (filter) => {
  state.selectedFilter = filter
  state.isDropdownOpen = false
  currentDate.value = new Date() // Reset date to current when changing filter type
  updateChartData()
}

const navigatePeriod = (direction) => {
  const newDate = new Date(currentDate.value)
  const filter = state.selectedFilter.value

  if (filter === 'weekly') {
    newDate.setMonth(newDate.getMonth() + direction)
  } else if (filter === 'monthly') {
    newDate.setFullYear(newDate.getFullYear() + direction)
  } else if (filter === 'yearly') {
    newDate.setFullYear(newDate.getFullYear() + direction * 5)
  }

  currentDate.value = newDate
  updateChartData()
}

const openDatePicker = () => {
  if (state.selectedFilter.value === 'yearly') return
  pickerYear.value = currentDate.value.getFullYear()
  isDatePickerOpen.value = true
}

const closeDatePicker = () => {
  isDatePickerOpen.value = false
}

const changePickerYear = (direction) => {
  pickerYear.value += direction
}

const selectMonth = (monthIndex) => {
  const newDate = new Date(currentDate.value)
  newDate.setFullYear(pickerYear.value)
  newDate.setMonth(monthIndex)
  currentDate.value = newDate
  closeDatePicker()
  updateChartData()
}

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  await fetchData()
  const storageFilter = localStorage.getItem('selectedFilter')
  if (storageFilter) {
    state.selectedFilter = JSON.parse(storageFilter)
  }
  updateChartData()
})

const filterOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]
</script>

<template>
  <main>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-center px-4">
      <div class="flex gap-2">
        <div class="w-2 bg-sub min-h-[2px] rounded"></div>
        <div class="flex flex-col text-2xl text-base">
          <h1 class="flex flex-col">Welcome</h1>
          <span class="font-bold">{{ user.value?.username || 'User' }}</span>
        </div>
      </div>
      <div class="flex items-center mt-4 sm:mt-0">
        <button
          @click="navigatePeriod(-1)"
          class="bg-base text-secondary px-4 py-1.5 rounded-l-md cursor-pointer border-r-secondary border-r-2 text-sm"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <button
          @click="openDatePicker"
          :disabled="
            state.selectedFilter.value === 'yearly' || state.selectedFilter.value === 'monthly'
          "
          class="bg-base text-secondary px-4 py-1.5 font-bold text-sm w-32 text-center disabled:cursor-not-allowed disabled:opacity-75"
        >
          {{ displayDate }}
        </button>
        <button
          @click="navigatePeriod(1)"
          class="bg-base text-secondary px-4 py-1.5 rounded-r-md cursor-pointer border-l-secondary border-l-2 text-sm"
        >
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mt-5 px-4">
      <StatCard
        v-for="stat in statData"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
        :textColor="stat.textColor"
      />
    </div>

    <!-- Chart -->
    <div class="mt-5 bg-white text-base shadow rounded-md mx-4">
      <div class="flex justify-between items-center px-4 pt-4 bg-base rounded-t-md">
        <h2 class="text-xl font-bold mb-4 text-white">Inventory Rate</h2>
        <div class="relative">
          <button
            class="flex gap-2 items-center font-bold cursor-pointer text-white mb-4"
            @click="toggleDropdown"
          >
            {{ state.selectedFilter.label }}
            <i
              class="fa-solid fa-chevron-down transition-transform"
              :class="{ 'rotate-180': state.isDropdownOpen }"
            ></i>
          </button>
          <ul
            class="bg-white shadow-lg rounded-md absolute z-10 right-0 w-28"
            :class="{ block: state.isDropdownOpen, hidden: !state.isDropdownOpen }"
          >
            <li
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-base"
              @click="changeFilter(filter)"
              v-for="filter in filterOptions"
              :key="filter.value"
            >
              {{ filter.label }}
            </li>
          </ul>
        </div>
      </div>
      <div class="flex justify-center place-content-center h-[310px] my-10 w-full text-base p-4">
        <highcharts
          id="chart"
          class="mx-auto w-full"
          :options="state.chartOptions"
          ref="chartRef"
        ></highcharts>
      </div>
    </div>

    <!-- Date Picker Modal -->
    <div
      v-if="isDatePickerOpen"
      class="fixed inset-0 bg-black/30 z-40 flex items-center justify-center"
      @click.self="closeDatePicker"
    >
      <div class="bg-white rounded-lg shadow-xl w-72">
        <div class="flex items-center justify-between p-4 border-b">
          <button
            @click="changePickerYear(-1)"
            class="p-2 rounded-full hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
          >
            <i class="fa-solid fa-chevron-left text-sm text-gray-600"></i>
          </button>
          <span class="font-bold text-lg text-gray-800">{{ pickerYear }}</span>
          <button
            @click="changePickerYear(1)"
            class="p-2 rounded-full hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
          >
            <i class="fa-solid fa-chevron-right text-sm text-gray-600"></i>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2 p-4">
          <button
            v-for="(month, index) in months"
            :key="month"
            @click="selectMonth(index)"
            class="p-3 text-center rounded-md hover:bg-sub/20 hover:text-sub transition-colors text-gray-600"
            :class="{
              'bg-sub text-white font-bold':
                index === currentDate.getMonth() && pickerYear === currentDate.getFullYear(),
            }"
          >
            {{ month }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
