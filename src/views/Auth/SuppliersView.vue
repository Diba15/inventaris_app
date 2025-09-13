<script setup>
import { ref, computed, nextTick, watchEffect, onMounted } from 'vue'
import SupplierCard from '@/components/supplier/SupplierCard.vue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import CustomModal from '@/components/CustomModal.vue'

defineOptions({
  name: 'supplier_component',
})

const dummySupplierList = ref([
  {
    id: 1,
    name: 'P.T Indofood',
    arrive_at: '2022-01-01',
    courier_name: 'JNE',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Indofood_logo-en.svg/2560px-Indofood_logo-en.svg.png',
    total_cost: 10000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-01 00:00:00',
  },
  {
    id: 2,
    name: 'Unilever',
    arrive_at: '2022-01-02',
    courier_name: 'J&T',
    img: 'https://upload.wikimedia.org/wikipedia/id/3/37/Unilever.png',
    total_cost: 20000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-02 00:00:00',
  },
  {
    id: 3,
    name: 'Wings Group',
    arrive_at: '2022-01-03',
    courier_name: 'SiCepat',
    img: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Wings_%28Indonesian_company%29_logo.svg',
    total_cost: 30000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-03 00:00:00',
  },
  {
    id: 4,
    name: 'Orang Tua',
    arrive_at: '2022-01-04',
    courier_name: 'JNE',
    img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi6rsc0issrrP5wz90_ALseipslxuZq40VxV5HzFFtGCVCE2XeQPk8ZoRQWBPCRsVtAHwFDYsCQyqJqpuuEP71wdKHjC8gdFdam-wNfsbwiFrQCtByDJdov1Llh9bnI9NfIx-JIDq7fUB14PpPKqG0oDadVNmedyploPT9JiWF_98UVLnjRjXyRpnnMZszG/s804/ot-svg.webp',
    total_cost: 40000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-04 00:00:00',
  },
  {
    id: 5,
    name: 'Nestle',
    arrive_at: '2022-01-05',
    courier_name: 'J&T',
    img: 'https://logos-world.net/wp-content/uploads/2020/09/Nestle-Logo.png',
    total_cost: 50000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-05 00:00:00',
  },
  {
    id: 6,
    name: 'Mayora',
    arrive_at: '2022-01-06',
    courier_name: 'SiCepat',
    img: '',
    total_cost: 60000,
    other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    created_at: '2022-01-06 00:00:00',
  },
])

// --- LOGIKA MODAL TAMBAH SUPPLIER ---
const isAddModalOpen = ref(false)
const newSupplier = ref({
  name: '',
  arrive_at: '',
  courier_name: '',
  total_cost: null,
  img: '',
  other: '',
})

function openAddModal() {
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
  // Reset form fields
  newSupplier.value = {
    name: '',
    arrive_at: '',
    courier_name: '',
    total_cost: null,
    img: '',
    other: '',
  }
}

function handleAddSupplier() {
  if (!newSupplier.value.name || !newSupplier.value.arrive_at) {
    alert('Supplier Name and Arrive At date are required.')
    return
  }
  const supplierToAdd = {
    id: Date.now(), // Gunakan ID unik sementara
    ...newSupplier.value,
    total_cost: Number(newSupplier.value.total_cost) || 0,
    created_at: new Date().toISOString(),
  }
  dummySupplierList.value.unshift(supplierToAdd) // Tambahkan ke awal list
  closeAddModal()
}
// Enhanced state management
const startPage = ref(0)
const totalData = ref(0)
const currentPage = ref(1)
const searchTerm = ref('') // Add reactive search term

const carousel = ref(null) // Template ref untuk elemen carousel
const isDown = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

function handleMouseDown(e) {
  if (!carousel.value) return
  isDown.value = true
  carousel.value.classList.add('active')
  startX.value = e.pageX - carousel.value.offsetLeft
  scrollLeft.value = carousel.value.scrollLeft
}

function handleMouseLeave() {
  if (!carousel.value) return
  isDown.value = false
  carousel.value.classList.remove('active')
}

function handleMouseUp() {
  if (!carousel.value) return
  isDown.value = false
  carousel.value.classList.remove('active')
}

function handleMouseMove(e) {
  if (!isDown.value || !carousel.value) return
  e.preventDefault()
  const x = e.pageX - carousel.value.offsetLeft
  const walk = (x - startX.value) * 2 // Angka 2 untuk mempercepat scroll
  carousel.value.scrollLeft = scrollLeft.value - walk
}

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
</script>

<template>
  <div class="flex flex-col mx-4 my-4 gap-6">
    <div class="bg-white rounded-xl mb-4 shadow">
      <div
        class="bg-base text-secondary p-6 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <div>
          <h1 class="text-2xl font-bold">Suppliers</h1>
          <p class="text-[var(--color-secondary)] opacity-80 mt-1">Manage your suppliers</p>
        </div>
        <button
          @click="openAddModal"
          class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors mt-4 md:mt-0 self-end md:self-center cursor-pointer"
        >
          Add Supplier
        </button>
      </div>

      <div class="py-4 px-8 flex flex-col gap-4">
        <div class="relative w-full max-w-[600px] mx-auto">
          <!-- Search Icon -->
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fa fa-search text-gray-500"></i>
          </div>

          <!-- Input Field -->
          <input
            type="text"
            id="searchSupplier"
            placeholder="Search suppliers by name, courier, cost, or description..."
            class="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-10 text-base placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sub focus:border-sub"
            :value="searchTerm"
            @input="handleSearch"
          />

          <!-- Clear Search Button -->
          <div v-if="isSearching" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              @click="clearSearch"
              class="text-gray-500 hover:text-red-500 focus:outline-none"
              title="Clear search"
            >
              <i class="fa fa-times-circle"></i>
            </button>
          </div>
        </div>

        <!-- Search Results Info for Cards -->
        <div v-if="isSearching" class="px-0 mb-2 text-sm text-gray-600 text-center">
          <span v-if="filteredSuppliersForCards.length > 0">
            Found {{ filteredSuppliersForCards.length }} supplier(s) for "{{ searchTerm }}"
          </span>
          <span v-else class="text-orange-600"> No suppliers found for "{{ searchTerm }}" </span>
        </div>

        <!-- Enhanced Supplier Carousel with Drag Events -->
        <div
          id="supplier-carousel"
          ref="carousel"
          class="flex flex-nowrap gap-10 items-center overflow-x-scroll max-w-screen"
          @mousedown="handleMouseDown"
          @mouseleave="handleMouseLeave"
          @mouseup="handleMouseUp"
          @mousemove="handleMouseMove"
        >
          <!-- Show filtered suppliers in cards -->
          <supplier-card
            v-for="supplier in filteredSuppliersForCards"
            :key="supplier.id"
            :name="supplier.name"
            :courier="supplier.courier_name"
            :cost="supplier.total_cost"
            :arrive-date="supplier.arrive_at"
            :img="supplier.img"
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
              class="mt-2 px-4 py-2 bg-sub text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Supplier Modal -->
    <custom-modal
      :is-add-modal-open="isAddModalOpen"
      @close-add-modal="closeAddModal"
      modal-title="Add New Supplier"
    >
      <form @submit.prevent="handleAddSupplier" class="space-y-4">
        <StandardFloatingInput
          label="Supplier Name"
          type="text"
          id="name"
          name="name"
          required
          v-model="newSupplier.name"
        />
        <StandardFloatingInput
          label="Arrive At"
          type="date"
          id="arrive_at"
          name="arrive_at"
          required
          v-model="newSupplier.arrive_at"
        />
        <StandardFloatingInput
          label="Courier Name"
          type="text"
          id="courier_name"
          name="courier_name"
          v-model="newSupplier.courier_name"
        />
        <StandardFloatingInput
          label="Total Cost"
          type="number"
          id="total_cost"
          name="total_cost"
          v-model="newSupplier.total_cost"
        />
        <StandardFloatingInput
          label="Image URL"
          type="text"
          id="img"
          name="img"
          v-model="newSupplier.img"
        />
        <StandardFloatingInput
          label="Description"
          type="textarea"
          id="other"
          name="other"
          v-model="newSupplier.other"
        />
        <div class="flex justify-end gap-4 pt-4">
          <button
            type="button"
            @click="closeAddModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-sub text-white rounded-lg hover:bg-sub/90 transition-colors"
          >
            Save Supplier
          </button>
        </div>
      </form>
    </custom-modal>
  </div>
</template>

<style scoped>
#supplier-carousel::-webkit-scrollbar {
  display: none;
}

/* Style tambahan untuk feedback visual saat drag */
#supplier-carousel {
  cursor: grab;
  user-select: none; /* Mencegah seleksi teks saat drag */
}

#supplier-carousel.active {
  cursor: grabbing;
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
