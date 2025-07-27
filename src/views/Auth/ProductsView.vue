<script setup>
import products_component from '@/components/Products.vue'
import AlertComponent from '@/components/AlertComponent.vue'
import { onMounted, ref, watchEffect } from 'vue'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'
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
const loadingShow = ref(false)
const imageDelete = ref(null)

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
function openDeleteModal(id, imageId) {
  message.value = `Are you sure you want to delete?`
  show.value = true
  modalType.value = 'delete'
  deleteId.value = id
  imageDelete.value = imageId // Store the image ID for deletion
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
  const response = await axios.get(`${STRAPI_URL}/api/products?populate=*`)
  products.value = response.data.data
  // Sort product by date created desc
  products.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  localStorage.setItem('products', JSON.stringify(products.value))
  totalDataOnMounted.value = products.value.length // Store the total data count on mounted
}

// Function to delete a product
const deleteProduct = async () => {
  const notif = push.promise({
    type: 'info',
    message: 'Deleting product...',
    duration: 0,
  })
  try {
    await axios.delete(`${STRAPI_URL}/api/products/${deleteId.value}`)
    await axios.delete(`${STRAPI_URL}/api/upload/files/${imageDelete.value}`) // Assuming product images are stored separately
    getProducts() // Refresh the product list after deletion
    show.value = false // Close the modal
    notif.resolve({
      type: 'success',
      message: 'Product deleted successfully!',
      duration: 3000,
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to delete product. Please try again.',
      duration: 3000,
    })
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
  const notif = push.promise({
    type: 'info',
    message: 'Adding product...',
    duration: 0,
  })
  try {
    const category_id = categories.value.find(
      (cat) => cat.category === selectedCategory.value,
    )?.documentId

    loadingShow.value = true // Show loading indicator

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

    // Upload image if available
    const imageFile = imageInput.value ? imageInput.value.files[0] : null

    const productRes = await axios.post(`${STRAPI_URL}/api/products`, {
      data,
    })

    // Upload image
    if (imageFile) {
      const fd = new FormData()
      fd.append('files', imageFile)

      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: fd,
      })

      // Check if upload was successful
      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json()
        const imageId = uploadResult[0].id

        // Update product with image ID
        await axios
          .put(`${STRAPI_URL}/api/products/${productRes.data.data.documentId}`, {
            data: {
              product_image: imageId, // Assuming product_image is the field for the image
            },
          })
          .then(() => {
            loadingShow.value = false // Hide loading indicator
          })
      }
    }

    // Reset form fields
    selectedCategory.value = ''
    codeProduct.value = ''
    nameProduct.value = ''
    descriptionProduct.value = ''
    priceProduct.value = ''
    quantityProduct.value = 1
    if (imageInput.value && imageInput.value.value !== undefined) {
      imageInput.value.value = null // Reset the file input
    }
    imgPreview.value = false // Hide the image preview
    buttonClear.value = false // Hide the clear button
    const img = document.querySelector('#image-preview')
    if (img) img.src = ''

    getProducts() // Refresh the product list after adding a new product

    notif.resolve({
      type: 'success',
      message: 'Product added successfully!',
      duration: 3000,
    })
  } catch (error) {
    // Handle errors
    console.error('Error posting product:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to add product. Please try again.',
      duration: 3000,
    })
  }
}

// Watch for changes in products to update total data count
onMounted(() => {
  try {
    if (categories.value.length === 0) {
      getCategories() // Fetch categories when the component is mounted
    }
    getProducts() // Fetch products when the component is mounted
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

// Reactive variable for image input
const imgPreview = ref(false)
const buttonClear = ref(false)

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
        imgPreview.value = true // Show the image preview
        buttonClear.value = true
      }
    }
    reader.readAsDataURL(file)
  }
}

function clearImageHandle() {
  const img = document.querySelector('#image-preview')
  if (img) {
    img.src = ''
    imgPreview.value = false // Hide the image preview
    buttonClear.value = false // Hide the clear button
  }
  if (imageInput.value) {
    imageInput.value.value = null // Reset the file input
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
            @submit.prevent
          >
            <div class="flex gap-4 items-center">
              <div id="image_upload" class="flex items-center justify-center bg-gray-100 rounded">
                <input
                  type="file"
                  class="hidden"
                  id="image"
                  name="image"
                  accept="image/*"
                  @change="handleImageUpload($event)"
                  ref="imageInput"
                />
                <div
                  v-show="!imgPreview"
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
                    class="object-contain w-[150px] h-[150px] rounded-top cursor-pointer"
                    alt=""
                    v-show="imgPreview"
                  />
                  <button
                    type="button"
                    class="text-xs text-gray-500 cursor-pointer"
                    @click="clearImageHandle"
                    v-show="buttonClear"
                  >
                    Clear Image
                  </button>
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
                  @click="postProduct"
                  type="button"
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
      <Notivue v-slot="item">
        <Notification :item="item" :theme="pastelTheme">
          <NotificationProgress :item="item" />
        </Notification>
      </Notivue>
    </div>
  </div>
</template>
