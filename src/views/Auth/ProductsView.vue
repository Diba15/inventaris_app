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
const suppliers = ref([])
const warehouses = ref([])
const message = ref('Ini Message')
const show = ref(false)
const modalType = ref('warning')
const totalDataOnMounted = ref(0)
const deleteId = ref(null)
const tab = ref('inbounds') // 'inbounds' or 'outbounds'

// --- MODIFIED: Image Upload State for Multiple Images ---
const imageInput = ref(null) // Ref for the file input element
const imageUrls = ref([]) // Ref for multiple image preview URLs (changed from imageUrl)
const selectedFiles = ref([]) // Ref to store multiple selected file objects (changed from selectedFile)
const activePreviewIndex = ref(0) // NEW: To track the main preview image

// Image upload outbound
const imageInputOutbound = ref(null) // Ref for the file input element
const imageUrlsOutbound = ref([]) // Ref for multiple image preview URLs (changed from imageUrl)
const selectedFilesOutbound = ref([]) // Ref to store multiple selected file objects (changed from selectedFile)
const activePreviewIndexOutbound = ref(0) // NEW: To track the main preview image

// --- Input State for Inbounds ---
const selectedCategory = ref('')
const selectedSupplier = ref('')
const selectedWarehouse = ref('')
const codeProduct = ref('')
const nameProduct = ref('')
const descriptionProduct = ref('')
const priceProduct = ref('')
const quantityProduct = ref(1)
const now = new Date()
const transactionDate = ref(now.toISOString().slice(0, 10))
const inboundId = ref('')

// --- Input State for Outbounds ---
const selectedProductOutbound = ref('')
const quantityOutbound = ref(1)
const destinationOutbound = ref('')
const notesOutbound = ref('')
const outboundsData = ref([])
const totalDataOnMountedOutbound = ref(outboundsData?.value.length) // Store the total data count on mounted for outbound
const outboundId = ref('')

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
function openDeleteModal(id) {
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

const getSuppliers = async () => {
  const response = await axios.get(`${STRAPI_URL}/api/suppliers?populate=*`)
  suppliers.value = response.data.data
}

const getWarehouses = async () => {
  const response = await axios.get(`${STRAPI_URL}/api/warehouses?populate=*`)
  warehouses.value = response.data.data
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
    const productToDelete = products.value.find((p) => p.documentId === deleteId.value)
    if (!productToDelete) {
      throw new Error('Product not found.')
    }

    const deletePromises = []

    deletePromises.push(axios.delete(`${STRAPI_URL}/api/products/${deleteId.value}`))

    const images = productToDelete.product_image
    if (images && images.length > 0) {
      images.forEach((image) => {
        deletePromises.push(axios.delete(`${STRAPI_URL}/api/upload/files/${image.id}`))
      })
    }

    await Promise.all(deletePromises)

    await getProducts() // Refresh the product list after deletion
    show.value = false // Close the modal
    notif.resolve({
      type: 'success',
      message: 'Product deleted successfully!',
      duration: 3000,
    })

    deleteId.value = null
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
    const outboundToDelete = outboundsData.value.find((o) => o.documentId === deleteId.value)
    if (!outboundToDelete) {
      throw new Error('Outbound not found.')
    }

    const deletePromises = []

    deletePromises.push(axios.delete(`${STRAPI_URL}/api/outbound-products/${deleteId.value}`))

    const images = outboundToDelete.invoice
    if (images && images.length > 0) {
      images.forEach((image) => {
        deletePromises.push(axios.delete(`${STRAPI_URL}/api/upload/files/${image.id}`))
      })
    }

    await Promise.all(deletePromises)

    await getOutbounds()
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
  // Guard clause: Jika tidak ada nama kategori, kembalikan string kosong.
  if (!categoryName) {
    return ''
  }

  // 1. Filter produk yang hanya sesuai dengan kategori yang dipilih.
  const productsInCategory = products.value.filter(
    (product) => product.product_category?.category === categoryName,
  )

  // 2. **INI PERBAIKANNYA**: Jika tidak ada produk yang ditemukan di kategori ini,
  // artinya ini adalah produk pertama. Langsung kembalikan nomor 1.
  if (productsInCategory.length === 0) {
    return `${categoryName}_1`
  }

  // 3. Jika ADA produk, cari nomor tertinggi yang sudah digunakan.
  const usedNumbers = productsInCategory.map((product) => {
    // Gunakan regex yang lebih ketat (^) untuk memastikan kecocokan dari awal string
    const match = product.product_code?.match(new RegExp(`^${categoryName}_(\\d+)`))
    // Jika cocok, ambil angkanya. Jika tidak, anggap saja 0.
    return match ? parseInt(match[1], 10) : 0
  })

  // 4. Temukan angka tertinggi dari semua nomor yang digunakan.
  const highestNumber = Math.max(...usedNumbers)

  // 5. Kode produk baru adalah angka tertinggi + 1.
  return `${categoryName}_${highestNumber + 1}`
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
      in_id: inboundId.value,
      product_category: category_id,
      warehouse: selectedWarehouse.value,
      supplier_id: selectedSupplier.value,
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

    // --- MODIFIED: Upload multiple images if available ---
    if (selectedFiles.value.length > 0) {
      const fd = new FormData()
      // Append each file to the FormData object. Strapi handles this automatically.
      for (const file of selectedFiles.value) {
        fd.append('files', file)
      }

      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: fd,
      })

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json()
        // Map the results to get an array of image IDs
        const imageIds = uploadResult.map((image) => image.id)

        // Update product with the array of image IDs
        // Ensure your 'product_image' field in Strapi is configured to allow multiple media.
        await axios.put(`${STRAPI_URL}/api/products/${productRes.data.data?.documentId}`, {
          data: {
            product_image: imageIds,
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
    inboundId.value = inboundIdGenerate()
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
    const product = products.value.find(
      (prod) => prod.product_name === selectedProductOutbound.value.product_name,
    )

    const data = {
      product: product.documentId,
      qty: quantityOutbound.value,
      destination: destinationOutbound.value,
      notes: notesOutbound.value,
      out_id: outboundId.value,
    }

    if (!data.product || !data.qty || !data.destination) {
      notif.reject({
        type: 'warning',
        message: 'Please fill in all required fields',
        duration: 3000,
      })
      return
    }

    if (data.qty > product.product_qty) {
      notif.reject({
        type: 'warning',
        message: 'Quantity exceeds available stock',
        duration: 3000,
      })
      return
    }

    const productsRes = await axios.post(`${STRAPI_URL}/api/outbound-products`, {
      data,
    })

    const newOutboundId = productsRes.data.data.documentId

    const promises = []

    promises.push(
      axios.put(`${STRAPI_URL}/api/products/${product?.documentId}`, {
        data: {
          product_qty: product.product_qty - quantityOutbound.value,
        },
      }),
    )

    // upload images
    if (selectedFilesOutbound.value.length > 0) {
      promises.push(
        (async () => {
          const fd = new FormData()
          for (const file of selectedFilesOutbound.value) {
            fd.append('files', file)
          }
          const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
            method: 'POST',
            body: fd,
          })

          if (uploadRes.ok) {
            const uploadResult = await uploadRes.json()
            const imageIds = uploadResult.map((image) => image.id)

            // Link the uploaded images to the newly created outbound record
            return axios.put(`${STRAPI_URL}/api/outbound-products/${newOutboundId}`, {
              data: {
                invoice: imageIds, // Assuming the field name in Strapi is 'invoice'
              },
            })
          } else {
            // Throw an error to make Promise.all fail if upload fails
            throw new Error('Invoice image upload failed.')
          }
        })(),
      )
    }

    // Wait for all promises to complete
    await Promise.all(promises)

    // Reset form fields
    selectedProductOutbound.value = ''
    quantityOutbound.value = 1
    destinationOutbound.value = ''
    notesOutbound.value = ''
    outboundId.value = outboundIdGenerate()
    clearImageHandleOutbound() // Reset image uploader

    // Get outbounds
    getOutbounds()
    getProducts() // Refresh products list to get updated quantity

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

function inboundIdGenerate() {
  const date = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
  const year = now.getFullYear()
  const dateString = `${year}${month}${date}`
  const productsToday = products.value.filter((product) => {
    const productDate = new Date(product.createdAt)
    return (
      productDate.getDate() === now.getDate() &&
      productDate.getMonth() === now.getMonth() &&
      productDate.getFullYear() === now.getFullYear()
    )
  })
  const productCount = productsToday.length + 1
  return `INB-${dateString}-${productCount}`
}

function outboundIdGenerate() {
  const date = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
  const year = now.getFullYear()
  const dateString = `${year}${month}${date}`
  const outboundsToday = outboundsData.value.filter((outbound) => {
    const outboundDate = new Date(outbound.createdAt)
    return (
      outboundDate.getDate() === now.getDate() &&
      outboundDate.getMonth() === now.getMonth() &&
      outboundDate.getFullYear() === now.getFullYear()
    )
  })
  const outboundCount = outboundsToday.length + 1
  return `OUT-${dateString}-${outboundCount}`
}

// --- MODIFIED: Image Upload Functions for Multiple Images ---
function imageUploadHandleClick() {
  imageInput.value.click()
}

function imageUploadHandleClickOutbound() {
  imageInputOutbound.value.click()
}

function setActivePreview(index) {
  activePreviewIndex.value = index
}

function setActivePreviewOutbound(index) {
  activePreviewIndexOutbound.value = index
}

function handleImageUpload(event) {
  const files = event.target.files
  if (files) {
    for (const file of files) {
      selectedFiles.value.push(file)
      imageUrls.value.push(URL.createObjectURL(file))
    }
    // Set the last uploaded image as the active one
    activePreviewIndex.value = imageUrls.value.length - 1
  }
}

function handleImageUploadOutbound(event) {
  const files = event.target.files
  if (files) {
    for (const file of files) {
      selectedFilesOutbound.value.push(file)
      imageUrlsOutbound.value.push(URL.createObjectURL(file))
    }
    // Set the last uploaded image as the active one
    activePreviewIndexOutbound.value = imageUrlsOutbound.value.length - 1
  }
}

function removeImage(index) {
  // Revoke the object URL to prevent memory leaks
  URL.revokeObjectURL(imageUrls.value[index])

  // Remove the image URL and the file from their respective arrays
  imageUrls.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)

  // Adjust active index if it's now out of bounds
  if (activePreviewIndex.value >= imageUrls.value.length) {
    activePreviewIndex.value = imageUrls.value.length - 1
  }
  if (imageUrls.value.length === 0) {
    activePreviewIndex.value = 0
  }
}

function removeImageOutbound(index) {
  // Revoke the object URL to prevent memory leaks
  URL.revokeObjectURL(imageUrlsOutbound.value[index])

  // Remove the image URL and the file from their respective arrays
  imageUrlsOutbound.value.splice(index, 1)
  selectedFilesOutbound.value.splice(index, 1)

  // Adjust active index if it's now out of bounds
  if (activePreviewIndexOutbound.value >= imageUrlsOutbound.value.length) {
    activePreviewIndexOutbound.value = imageUrlsOutbound.value.length - 1
  }
}

function clearImageHandle() {
  // Revoke all object URLs before clearing the array
  imageUrls.value.forEach((url) => URL.revokeObjectURL(url))

  imageUrls.value = []
  selectedFiles.value = []
  if (imageInput.value) {
    imageInput.value.value = ''
  }
  activePreviewIndex.value = 0
}

function clearImageHandleOutbound() {
  // Revoke all object URLs before clearing the array
  imageUrlsOutbound.value.forEach((url) => URL.revokeObjectURL(url))

  imageUrlsOutbound.value = []
  selectedFilesOutbound.value = []
  if (imageInputOutbound.value) {
    imageInputOutbound.value.value = ''
  }
  activePreviewIndexOutbound.value = 0
}

function handleDelete() {
  if (tab.value == 'inbounds') {
    deleteProduct()
  } else {
    deleteOutbound()
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      getCategories(),
      getSuppliers(),
      getWarehouses(),
      getProducts(),
      getOutbounds(),
    ])

    inboundId.value = inboundIdGenerate()
    outboundId.value = outboundIdGenerate()

    watchEffect(() => {
      if (!selectedCategory.value) {
        codeProduct.value = ''
        return
      }
      codeProduct.value = getNextAvailableProductCode(selectedCategory.value)
    })
  } catch (error) {
    console.error('Error fetching initial data:', error)
  }
})
</script>

<template>
  <div class="px-4">
    <div class="mt-4">

      <!-- Form Section -->
      <div class="bg-white rounded-xl mb-4 shadow">
        <div
          class="bg-base text-secondary p-6 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
        >
          <div>
            <h1 class="text-2xl font-bold">
              {{ tab === 'inbounds' ? 'Inbound Products' : 'Outbound Products' }}
            </h1>
            <p class="text-[var(--color-secondary)] opacity-80 mt-1">
              {{ tab === 'inbounds' ? 'Manage your inbounds' : 'Manage your outbounds' }}
            </p>
          </div>
          <div>
            <button
              v-if="tab === 'inbounds'"
              @click="postProduct"
              type="button"
              class="bg-white/20 hover:bg-white/30 self-end-safe text-white px-4 py-2 min-w-[100px] h-[40px] rounded transition-colors cursor-pointer flex items-center gap-2"
            >
              <i class="fa-solid fa-plus"></i>
              Add Product
            </button>
            <button
              v-if="tab === 'outbounds'"
              type="button"
              @click="posOutbounds"
              class="bg-white/20 hover:bg-white/30 self-end-safe text-white px-4 py-2 min-w-[100px] h-[40px] rounded transition-colors cursor-pointer flex items-center gap-2"
            >
              <i class="fa-solid fa-plus"></i>
              Add Outbound
            </button>
          </div>
        </div>

        <div class="flex gap-2 flex-wrap p-4 border-b border-gray-200">
          <button
            @click="tab = 'inbounds'"
            :class="
              tab === 'inbounds'
                ? 'bg-[var(--color-sub)] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            class="px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Inbounds
          </button>
          <button
            @click="tab = 'outbounds'"
            :class="
              tab === 'outbounds'
                ? 'bg-[var(--color-sub)] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            class="px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Outbounds
          </button>
        </div>

        <div>
          <div v-if="tab === 'inbounds'" class="px-6 py-2">
            <form
              method="post"
              enctype="multipart/form-data"
              action=""
              id="add_product"
              class="flex flex-col gap-4 my-4"
              @submit.prevent
            >
              <div class="flex flex-col md:flex-row gap-4">
                <StandardFloatingInput
                  id="inbound_id"
                  type="text"
                  name="inbound_id"
                  placeholder="Inbound ID"
                  label="Inbound ID"
                  v-model="inboundId"
                  class="w-full"
                  :disabled="true"
                />
                <StandardFloatingInput
                  id="transaction_date"
                  type="text"
                  name="transaction_date"
                  placeholder="Transaction Date"
                  label="Transaction Date"
                  v-model="transactionDate"
                  class="w-full"
                  :disabled="true"
                />
              </div>
              <div class="flex flex-col md:flex-row gap-4 w-full">
                <!-- Image -->
                <div class="w-full md:w-80 flex-shrink-0">
                  <div
                    v-if="imageUrls.length === 0"
                    @click="imageUploadHandleClick"
                    class="flex justify-center items-center w-full h-full px-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-sub transition-colors duration-200"
                  >
                    <div class="space-y-1 text-center">
                      <i class="fa-regular fa-image text-gray-400 text-5xl"></i>
                      <p class="text-sm text-gray-600">Click to upload images</p>
                    </div>
                  </div>

                  <!-- Image Gallery Preview -->
                  <div v-else class="w-full">
                    <!-- Main Preview Image -->
                    <div class="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden mb-2">
                      <img
                        v-if="imageUrls.length > 0 && imageUrls[activePreviewIndex]"
                        :src="imageUrls[activePreviewIndex]"
                        alt="Active Preview"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <i class="fa-regular fa-image text-gray-400 text-5xl"></i>
                      </div>
                    </div>

                    <!-- Thumbnails -->
                    <div class="flex items-center gap-2">
                      <div class="flex-1 flex gap-2 overflow-x-auto pb-2">
                        <div
                          v-for="(url, index) in imageUrls"
                          :key="url"
                          class="relative w-16 h-16 flex-shrink-0 group"
                        >
                          <img
                            :src="url"
                            alt="Image Thumbnail"
                            @click="setActivePreview(index)"
                            class="w-full h-full object-cover rounded-md cursor-pointer border-2 transition-colors"
                            :class="
                              activePreviewIndex === index ? 'border-blue-500' : 'border-gray-300'
                            "
                          />
                          <button
                            @click="removeImage(index)"
                            type="button"
                            class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <i class="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      </div>
                      <button
                        @click="imageUploadHandleClick"
                        type="button"
                        class="flex-shrink-0 flex justify-center items-center w-12 h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-sub transition-colors"
                      >
                        <div class="text-center text-gray-500">
                          <i class="fa-solid fa-plus text-xl"></i>
                        </div>
                      </button>
                    </div>
                  </div>

                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleImageUpload($event)"
                    ref="imageInput"
                    multiple
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
                      class="w-full"
                    />
                    <StandardFloatingInput
                      id="product_code"
                      type="text"
                      name="product_code"
                      placeholder="Product Code"
                      label="Product Code"
                      v-model="codeProduct"
                      class="w-full"
                      :disabled="true"
                    />
                  </div>
                  <div class="flex flex-col md:flex-row gap-4">
                    <AutoCompleteInput
                      id="product_supplier"
                      label="Select Supplier"
                      placeholder="Type to search suppliers..."
                      v-model="selectedSupplier"
                      :options="suppliers"
                      option-label="supplier_name"
                      option-value="documentId"
                      :required="true"
                      class="w-full"
                    />
                    <AutoCompleteInput
                      id="product_warehouse"
                      label="Select Warehouse"
                      placeholder="Type to search warehouses..."
                      v-model="selectedWarehouse"
                      :options="warehouses"
                      option-label="warehouse_name"
                      option-value="documentId"
                      :required="true"
                      class="w-full"
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
                        class="w-full"
                      />
                      <StandardFloatingInput
                        id="product_description"
                        type="text"
                        name="product_description"
                        placeholder="Description"
                        label="Description"
                        v-model="descriptionProduct"
                        class="w-full"
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
                        class="w-full"
                        @input="handlePriceInput"
                      />
                      <StandardFloatingInput
                        id="product_qty"
                        type="number"
                        name="product_qty"
                        placeholder="Quantity"
                        label="Quantity"
                        v-model="quantityProduct"
                        class="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div v-else class="px-6 py-2">
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
                    <StandardFloatingInput
                      id="outbound_id"
                      label="Outbound ID"
                      name="outbound_id"
                      placeholder="Outbound ID"
                      v-model="outboundId"
                      :required="true"
                      class="w-full"
                      :disabled="true"
                    />
                    <StandardFloatingInput
                      id="transaction_outbound"
                      type="text"
                      name="transaction_outbound"
                      placeholder="Transaction Date"
                      label="Transaction Date"
                      v-model="transactionDate"
                      class="w-full text-gray-800"
                      :disabled="true"
                    />
                  </div>
                  <div class="flex flex-col md:flex-row gap-4 w-full items-center">
                    <div class="w-full md:w-80 flex-shrink-0">
                      <div
                        v-if="imageUrlsOutbound.length === 0"
                        @click="imageUploadHandleClickOutbound"
                        class="flex justify-center items-center w-full h-40 px-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-sub transition-colors duration-200"
                      >
                        <div class="space-y-1 text-center">
                          <i class="fa-regular fa-image text-gray-400 text-5xl"></i>
                          <p class="text-sm text-gray-600">Click to upload images</p>
                        </div>
                      </div>

                      <!-- Image Gallery Preview -->
                      <div v-else class="w-full">
                        <!-- Main Preview Image -->
                        <div
                          class="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden mb-2"
                        >
                          <img
                            v-if="
                              imageUrlsOutbound.length > 0 &&
                              imageUrlsOutbound[activePreviewIndexOutbound]
                            "
                            :src="imageUrlsOutbound[activePreviewIndexOutbound]"
                            alt="Active Preview"
                            class="w-full h-full object-cover"
                          />
                          <div v-else class="w-full h-full flex items-center justify-center">
                            <i class="fa-regular fa-image text-gray-400 text-5xl"></i>
                          </div>
                        </div>

                        <!-- Thumbnails -->
                        <div class="flex items-center gap-2">
                          <div class="flex-1 flex gap-2 overflow-x-auto pb-2">
                            <div
                              v-for="(url, index) in imageUrlsOutbound"
                              :key="url"
                              class="relative w-16 h-16 flex-shrink-0 group"
                            >
                              <img
                                :src="url"
                                alt="Image Thumbnail"
                                @click="setActivePreviewOutbound(index)"
                                class="w-full h-full object-cover rounded-md cursor-pointer border-2 transition-colors"
                                :class="
                                  activePreviewIndexOutbound === index
                                    ? 'border-blue-500'
                                    : 'border-gray-300'
                                "
                              />
                              <button
                                @click="removeImageOutbound(index)"
                                type="button"
                                class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                <i class="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          </div>
                          <!-- Add More Button -->
                          <button
                            @click="imageUploadHandleClickOutbound"
                            type="button"
                            class="flex-shrink-0 flex justify-center items-center w-16 h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-sub transition-colors"
                          >
                            <div class="text-center text-gray-500">
                              <i class="fa-solid fa-plus text-xl"></i>
                            </div>
                          </button>
                        </div>
                      </div>

                      <input
                        type="file"
                        class="hidden"
                        accept="image/*"
                        @change="handleImageUploadOutbound($event)"
                        ref="imageInputOutbound"
                        multiple
                      />
                    </div>
                    <div class="flex flex-col gap-4 w-full">
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
                      />
                      <div class="flex flex-col md:flex-row gap-4">
                        <StandardFloatingInput
                          id="outbound_destination"
                          type="text"
                          name="outbound_destination"
                          placeholder="Customer"
                          label="Customer"
                          v-model="destinationOutbound"
                          class="w-full"
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
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Inbounds Table -->
      <products_component
        v-if="tab === 'inbounds'"
        @deleteProduct="deleteProduct"
        @openDeleteModal="openDeleteModal"
        @closeDeleteModal="closeDeleteModal"
        :products="products"
        :totalDataOnMounted="totalDataOnMounted"
      />

      <!-- Outbounds Table -->
      <ProductOutboundComponent
        v-if="tab === 'outbounds'"
        @deleteProduct="deleteOutbound"
        @openDeleteModal="openDeleteModal"
        @closeDeleteModal="closeDeleteModal"
        :products="outboundsData"
        :totalDataOnMounted="totalDataOnMountedOutbound"
      />

      <!-- Pop up for delete product -->
      <alert-component
        :message="message"
        :show="show"
        @close="show = false"
        :type="modalType"
        @confirm="handleDelete"
      />

      <!-- Notification Component -->
      <Notivue v-slot="item">
        <Notification :item="item" :theme="pastelTheme">
          <NotificationProgress :item="item" />
        </Notification>
      </Notivue>

    </div>
  </div>
</template>
