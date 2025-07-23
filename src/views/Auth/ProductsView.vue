<script setup>
import products_component from '@/components/Products.vue'
import AlertComponent from '@/components/AlertComponent.vue'

import { onMounted, ref, watchEffect } from 'vue'
import axios from 'axios'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

const categories = ref([]) // Reactive variable to hold categories
const products = ref([]) // Reactive variable to hold products
const message = ref('Ini Message')
const show = ref(false)
const modalType = ref('warning')
const totalDataOnMounted = ref(0)
const deleteId = ref(null)

try {
  const storedCategories = localStorage.getItem('categories')
  if (storedCategories) {
    categories.value = JSON.parse(storedCategories)
  }

  const storedProducts = localStorage.getItem('products')
  if (storedProducts) {
    products.value = JSON.parse(storedProducts)
  }
} catch (error) {
  console.error('Error parsing data from localStorage:', error)
  categories.value = []
  products.value = []
}

// For Products Component modal
const openDeleteModal = (id) => {
  message.value = `Are you sure you want to delete?`
  show.value = true
  modalType.value = 'delete'
  deleteId.value = id
}

const closeDeleteModal = () => {
  show.value = false
}

const getCategories = async () => {
  const response = await axios.get(`${STRAPI_URL}/api/product-categories`)
  categories.value = response.data.data

  localStorage.setItem('categories', JSON.stringify(categories.value))
}

const getProducts = async () => {
  const response = await axios.get(
    `${STRAPI_URL}/api/products?populate=product_category`,
  )
  products.value = response.data.data
  // Sort product by date created desc
  products.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  localStorage.setItem('products', JSON.stringify(products.value))
}

const deleteProduct = async () => {
  try {
    await axios.delete(`${STRAPI_URL}/api/products/${deleteId.value}`)
    getProducts() // Refresh the product list after deletion
    show.value = false // Close the modal
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}

const getNextAvailableProductCode = (categoryName) => {
  const matchedCategory = categories.value.find((cat) => cat.category === categoryName)
  if (!matchedCategory) return `${categoryName}_1`

  // Filter produk yang sesuai kategori
  const filteredProducts = products.value.filter(
    (product) => product.product_category.category === categoryName,
  )

  // Ambil angka dari code produk (misal: Roti_3 -> 3)
  const usedNumbers = filteredProducts
    .map((product) => {
      const match = product.product_code?.match(new RegExp(`${categoryName}_(\\d+)`))
      return match ? parseInt(match[1]) : null
    })
    .filter((n) => n !== null)

  // Cari angka terkecil yang belum digunakan
  let i = 1
  while (usedNumbers.includes(i)) {
    i++
  }

  return `${categoryName}_${i}`
}

// Reactive Variable for input
const selectedCategory = ref('')
const codeProduct = ref('')
const nameProduct = ref('')
const descriptionProduct = ref('')
const priceProduct = ref('')
const quantityProduct = ref(1)

function handlePriceInput(event) {
  const input = event.target.value
  const numericValue = input.replace(/[^0-9]/g, '')
  // Format with dot as thousand separator, no "Rp"
  priceProduct.value = numericValue ? numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

const postProduct = async () => {
  const category_id = categories.value.find(
    (cat) => cat.category === selectedCategory.value,
  )?.documentId

  const data = {
    product_category: category_id,
    product_code: codeProduct.value,
    product_name: nameProduct.value,
    product_description: descriptionProduct.value,
    product_price: Number(priceProduct.value.replace(/[^0-9]/g, '')),
    product_qty: quantityProduct.value,
  }

  if (
    !data.product_category ||
    !data.product_code ||
    !data.product_name ||
    !data.product_description ||
    !data.product_price ||
    !data.product_qty
  ) {
    modalType.value = 'warning'
    message.value = 'Please fill in all fields'
    show.value = true
    return
  }

  await axios.post(`${STRAPI_URL}/api/products`, {
    data,
  })

  selectedCategory.value = ''
  codeProduct.value = ''
  nameProduct.value = ''
  descriptionProduct.value = ''
  priceProduct.value = ''
  quantityProduct.value = 1

  getProducts() // Refresh the product list after adding a new product
}

onMounted(() => {
  if (categories.value.length === 0) {
    getCategories() // Fetch categories when the component is mounted
  }
  if (products.value.length === 0) {
    getProducts() // Fetch products when the component is mounted
  }
  watchEffect(() => {
    if (!selectedCategory.value || products.value.length === 0) {
      codeProduct.value = ''
      return
    }
    codeProduct.value = getNextAvailableProductCode(selectedCategory.value)
  })
  totalDataOnMounted.value = products.value.length // Store the total data count on mounted
})

</script>

<template>
  <div class="px-4">
    <div class="mt-4">
      <div class="bg-white rounded-xl mb-4 shadow">
        <div class="bg-base text-secondary p-4 rounded-t-xl">
          <h1 class="text-xl font-bold">Add Products</h1>
        </div>
        <div class="px-6 py-2">
          <form
            method="post"
            enctype="multipart/form-data"
            action=""
            id="add_product"
            class="flex flex-col gap-4 my-4"
            @submit="postProduct"
            @submit.prevent
          >
            <div class="flex gap-4">
              <select
                name="product_category"
                id=""
                v-model="selectedCategory"
                class="border border-base p-2 rounded min-w-[250px] bg-white text-base focus:outline-base-500 focus:outline-offset-2 focus:outline-2 transition-all duration-300"
                defaultValue=""
              >
                <option value="" disabled>Select Category</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.category"
                >
                  {{ category.category }}
                </option>
              </select>
              <input
                name="product_code"
                type="text"
                class="border border-base p-2 rounded w-fit bg-gray-100 text-base"
                v-model="codeProduct"
                disabled
              />
            </div>
            <div class="flex flex-wrap gap-4">
              <input
                name="product_name"
                type="text"
                class="border border-base p-2 rounded min-w-[250px] bg-white text-base focus:outline-base-500 focus:outline-offset-2 focus:outline-2 transition-all duration-300"
                placeholder="Product Name"
                v-model="nameProduct"
              />
              <input
                name="product_description"
                type="text"
                class="border border-base p-2 rounded min-w-[250px] bg-white text-base focus:outline-base-500 focus:outline-offset-2 focus:outline-2 transition-all duration-300"
                placeholder="Description"
                v-model="descriptionProduct"
              />
              <input
                name="product_price"
                type="text"
                v-model="priceProduct"
                @input="handlePriceInput"
                class="border border-base p-2 rounded min-w-[250px] bg-white text-base focus:outline-base-500 focus:outline-offset-2 focus:outline-2 transition-all duration-300"
                placeholder="Price"
              />
              <input
                name="product_qty"
                type="number"
                class="border border-base p-2 rounded min-w-[250px] bg-white text-base focus:outline-base-500 focus:outline-offset-2 focus:outline-2 transition-all duration-300"
                placeholder="Quantity"
                v-model="quantityProduct"
              />
            </div>
            <div>
              <button
                type="submit"
                class="bg-sub text-white px-4 py-2 min-w-[250px] rounded hover:bg-yellow-600 transition-colors cursor-pointer"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
      <products_component
        @deleteProduct="deleteProduct"
        @openDeleteModal="openDeleteModal"
        @closeDeleteModal="closeDeleteModal"
        :products="products"
        :totalDataOnMounted="totalDataOnMounted"
      />
      <alert-component :message="message" :show="show" @close="show = false" :type="modalType" @confirm="deleteProduct"/>
    </div>
  </div>
</template>
