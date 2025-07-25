<script setup>
import products_component from '@/components/Products.vue'
import AlertComponent from '@/components/AlertComponent.vue'
import { onMounted, ref, watchEffect } from 'vue'
import axios from 'axios'

// Environment variable for Strapi URL
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

const categories = ref([]) // Reactive variable to hold categories
const products = ref([]) // Reactive variable to hold products
const message = ref('Ini Message')
const show = ref(false)
const modalType = ref('warning')
const totalDataOnMounted = ref(0)
const deleteId = ref(null)

// Retrieve categories and products from localStorage if available
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

// Function to fetch categories and products
const getCategories = async () => {
  const response = await axios.get(`${STRAPI_URL}/api/product-categories`)
  categories.value = response.data.data

  localStorage.setItem('categories', JSON.stringify(categories.value))
}

const getProducts = async () => {
  const response = await axios.get(`${STRAPI_URL}/api/products?populate=product_category`)
  products.value = response.data.data
  // Sort product by date created desc
  products.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  localStorage.setItem('products', JSON.stringify(products.value))
  totalDataOnMounted.value = products.value.length // Store the total data count on mounted
}

// Function to delete a product
const deleteProduct = async () => {
  try {
    await axios.delete(`${STRAPI_URL}/api/products/${deleteId.value}`)
    getProducts() // Refresh the product list after deletion
    show.value = false // Close the modal
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}

// Function to get the next available product code based on category
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
const imageInput = ref(null)

// Handle price input to format it correctly
function handlePriceInput(event) {
  const input = event.target.value
  const numericValue = input.replace(/[^0-9]/g, '')
  // Format with dot as thousand separator, no "Rp"
  priceProduct.value = numericValue ? numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

// Function to post a new product
const postProduct = async () => {
  try {
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

    const productRes = await axios.post(`${STRAPI_URL}/api/products`, {
      data,
    })

    // Upload image if available
    const productId = productRes.data.data.documentId
    const fd = new FormData()
    const imageFile = imageInput.value?.files?.[0]
    if (imageFile) {
      fd.append('files', imageFile)
      fd.append('refId', productId)
      fd.append('ref', 'api::product.product')
      fd.append('field', 'product_image')
      await axios.post(`${STRAPI_URL}/api/upload`, {
        fd,
      })
    }

    selectedCategory.value = ''
    codeProduct.value = ''
    nameProduct.value = ''
    descriptionProduct.value = ''
    priceProduct.value = ''
    quantityProduct.value = 1
    if (imageInput.value && imageInput.value.value !== undefined) {
      imageInput.value.value = '' // Reset the file input
    }
    const imgPreview = document.querySelector('#image-preview')
    if (imgPreview) {
      imgPreview.src = ''
      imgPreview.classList.add('hidden') // Hide the image preview
    }
    const imgContainer = document.querySelector('#image-icon-container')
    if (imgContainer) {
      imgContainer.classList.remove('hidden') // Show the image icon container
    }

    getProducts() // Refresh the product list after adding a new product
  } catch (error) {
    console.error('Error posting product:', error)
    modalType.value = 'error'
    message.value = 'Failed to add product'
    show.value = true
  }
}

// Watch for changes in products to update total data count
onMounted(() => {
  try {
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
  } catch (error) {
    console.error('Error fetching initial data:', error)
  }
})

function imageUploadHandleClick() {
  const input = document.querySelector('#image_upload input')
  if (input) {
    input.click()
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.querySelector('#image-preview')
      if (img) {
        img.src = e.target.result
        img.classList.remove('hidden')
      }
    }
    reader.readAsDataURL(file)
    const imgContainer = document.querySelector('#image-icon-container')
    imgContainer.classList.add('hidden')
    const imgPreviewContainer = document.querySelector('#image-preview-container')
    if (imgPreviewContainer) {
      imgPreviewContainer.querySelector('button').classList.remove('hidden')
    }
    imageInput.value = event.target // Store the input element for later use
  }
}

function clearImageHandle() {
  const img = document.querySelector('#image-preview')
  if (img) {
    img.src = ''
    img.classList.add('hidden')
  }
  const imgContainer = document.querySelector('#image-icon-container')
  if (imgContainer) {
    imgContainer.classList.remove('hidden')
  }
  if (imageInput.value) {
    imageInput.value.value = '' // Reset the file input
  }
  const imgPreviewContainer = document.querySelector('#image-preview-container')
  if (imgPreviewContainer) {
    imgPreviewContainer.querySelector('button').classList.add('hidden')
  }
}
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
            <div class="flex gap-4 items-center">
              <div id="image_upload" class="flex items-center justify-centerbg-gray-100 rounded">
                <input
                  type="file"
                  class="hidden"
                  id="image"
                  name="image"
                  accept="image/*"
                  @change="handleImageUpload($event)"
                />
                <div
                  id="image-icon-container"
                  class="flex items-center justify-center w-[150px] h-[150px] bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition-all duration-300"
                  @click="imageUploadHandleClick"
                >
                  <i id="image-icon" class="fa-solid fa-image text-3xl text-gray-500"></i>
                </div>
                <div id="image-preview-container" class="flex flex-col items-center mt-2">
                  <img
                    id="image-preview"
                    @click="imageUploadHandleClick"
                    src=""
                    class="object-contain w-[150px] h-[150px] rounded-top hidden cursor-pointer"
                    alt=""
                  />
                  <button type="button" class="text-xs text-gray-500 hidden cursor-pointer" @click="clearImageHandle">Clear Image</button>
                </div>
              </div>
              <div class="flex flex-col gap-4">
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
                <button
                  type="submit"
                  class="bg-sub text-white px-4 py-2 min-w-[250px] rounded hover:bg-yellow-600 transition-colors cursor-pointer"
                >
                  Add Product
                </button>
              </div>
            </div>
            <div class="self-end me-6"></div>
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
      <alert-component
        :message="message"
        :show="show"
        @close="show = false"
        :type="modalType"
        @confirm="deleteProduct"
      />
    </div>
  </div>
</template>
