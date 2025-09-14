<script setup>
import { ref, computed, nextTick, watchEffect, onMounted } from 'vue'
import SupplierCard from '@/components/supplier/SupplierCard.vue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import CustomModal from '@/components/CustomModal.vue'
import axios from 'axios'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'

defineOptions({
  name: 'supplier_component',
})

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL
const suppliers = ref([])

// Enhanced state management
const startPage = ref(0)
const totalData = ref(0)
const currentPage = ref(1)
const searchTerm = ref('') // Add reactive search term

const carousel = ref(null) // Template ref untuk elemen carousel

// Limit supplier for display
const displayLimit = ref(6)

try {
  suppliers.value = JSON.parse(localStorage.getItem('suppliers'))
} catch (error) {
  console.error('Error parsing suppliers from localStorage:', error)
}

async function getSuppliers() {
  const response = await axios.get(`${STRAPI_URL}/api/suppliers?populate=*`)
  suppliers.value = response.data.data

  localStorage.setItem('suppliers', JSON.stringify(suppliers.value))

  // Sort supplier by date created desc
  suppliers.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

async function postSuppliers() {
  const notif = push.promise({
    type: 'info',
    message: 'Adding supplier...',
    duration: 0,
  })
  try {
    const data = {
      supplier_name: newSupplier.value.name,
      supplier_address: newSupplier.value.address,
      pic_contact: newSupplier.value.contact,
      pic_supplier: newSupplier.value.picName,
    }

    if (!data.supplier_name || !data.supplier_address || !data.pic_contact || !data.pic_supplier) {
      console.error('Please fill in all required fields')
      return
    }

    await axios.post(`${STRAPI_URL}/api/suppliers`, {
      data,
    })

    // // Upload image if available
    // if (selectedFile.value) {
    //   const fd = new FormData()
    //   fd.append('files', selectedFile.value)

    //   const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
    //     method: 'POST',
    //     body: fd,
    //   })

    //   if (uploadRes.ok) {
    //     const uploadResult = await uploadRes.json()
    //     const imageId = uploadResult[0].id

    //     // Update product with image ID
    //     await axios.put(`${STRAPI_URL}/api/products/${productRes.data.data.documentId}`, {
    //       data: {
    //         product_image: imageId,
    //       },
    //     })
    //   }
    // }

    await getSuppliers()

    notif.resolve({
      type: 'success',
      message: 'Supplier added successfully!',
      duration: 3000,
    })
  } catch (error) {
    // Handle errors
    console.error('Error posting product:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to add supplier. Please try again.',
      duration: 3000,
    })
  }
}

// const dummySupplierList = ref([
//   {
//     id: 1,
//     name: 'P.T Indofood',
//     pic_name: 'Budi Santoso',
//     contact: '0812-1111-2222',
//     address: 'Sudirman Plaza, Jl. Jenderal Sudirman Kav. 76-78, Jakarta',
//     arrive_at: '2022-01-01',
//     courier_name: 'JNE',
//     img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Indofood_logo-en.svg/2560px-Indofood_logo-en.svg.png',
//     total_cost: 10000,
//     other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     created_at: '2022-01-01 00:00:00',
//   },
//   {
//     id: 2,
//     name: 'Unilever',
//     pic_name: 'Citra Lestari',
//     contact: '0813-2222-3333',
//     address: 'Grha Unilever, Jl. BSD Boulevard Barat, Green Office Park Kav. 3, Tangerang',
//     arrive_at: '2022-01-02',
//     courier_name: 'J&T',
//     img: 'https://upload.wikimedia.org/wikipedia/id/3/37/Unilever.png',
//     total_cost: 20000,
//     other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     created_at: '2022-01-02 00:00:00',
//   },
//   {
//     id: 3,
//     name: 'Wings Group',
//     pic_name: 'Agus Wijaya',
//     contact: '0815-3333-4444',
//     address: 'Jl. Tipar Cakung Kav. F 5-7, Cakung Barat, Jakarta Timur',
//     arrive_at: '2022-01-03',
//     courier_name: 'SiCepat',
//     img: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Wings_%28Indonesian_company%29_logo.svg',
//     total_cost: 30000,
//     other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     created_at: '2022-01-03 00:00:00',
//   },
//   {
//     id: 4,
//     name: 'Orang Tua',
//     pic_name: 'Dewi Anggraini',
//     contact: '0817-4444-5555',
//     address: 'OT Building, Jl. Lingkar Luar Barat Kav. 35-36, Cengkareng, Jakarta Barat',
//     arrive_at: '2022-01-04',
//     courier_name: 'JNE',
//     img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi6rsc0issrrP5wz90_ALseipslxuZq40VxV5HzFFtGCVCE2XeQPk8ZoRQWBPCRsVtAHwFDYsCQyqJqpuuEP71wdKHjC8gdFdam-wNfsbwiFrQCtByDJdov1Llh9bnI9NfIx-JIDq7fUB14PpPKqG0oDadVNmedyploPT9JiWF_98UVLnjRjXyRpnnMZszG/s804/ot-svg.webp',
//     total_cost: 40000,
//     other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     created_at: '2022-01-04 00:00:00',
//   },
//   {
//     id: 5,
//     name: 'Nestle',
//     pic_name: 'Rahmat Hidayat',
//     contact: '0818-5555-6666',
//     address: 'Perkantoran Hijau Arkadia, Tower B, Jl. TB Simatupang Kav. 88, Jakarta Selatan',
//     arrive_at: '2022-01-05',
//     courier_name: 'J&T',
//     img: 'https://logos-world.net/wp-content/uploads/2020/09/Nestle-Logo.png',
//     total_cost: 50000,
//     other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     created_at: '2022-01-05 00:00:00',
//   },
//   {
//     id: 6,
//     name: 'Mayora',
//     pic_name: 'Sari Puspita',
//     contact: '0819-6666-7777',
//     address: 'Gedung Mayora, Jl. Tomang Raya No. 21-23, Jakarta Barat',
//     arrive_at: '2022-01-06',
//     courier_name: 'SiCepat',
//     img: '',
//     total_cost: 60000,
//     other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     created_at: '2022-01-06 00:00:00',
//   },
//   {
//     id: 7,
//     name: 'Procter & Gamble',
//     pic_name: 'Andi Pratama',
//     contact: '0852-7777-8888',
//     address: 'Sentral Senayan 8, Jl. Asia Afrika No. 8, Jakarta Pusat',
//     arrive_at: '2022-01-07',
//     courier_name: 'JNE',
//     img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Procter_%26_Gamble_logo.svg/1024px-Procter_%26_Gamble_logo.svg.png',
//     total_cost: 70000,
//     other: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     created_at: '2022-01-07 00:00:00',
//   },
//   {
//     id: 8,
//     name: 'GarudaFood',
//     pic_name: 'Eka Kurniawan',
//     contact: '0856-8888-9999',
//     address: 'Wisma Garudafood, Jl. Bintaro Raya No. 10A, Jakarta Selatan',
//     arrive_at: '2022-01-08',
//     courier_name: 'JNE',
//     img: 'https://upload.wikimedia.org/wikipedia/id/thumb/d/d1/Garudafood_logo.svg/1200px-Garudafood_logo.svg.png',
//     total_cost: 80000,
//     other: 'Another supplier description.',
//     created_at: '2022-01-08 00:00:00',
//   },
//   {
//     id: 9,
//     name: 'Kao Corporation',
//     pic_name: 'Fitriani',
//     contact: '0857-9999-0000',
//     address: 'Jl. MT Haryono Kav. 33, Jakarta Industrial Estate Pulogadung, Jakarta Timur',
//     arrive_at: '2022-01-09',
//     courier_name: 'J&T',
//     img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kao_logo.svg/1200px-Kao_logo.svg.png',
//     total_cost: 90000,
//     other: 'Details about Kao supply.',
//     created_at: '2022-01-09 00:00:00',
//   },
// ])

const isAddModalOpen = ref(false)
const newSupplier = ref({
  name: '',
  address: '',
  contact: '',
  supplier_pic: '',
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
  postSuppliers()
  closeAddModal()
}

// Enhanced search functionality for both table and cards
const filteredSuppliers = computed(() => {
  if (!searchTerm.value.trim()) {
    return suppliers.value
  }

  const search = searchTerm.value.toLowerCase().trim()

  return suppliers.value.filter((supplier) => {
    // Search in multiple fields
    const searchableFields = [
      supplier.supplier_name?.toLowerCase() || '',
      supplier.supplier_address?.toLowerCase() || '',
      supplier.pic_contact?.toLowerCase() || '',
      supplier.pic_supplier?.toLowerCase() || '',
    ]

    // Check if any field contains the search term
    return searchableFields.some((field) => field.includes(search))
  })
})

// Display Suppliers
const displayedSuppliers = computed(() => {
  return filteredSuppliers.value.slice(0, displayLimit.value)
})

// Check that more suppliers are available
const hasMoreSuppliers = computed(() => {
  return displayedSuppliers.value.length < filteredSuppliers.value.length
})

// Function to load more suppliers
function loadMore() {
  displayLimit.value += 6 // Increase the limit to show 6 more cards
}

// Enhanced search function
const handleSearch = (event) => {
  searchTerm.value = event.target.value
  // Reset to first page when searching
  startPage.value = 0
  currentPage.value = 1
  displayLimit.value = 6 // NEW: Reset display limit on new search

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
  displayLimit.value = 6

  nextTick(() => {
    const searchInput = document.querySelector('#searchSupplier')
    const pageInput = document.querySelector('#current-page input')
    if (searchInput) searchInput.value = ''
    if (pageInput) pageInput.value = 1
  })
}

onMounted(async () => {
  if (suppliers.value.length > 0) {
    return
  }

  await getSuppliers()

  watchEffect(() => {
    totalData.value = filteredSuppliers.value.length
  })
})
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
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fa fa-search text-gray-500"></i>
          </div>

          <input
            type="text"
            id="searchSupplier"
            placeholder="Search suppliers by name, courier, cost, or description..."
            class="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-10 text-base placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sub focus:border-sub"
            :value="searchTerm"
            @input="handleSearch"
          />

          <div v-if="searchTerm" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              @click="clearSearch"
              class="text-gray-500 hover:text-red-500 focus:outline-none"
              title="Clear search"
            >
              <i class="fa fa-times-circle"></i>
            </button>
          </div>
        </div>

        <div v-if="searchTerm" class="px-0 mb-2 text-sm text-gray-600 text-center">
          <span v-if="filteredSuppliers.length > 0">
            Found {{ filteredSuppliers.length }} supplier(s) for "{{ searchTerm }}"
          </span>
          <span v-else class="text-orange-600"> No suppliers found for "{{ searchTerm }}" </span>
        </div>

        <div
          id="supplier-carousel"
          ref="carousel"
          class="flex flex-wrap gap-10 items-center justify-center"
        >
          <supplier-card
            v-for="supplier in displayedSuppliers"
            :key="supplier.id"
            :name="supplier.supplier_name"
            :img="supplier?.img"
            :picName="supplier.pic_supplier"
            :contact="supplier.pic_contact"
            :address="supplier.supplier_address"
            class="supplier-card-item"
            :class="{ highlighted: searchTerm }"
          />

          <div
            v-if="!filteredSuppliers.length"
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

        <div v-if="hasMoreSuppliers" class="w-full flex justify-center mt-4">
          <button
            @click="loadMore"
            class="px-6 py-2 bg-sub text-white font-semibold rounded-lg hover:bg-sub/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sub/80 transition-all"
          >
            Load More
          </button>
        </div>
      </div>
    </div>

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
          label="Address"
          type="text"
          id="address"
          name="address"
          required
          v-model="newSupplier.address"
        />
        <StandardFloatingInput
          label="PIC Name"
          type="text"
          id="pic_name"
          name="pic_name"
          v-model="newSupplier.picName"
        />
        <StandardFloatingInput
          label="PIC Contact"
          type="number"
          id="pic_contact"
          name="pic_contact"
          v-model="newSupplier.contact"
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

    <Notivue v-slot="item">
      <Notification :item="item" :theme="pastelTheme">
        <NotificationProgress :item="item" />
      </Notification>
    </Notivue>
  </div>
</template>

<style scoped>
#supplier-carousel::-webkit-scrollbar {
  display: none;
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
