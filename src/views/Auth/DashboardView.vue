<script setup>
defineOptions({
  name: 'DashboardView',
})

import { reactive, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/StatCard.vue'

let chartRef = null
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const state = reactive({
  isDropdownOpen: false,
  selectedFilter: { label: 'Yearly', value: 'yearly' }, // Default to Yearly
  chartOptions: {
    chart: {
      type: 'line',
      height: 300,
      backgroundColor: 'transparent',
      scrollbar: {
        enabled: true,
        liveRedraw: true,
        showFull: false,
        height: 20,
        margin: 10,
      },
    },
    title: {
      text: ``,
    },
    lang: {
      decimalPoint: ',',
      thousandsSep: '.',
    },
    xAxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      min: 0,
      max: 7,
      tickInterval: 1,
      tickmarkPlacement: 'on',
      scrollbar: {
        enabled: true,
        liveRedraw: true,
      },
    },
    yAxis: {
      title: {
        text: 'Revenue (in USD)',
      },
    },
    series: [
      {
        name: '2025',
        data: [1200, 1500, 1700, 2000, 2300, 2500, 2700, 3000, 3200, 3500, 3700, 4000],
      },
    ],
    credits: {
      enabled: false,
    },
  },
})

const filterOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

// Initialize from localStorage if exists
const storageFilter = localStorage.getItem('selectedFilter')
if (storageFilter) {
  const parsedFilter = JSON.parse(storageFilter)
  const foundFilter = filterOptions.find((option) => option.value === parsedFilter.value)
  if (foundFilter) {
    state.selectedFilter = foundFilter
  }
}

const toggleDropdown = () => {
  state.isDropdownOpen = !state.isDropdownOpen
}

const saveFilter = () => {
  localStorage.setItem('selectedFilter', JSON.stringify(state.selectedFilter))
  console.log('Filter saved:', state.selectedFilter)
}

const changeFilter = (filter) => {
  state.selectedFilter = filter
  state.isDropdownOpen = false
  updateChartData(filter)
}

const statData = [
  { title: 'Total Revenue', value: '1,234', icon: 'fa-chart-pie', color: 'bg-sub', textColor: 'text-sub' },
  { title: 'Total Receipt', value: '1,234', icon: 'fa-receipt', color: 'bg-purple-500', textColor: 'text-purple-500' },
  { title: 'Customers', value: '1,234', icon: 'fa-users', color: 'bg-blue-500', textColor: 'text-blue-500' },
]

const updateChartData = (filter) => {
  let categories = []
  let dummyData = []
  let name = '2025'

  switch (filter.value) {
    case 'weekly':
      categories = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8']
      dummyData = [100, 200, 150, 300, 250, 400, 350, 500]
      name = 'This Month'
      break
    case 'monthly':
      categories = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      dummyData = [1200, 1500, 1700, 2000, 2300, 2500, 2700, 3000, 3200, 3500, 3700, 4000]
      name = '2025'
      break
    case 'yearly':
      categories = [
        '2019',
        '2020',
        '2021',
        '2022',
        '2023',
        '2024',
        '2025',
        '2026',
        '2027',
        '2028',
        '2029',
        '2030',
      ]
      dummyData = [
        12000, 15000, 17000, 20000, 23000, 25000, 27000, 30000, 32000, 35000, 37000, 40000,
      ]
      name = 'Year'
      break
    default:
      categories = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      dummyData = [1200, 1500, 1700, 2000, 2300, 2500, 2700, 3000, 3200, 3500, 3700, 4000]
      name = '2025'
      break
  }

  // Update chartOptions directly (reactive will handle the reactivity)
  state.chartOptions.xAxis.categories = categories
  state.chartOptions.series = [
    {
      name: name,
      data: dummyData,
    },
  ]

  console.log('Chart data updated:', {
    categories,
    data: dummyData,
    name,
  })

  saveFilter()

  // Use nextTick to ensure DOM is updated before accessing chart
  nextTick(() => {
    if (chartRef && chartRef.chart) {
      chartRef.chart.update({
        xAxis: {
          categories: categories,
        },
        series: [
          {
            name: name,
            data: dummyData,
          },
        ],
      })
      console.log('Chart updated with new data')
    }
  })
}

// Initialize chart data based on selected filter
updateChartData(state.selectedFilter)
</script>

<template>
  <main>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-end items-center">
      <div class="flex items-center">
        <button
          class="bg-base text-secondary px-4 py-1.5 rounded-l-md cursor-pointer border-r-secondary border-r-2 text-sm"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div class="bg-base text-secondary px-2 py-1.5 font-bold text-sm">Mar 2025</div>
        <button
          class="bg-base text-secondary px-4 py-1.5 rounded-r-md cursor-pointer border-l-secondary border-l-2 text-sm"
        >
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <div class="px-4 flex gap-2">
      <div class="w-2 bg-sub min-h-[2px] rounded"></div>
      <div class="flex flex-col text-2xl text-base">
        <h1 class="flex flex-col">Welcome</h1>
        <span class="font-bold">{{ user.value?.username }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-col md:flex-row gap-4 w-full mt-5 px-4">
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
        <h2 class="text-xl font-bold mb-4 text-white">Revenue</h2>
        <div>
          <button
            class="flex gap-2 items-center font-bold cursor-pointer text-white"
            @click="toggleDropdown"
          >
            {{ state.selectedFilter.label }} <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="relative inline-block">
            <ul
              class="bg-white shadow-lg rounded-md absolute z-10"
              :class="{ block: state.isDropdownOpen, hidden: !state.isDropdownOpen }"
            >
              <li
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                @click="changeFilter(filter)"
                v-for="filter in filterOptions"
                :key="filter.value"
              >
                {{ filter.label }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="flex justify-center place-content-center h-[300px] my-10 w-full text-base">
        <!-- Placeholder for chart component -->
        <highcharts
          id="chart"
          class="mx-auto w-full max-w-5xl"
          :options="state.chartOptions"
          ref="chartRef"
        ></highcharts>
      </div>
    </div>
  </main>
</template>
