<script setup>
import products_component from '@/components/Products.vue'
import ProductOutboundComponent from '@/components/ProductOutboundComponent.vue'
import AlertComponent from '@/components/AlertComponent.vue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import AutoCompleteInput from '@/components/AutoCompleteInput.vue'
import FloatingInputWithImage from '@/components/FloatingInputWithImage.vue'
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
const imageDelete = ref(null)
const tab = ref('inbounds') // 'inbounds' or 'outbounds'

// --- Image Upload State (Refactored) ---
const imageInput = ref(null) // Ref for the file input element
const imageUrl = ref(null) // Ref for the image preview URL
const selectedFile = ref(null) // Ref to store the selected file object

// --- Input State for Inbounds ---
const selectedCategory = ref('')
const codeProduct = ref('')
const nameProduct = ref('')
const descriptionProduct = ref('')
const priceProduct = ref('')
const quantityProduct = ref(1)

// --- Input State for Outbounds ---
const selectedProductOutbound = ref('')
const quantityOutbound = ref(1)
const destinationOutbound = ref('')
const notesOutbound = ref('')
const outboundsData = ref([])
const totalDataOnMountedOutbound = ref(outboundsData?.value.length) // Store the total data count on mounted for outbound

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

const getOutbounds = async () => {
  const response = await axios.get(`${STRAPI_URL}/api/outbound-products?populate=*`)
  outboundsData.value = response.data.data
  // Sort product by date created desc
  outboundsData.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  localStorage.setItem('outbounds', JSON.stringify(outboundsData.value))
  totalDataOnMountedOutbound.value = outboundsData.value.length // Store the total data count on mounted
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

    deleteId.value = null
    imageDelete.value = null
  } catch (error) {
    console.error('Error deleting product:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to delete product. Please try again.',
      duration: 3000,
    })
  }
}

const deleteOutbound = async () => {
  const notif = push.promise({
    type: 'info',
    message: 'Deleting outbound...',
    duration: 0,
  })
  try {
    await axios.delete(`${STRAPI_URL}/api/outbound-products/${deleteId.value}`)
    getOutbounds()
    show.value = false // Close the modal
    notif.resolve({
      type: 'success',
      message: 'Outbound Product deleted successfully!',
      duration: 3000,
    })

    deleteId.value = null
  } catch (error) {
    console.error('Error deleting product:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to delete outbound. Please try again.',
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
      notif.reject({
        type: 'warning',
        message: 'Please fill in all required fields',
        duration: 3000,
      })
      return
    }

    const productRes = await axios.post(`${STRAPI_URL}/api/products`, {
      data,
    })

    // Upload image if available
    if (selectedFile.value) {
      const fd = new FormData()
      fd.append('files', selectedFile.value)

      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: fd,
      })

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json()
        const imageId = uploadResult[0].id

        // Update product with image ID
        await axios.put(`${STRAPI_URL}/api/products/${productRes.data.data.documentId}`, {
          data: {
            product_image: imageId,
          },
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
    clearImageHandle() // Reset image uploader

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

const posOutbounds = async () => {
  const notif = push.promise({
    type: 'info',
    message: 'Adding outbound item...',
    duration: 0,
  })
  try {
    const product_id = products.value.find(
      (prod) => prod.product_name === selectedProductOutbound.value.product_name,
    )?.documentId

    console.log('Selected Product ID:', product_id)
    console.log('selected product outbound value:', selectedProductOutbound.value)

    const data = {
      product: product_id,
      qty: quantityOutbound.value,
      destination: destinationOutbound.value,
      notes: notesOutbound.value,
    }

    console.log('Data: ', data)

    if (!data.product || !data.qty || !data.destination) {
      modalType.value = 'warning'
      message.value = 'Please fill in all required fields'
      show.value = true
      return
    }

    await axios.post(`${STRAPI_URL}/api/outbound-products`, {
      data,
    })

    await axios.put(`${STRAPI_URL}/api/products/${product_id}`, {
      data: {
        product_qty:
          products.value.find((prod) => prod.documentId === product_id)?.product_qty -
          quantityOutbound.value,
      },
    })

    // Reset form fields
    selectedProductOutbound.value = ''
    quantityOutbound.value = 1
    destinationOutbound.value = ''
    notesOutbound.value = ''

    // Get outbounds
    getOutbounds()

    notif.resolve({
      type: 'success',
      message: 'Outbound item added successfully!',
      duration: 3000,
    })
  } catch (error) {
    // Handle errors
    console.error('Error posting outbound item:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to add outbound item. Please try again.',
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
    console.log(categories.value)

    getProducts() // Fetch products when the component is mounted
    getOutbounds()

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

// --- Image Upload Functions (Refactored) ---
function imageUploadHandleClick() {
  imageInput.value.click()
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    imageUrl.value = URL.createObjectURL(file)
  }
}

function clearImageHandle() {
  imageUrl.value = null
  selectedFile.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

function handleDelete() {
  if (tab.value == 'inbounds') {
    deleteProduct()
  } else {
    deleteOutbound()
  }
}
</script>

<template>
  <div class="px-4">
    <div class="mt-4">
      <!-- Tabs of Inbounds and Outbounds Items -->
      <div class="mb-4">
        <div class="flex bg-white w-fit rounded-full shadow p-2">
          <button
            class="px-4 py-2 font-semibold focus:outline-none"
            :class="
              tab === 'inbounds'
                ? 'bg-sub text-white border-b-2 border-sub rounded-full'
                : 'text-gray-500'
            "
            @click="tab = 'inbounds'"
          >
            Inbounds
          </button>
          <button
            class="px-4 py-2 font-semibold focus:outline-none"
            :class="
              tab === 'outbounds'
                ? 'bg-sub text-white border-b-2 border-sub rounded-full'
                : 'text-gray-500'
            "
            @click="tab = 'outbounds'"
          >
            Outbounds
          </button>
        </div>
      </div>

      <!-- Add Product Form -->
      <div class="bg-white rounded-xl mb-4 shadow" v-if="tab === 'inbounds'">
        <div
          class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
        >
          <h1 class="text-xl font-bold self-start md:self-center">Add Products</h1>
          <button
            @click="postProduct"
            type="button"
            class="bg-white/20 hover:bg-white/30 self-end-safe text-white px-4 py-2 min-w-[100px] h-[40px] rounded transition-colors cursor-pointer"
          >
            Add Product
          </button>
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
            <div class="flex flex-col md:flex-row gap-4 items-center w-full">
              <div id="image_upload" class="w-full md:w-60 flex-shrink-0">
                <!-- Placeholder when no image is selected -->
                <div
                  v-if="!imageUrl"
                  @click="imageUploadHandleClick"
                  class="flex justify-center items-center w-full h-40 px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-sub transition-colors duration-200"
                >
                  <div class="space-y-1 text-center">
                    <i class="fa-regular fa-image text-gray-400 text-5xl"></i>
                    <p class="text-sm text-gray-600">Click to upload image</p>
                  </div>
                </div>

                <!-- Image Preview when an image is selected -->
                <div v-else class="relative w-full h-40">
                  <img
                    :src="imageUrl"
                    alt="Image Preview"
                    class="w-full h-full object-cover rounded-md shadow-md"
                  />
                  <button
                    @click="clearImageHandle"
                    type="button"
                    class="absolute top-2 right-2 bg-white bg-opacity-75 rounded-full p-1.5 text-gray-700 hover:bg-opacity-100 hover:text-red-600 focus:outline-none transition-colors"
                    title="Remove image"
                  >
                    <svg
                      class="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <input
                  type="file"
                  class="hidden"
                  accept="image/*"
                  @change="handleImageUpload($event)"
                  ref="imageInput"
                />
              </div>
              <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-col md:flex-row gap-4">
                  <AutoCompleteInput
                    id="product_category"
                    label="Select Category"
                    placeholder="Type to search categories..."
                    v-model="selectedCategory"
                    :options="categories"
                    option-label="category"
                    option-value="category"
                    :required="true"
                    class="w-full max-w-md"
                    @select="handleCategorySelect"
                  />
                  <StandardFloatingInput
                    id="product_code"
                    type="text"
                    name="product_code"
                    placeholder="Product Code"
                    label="Product Code"
                    v-model="codeProduct"
                    class="max-w-md w-full"
                    :disabled="true"
                  />
                </div>
                <div class="flex flex-col flex-wrap gap-4 w-full">
                  <div class="flex flex-col md:flex-row gap-4">
                    <StandardFloatingInput
                      id="product_name"
                      type="text"
                      name="product_name"
                      placeholder="Product Name"
                      label="Product Name"
                      v-model="nameProduct"
                      class="max-w-md w-full"
                    />
                    <StandardFloatingInput
                      id="product_description"
                      type="text"
                      name="product_description"
                      placeholder="Description"
                      label="Description"
                      v-model="descriptionProduct"
                      class="max-w-md w-full"
                    />
                  </div>
                  <div class="flex flex-col md:flex-row gap-4">
                    <StandardFloatingInput
                      id="product_price"
                      type="text"
                      name="product_price"
                      placeholder="Price"
                      label="Price"
                      v-model="priceProduct"
                      class="max-w-md w-full"
                      @handlePriceInput="handlePriceInput"
                    />
                    <StandardFloatingInput
                      id="product_qty"
                      type="number"
                      name="product_qty"
                      placeholder="Quantity"
                      label="Quantity"
                      v-model="quantityProduct"
                      class="max-w-md w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Outbounds Items Form -->
      <div class="bg-white rounded-xl mb-4 shadow" v-if="tab === 'outbounds'">
        <div
          class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
        >
          <h1 class="text-xl font-bold self-start md:self-center">Add Outbound Items</h1>
          <button
            type="button"
            @click="posOutbounds"
            class="bg-white/20 hover:bg-white/30 self-end-safe text-white px-4 py-2 min-w-[100px] h-[40px] rounded transition-colors cursor-pointer"
          >
            Add Outbound
          </button>
        </div>
        <div class="px-6 py-2">
          <form
            method="post"
            enctype="multipart/form-data"
            action=""
            id="add_outbound"
            class="flex flex-col gap-4 my-4"
            @submit.prevent
          >
            <div class="flex flex-col md:flex-row gap-4 items-center w-full">
              <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-col md:flex-row gap-4">
                  <FloatingInputWithImage
                    id="outbound_product"
                    label="Select Product"
                    placeholder="Type to search products..."
                    v-model="selectedProductOutbound"
                    :options="products"
                    option-label="product_name"
                    option-value="Product_code"
                    image-src=""
                    :required="true"
                    class="w-full"
                    @select="handleCategorySelect"
                  />
                  <StandardFloatingInput
                    id="outbound_quantity"
                    type="number"
                    name="outbound_quantity"
                    placeholder="Quantity"
                    label="Quantity"
                    v-model="quantityOutbound"
                    class="w-full"
                  />
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                  <StandardFloatingInput
                    id="outbound_destination"
                    type="text"
                    name="outbound_destination"
                    placeholder="Destination"
                    label="Destination"
                    v-model="destinationOutbound"
                    class="w-full"
                  />
                  <StandardFloatingInput
                    id="outbound_notes"
                    type="text"
                    name="outbound_notes"
                    placeholder="Notes (optional)"
                    label="Notes (optional)"
                    v-model="notesOutbound"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <products_component
        v-if="tab === 'inbounds'"
        @deleteProduct="deleteProduct"
        @openDeleteModal="openDeleteModal"
        @closeDeleteModal="closeDeleteModal"
        :products="products"
        :totalDataOnMounted="totalDataOnMounted"
      />

      <ProductOutboundComponent
        v-if="tab === 'outbounds'"
        @deleteProduct="deleteOutbound"
        @openDeleteModal="openDeleteModal"
        @closeDeleteModal="closeDeleteModal"
        :products="outboundsData"
        :totalDataOnMounted="totalDataOnMountedOutbound"
      />

      <alert-component
        :message="message"
        :show="show"
        @close="show = false"
        :type="modalType"
        @confirm="handleDelete"
      />
      <Notivue v-slot="item">
        <Notification :item="item" :theme="pastelTheme">
          <NotificationProgress :item="item" />
        </Notification>
      </Notivue>
    </div>
  </div>
</template>
