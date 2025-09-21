<script setup>
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

import { defineOptions } from 'vue'
defineOptions({
  name: 'product_details',
})

import { useRoute, useRouter } from 'vue-router'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import AutoCompleteInput from '@/components/AutoCompleteInput.vue'
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const product = ref(null)
const suppliers = ref([])
const allWarehouses = ref([]) // Renamed to avoid confusion
const categories = ref([])

// --- REVISED: State management for relations ---
const selectedCategory = ref(null)
const selectedSupplier = ref(null)
// This will now hold the array of warehouse objects for the current product
const productWarehouses = ref([])
// This is for the AutoComplete input to add a new warehouse
const warehouseToAdd = ref(null)

const id = route.params.id

const imageInput = ref(null)
const previewUrls = ref([])
const selectedFiles = ref([])

const isGalleryOpen = ref(false)
const activeImageIndex = ref(0)

const galleryImages = computed(() => {
  const existingImages =
    product.value?.product_image?.map((img) => ({
      ...img,
      type: 'existing',
      url: img.url,
    })) || []

  const newImages = previewUrls.value.map((url, index) => ({
    url,
    type: 'new',
    file: selectedFiles.value[index],
  }))

  return [...existingImages, ...newImages]
})

// Computed property to filter out already added warehouses from the dropdown
const availableWarehouses = computed(() => {
  const selectedIds = new Set(productWarehouses.value.map((w) => w.documentId))
  return allWarehouses.value.filter((w) => !selectedIds.has(w.documentId))
})

const getProductDetails = async () => {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/products/${id}?populate=*`)
    // Ensure product_image is always an array
    if (response.data.data.product_image && !Array.isArray(response.data.data.product_image)) {
      response.data.data.product_image = [response.data.data.product_image]
    } else if (!response.data.data.product_image) {
      response.data.data.product_image = []
    }
    product.value = response.data.data

    selectedCategory.value = product.value.product_category.category
    selectedSupplier.value = product.value.supplier_id?.documentId || null

    productWarehouses.value = response.data.data.warehouse
  } catch (error) {
    console.error('Failed to fetch product details:', error)
    push.error('Failed to load product details.')
  }
}

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
  allWarehouses.value = response.data.data
}

onMounted(async () => {
  const promises = [getProductDetails(), getCategories(), getSuppliers(), getWarehouses()]

  await Promise.all(promises)

  // Add keyboard event listener for gallery navigation
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(warehouseToAdd, (newWarehouseId) => {
  if (newWarehouseId) {
    const warehouseObject = allWarehouses.value.find((w) => w.documentId === newWarehouseId)
    if (warehouseObject && !productWarehouses.value.some((w) => w.documentId === newWarehouseId)) {
      productWarehouses.value.push(warehouseObject)
    }
    // Reset the input after adding
    warehouseToAdd.value = null
  }
})

function removeWarehouse(warehouseId) {
  const index = productWarehouses.value.findIndex((w) => w.documentId === warehouseId)
  if (index > -1) {
    productWarehouses.value.splice(index, 1)
  }
}

const updateProduct = async () => {
  const price = product.value.product_price ? product.value.product_price.toString() : '0'
  const categoryObject = categories.value.find((c) => c.category === selectedCategory.value)

  const updatedData = {
    product_name: product.value.product_name,
    product_description: product.value.product_description,
    product_price: Number(price.replace(/[^0-9]/g, '')),
    product_qty: product.value.product_qty,
    product_category: categoryObject ? categoryObject.documentId : null,
    supplier_id: selectedSupplier.value,
    warehouse: productWarehouses.value.map((w) => w.documentId), // Send an array of IDs
  }

  const notif = push.promise({
    message: 'Updating product...',
    duration: 0,
  })

  try {
    let newImageIds = []
    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach((file) => formData.append('files', file))
      const imageResponse = await axios.post(`${STRAPI_URL}/api/upload`, formData)
      newImageIds = imageResponse.data.map((img) => img.id)
    }

    const existingImageIds = product.value.product_image.map((img) => img.id)
    const allImageIds = [...existingImageIds, ...newImageIds]

    await axios.put(`${STRAPI_URL}/api/products/${id}`, {
      data: {
        ...updatedData,
        product_image: allImageIds,
      },
    })

    clearImageChange()
    await getProductDetails()

    notif.resolve({
      type: 'success',
      message: 'Product updated successfully!',
    })
    setTimeout(() => {
      router.push({ name: 'Products' })
    }, 1500)
  } catch (error) {
    console.error('Error updating product:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to update product.',
    })
  }
}

// --- NEW: Function to delete an existing image ---
async function deleteImage(imageIdToDelete, indexInProductArray) {
  if (!confirm('Are you sure you want to delete this image?')) return

  const productId = route.params.id
  try {
    // 1. Unlink from product and link the rest
    const remainingImageIds = product.value.product_image
      .filter((img) => img.id !== imageIdToDelete)
      .map((img) => img.id)

    await axios.put(`${STRAPI_URL}/api/products/${productId}`, {
      data: { product_image: remainingImageIds },
    })

    // 2. Delete the file from Strapi's media library
    await axios.delete(`${STRAPI_URL}/api/upload/files/${imageIdToDelete}`)

    // 3. Update local state for immediate UI feedback
    product.value.product_image.splice(indexInProductArray, 1)

    push.success('Image deleted successfully!')
  } catch (error) {
    console.error('Failed to delete image:', error)
    push.error('Failed to delete image.')
  }
}

// --- Image Handling Functions (Modified for multiple files) ---
function handleChangeImageClick() {
  imageInput.value.click()
}

function handleFileChange(event) {
  const files = event.target.files
  if (files) {
    for (const file of files) {
      selectedFiles.value.push(file)
      previewUrls.value.push(URL.createObjectURL(file))
    }
  }
}

// NEW: Remove a newly added preview image before uploading
function removePreview(indexToRemove) {
  const urlToRemove = previewUrls.value[indexToRemove]
  URL.revokeObjectURL(urlToRemove) // Clean up memory

  previewUrls.value.splice(indexToRemove, 1)
  selectedFiles.value.splice(indexToRemove, 1)
}

function clearImageChange() {
  previewUrls.value.forEach((url) => URL.revokeObjectURL(url))
  previewUrls.value = []
  selectedFiles.value = []
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

function handlePriceInput(event) {
  const input = event.target.value
  const numericValue = input.replace(/[^0-9]/g, '')
  product.value.product_price = numericValue
    ? numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : ''
}

// --- NEW: Gallery Functions ---
function openGallery(index) {
  activeImageIndex.value = index
  isGalleryOpen.value = true
}

function closeGallery() {
  isGalleryOpen.value = false
}

function nextImage() {
  activeImageIndex.value = (activeImageIndex.value + 1) % galleryImages.value.length
}

function prevImage() {
  activeImageIndex.value =
    (activeImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

function handleKeydown(e) {
  if (!isGalleryOpen.value) return
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'Escape') closeGallery()
}
</script>

<template>
  <main>
    <div v-if="product" class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <form @submit.prevent="updateProduct">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div
            class="p-6 bg-base text-white flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div>
              <h1 class="text-2xl font-bold">Edit Product Details</h1>
              <p class="text-white/80 mt-1">Update information for {{ product.product_name }}</p>
            </div>
            <button
              type="submit"
              class="bg-white/20 hover:bg-white/30 transition-colors self-end md:self-center text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2"
            >
              <i class="fa-solid fa-save"></i>
              <span>Save Changes</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 items-center">
            <!-- Left Column: Image Gallery -->
            <div class="md:col-span-1 flex flex-col gap-4">
              <div
                class="w-full aspect-square rounded-xl shadow-md flex items-center justify-center bg-gray-100 overflow-hidden relative group"
              >
                <img
                  v-if="galleryImages.length > 0"
                  :src="galleryImages[0].url"
                  alt="Product Image"
                  class="w-full h-full object-cover"
                />
                <div
                  v-if="galleryImages.length > 0"
                  @click="openGallery(0)"
                  class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <i class="fa-solid fa-magnifying-glass-plus text-white text-4xl"></i>
                </div>
                <i v-else class="fa-solid fa-image text-6xl text-gray-300"></i>
              </div>

              <div class="grid grid-cols-4 gap-3">
                <div
                  v-for="(image, index) in galleryImages"
                  :key="image.url"
                  class="relative group"
                >
                  <img
                    :src="image.url"
                    class="w-full aspect-square object-cover rounded-lg cursor-pointer border-2 border-gray-200 hover:border-blue-500 transition-all"
                    @click="openGallery(index)"
                  />
                  <button
                    type="button"
                    @click="
                      image.type === 'existing'
                        ? deleteImage(image.id, index)
                        : removePreview(index - product.product_image.length)
                    "
                    class="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                    :title="image.type === 'existing' ? 'Delete permanently' : 'Remove preview'"
                  >
                    <i class="fa-solid fa-xmark text-xs"></i>
                  </button>
                </div>
              </div>

              <button
                @click="handleChangeImageClick"
                type="button"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-3 px-5 rounded-lg shadow-sm transition duration-200 w-full flex items-center justify-center gap-2"
              >
                <i class="fa-solid fa-plus"></i>
                <span>Add Image</span>
              </button>

              <input
                type="file"
                @change="handleFileChange"
                class="hidden"
                accept="image/*"
                ref="imageInput"
                multiple
              />
            </div>

            <!-- Right Column: Product Info & Form -->
            <div class="md:col-span-2 flex flex-col gap-6">
              <!-- Product Information Section -->
              <div class="p-5 border rounded-xl">
                <h3 class="font-bold text-lg text-gray-800 mb-4">Product Information</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <StandardFloatingInput
                    id="product_name"
                    type="text"
                    name="product_name"
                    placeholder="Product Name"
                    label="Product Name"
                    v-model="product.product_name"
                  />
                  <StandardFloatingInput
                    id="product_code"
                    type="text"
                    name="product_code"
                    placeholder="Product Code"
                    label="Product Code"
                    :modelValue="product.product_code"
                    :disabled="true"
                  />
                  <div class="sm:col-span-2">
                    <label
                      for="product_description"
                      class="block text-sm font-medium text-gray-500 mb-1"
                      >Description</label
                    >
                    <textarea
                      id="product_description"
                      name="product_description"
                      rows="4"
                      placeholder="Enter product description"
                      v-model="product.product_description"
                      class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sub focus:border-sub text-base sm:text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Classification & Sourcing -->
              <div class="p-5 border rounded-xl">
                <h3 class="font-bold text-lg text-gray-800 mb-4">Classification & Sourcing</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AutoCompleteInput
                    id="product_category"
                    label="Product Category"
                    placeholder="Search categories..."
                    v-model="selectedCategory"
                    :options="categories"
                    option-label="category"
                    option-value="category"
                  />
                  <AutoCompleteInput
                    id="product_supplier"
                    label="Supplier"
                    placeholder="Search suppliers..."
                    v-model="selectedSupplier"
                    :options="suppliers"
                    option-label="supplier_name"
                    option-value="documentId"
                  />
                  <div class="sm:col-span-2">
                    <AutoCompleteInput
                      id="product_warehouse"
                      label="Add Warehouse"
                      placeholder="Search and add warehouses..."
                      v-model="warehouseToAdd"
                      :options="availableWarehouses"
                      option-label="warehouse_name"
                      option-value="documentId"
                    />
                    <!-- Warehouse Pills -->
                    <div v-if="productWarehouses.length > 0" class="flex flex-wrap gap-2 mt-3">
                      <div
                        v-for="warehouse in productWarehouses"
                        :key="warehouse.documentId"
                        class="flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-full"
                      >
                        <span>{{ warehouse.warehouse_name }}</span>
                        <button
                          @click.prevent="removeWarehouse(warehouse.documentId)"
                          type="button"
                          class="text-amber-600 hover:text-amber-800"
                        >
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Inventory & Price Section -->
              <div class="p-5 border rounded-xl">
                <h3 class="font-bold text-lg text-gray-800 mb-4">Inventory & Price</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <StandardFloatingInput
                    id="product_price"
                    type="text"
                    name="product_price"
                    placeholder="Price"
                    label="Price (Rp)"
                    v-model="product.product_price"
                    @input="handlePriceInput"
                  />
                  <StandardFloatingInput
                    id="product_qty"
                    type="number"
                    name="product_qty"
                    placeholder="Quantity"
                    label="Stock Quantity"
                    v-model="product.product_qty"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div v-else class="text-center py-20">
      <p class="text-gray-500">Loading product details...</p>
    </div>
  </main>

  <!-- Fullscreen Gallery Modal -->
  <div
    v-if="isGalleryOpen"
    class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
    @click.self="closeGallery"
  >
    <button
      @click="closeGallery"
      class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-4xl"
    >
      &times;
    </button>
    <button
      @click="prevImage"
      class="absolute left-4 md:left-8 text-white/70 hover:text-white transition-transform transform hover:scale-110 text-5xl p-2 rounded-full"
    >
      &lsaquo;
    </button>
    <button
      @click="nextImage"
      class="absolute right-4 md:right-8 text-white/70 hover:text-white transition-transform transform hover:scale-110 text-5xl p-2 rounded-full"
    >
      &rsaquo;
    </button>
    <div class="max-w-5xl max-h-[85vh] flex items-center justify-center">
      <img
        :src="galleryImages[activeImageIndex]?.url"
        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        alt="Gallery view"
      />
    </div>
  </div>

  <Notivue v-slot="item">
    <Notification :item="item" :theme="pastelTheme">
      <NotificationProgress :item="item" />
    </Notification>
  </Notivue>
</template>
