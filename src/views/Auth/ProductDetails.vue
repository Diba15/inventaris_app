<script setup>
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

import { defineOptions } from 'vue'
defineOptions({
  name: 'product_details',
})

import { useRoute } from 'vue-router'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const route = useRoute()
const product = ref(null)

// --- MODIFIED: State for Multiple Image Handling ---
const imageInput = ref(null) // Ref for the file input element
const previewUrls = ref([]) // Array for new image preview URLs
const selectedFiles = ref([]) // Array for new selected file objects

// --- NEW: State for Gallery Popup ---
const isGalleryOpen = ref(false)
const activeImageIndex = ref(0)

// --- MODIFIED: Computed property to combine existing and new images for the gallery ---
const galleryImages = computed(() => {
  const existingImages = product.value?.product_image?.map((img) => ({
    ...img,
    type: 'existing', // Mark as an existing image
    url: img.url,
  })) || []

  const newImages = previewUrls.value.map((url, index) => ({
    url,
    type: 'new', // Mark as a new preview image
    file: selectedFiles.value[index], // Keep reference to the file
  }))

  return [...existingImages, ...newImages]
})

const getProductDetails = async () => {
  const id = route.params.id
  try {
    const response = await axios.get(`${STRAPI_URL}/api/products/${id}?populate=*`)
    // Ensure product_image is always an array
    if (response.data.data.product_image && !Array.isArray(response.data.data.product_image)) {
      response.data.data.product_image = [response.data.data.product_image]
    } else if (!response.data.data.product_image) {
      response.data.data.product_image = []
    }
    product.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch product details:', error)
    push.error('Failed to load product details.')
  }
}

onMounted(() => {
  getProductDetails()
  // Add keyboard event listener for gallery navigation
  window.addEventListener('keydown', handleKeydown)
})

// --- MODIFIED: Logic for updating product with multiple images ---
const updateProduct = async () => {
  const id = route.params.id
  const price = product.value.product_price.toString()

  const updatedData = {
    product_name: product.value.product_name,
    product_description: product.value.product_description,
    product_price: Number(price.replace(/[^0-9]/g, '')),
    product_qty: product.value.product_qty,
  }

  const notif = push.promise({
    message: 'Updating product...',
    duration: 0,
  })

  try {
    // 1. Handle image uploads first if there are new files
    let newImageIds = []
    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach((file) => formData.append('files', file))

      const imageResponse = await axios.post(`${STRAPI_URL}/api/upload`, formData)
      newImageIds = imageResponse.data.map((img) => img.id)
    }

    // 2. Combine existing image IDs with new ones
    const existingImageIds = product.value.product_image.map(img => img.id)
    const allImageIds = [...existingImageIds, ...newImageIds]

    // 3. Update product with text fields and new image relations
    await axios.put(`${STRAPI_URL}/api/products/${id}`, {
      data: {
        ...updatedData,
        product_image: allImageIds, // Send the combined array of IDs
      },
    })

    clearImageChange() // Clear the preview
    await getProductDetails() // Refresh the product details after update

    notif.resolve({
      type: 'success',
      message: 'Product updated successfully!',
    })
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
            .filter(img => img.id !== imageIdToDelete)
            .map(img => img.id)

        await axios.put(`${STRAPI_URL}/api/products/${productId}`, {
            data: { product_image: remainingImageIds }
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
  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
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
  activeImageIndex.value = (activeImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

function handleKeydown(e) {
  if (!isGalleryOpen.value) return
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'Escape') closeGallery()
}

</script>

<template>
  <main class="text-base px-4">
    <div v-if="product" class="mt-4">
      <form action="" @submit.prevent="updateProduct">
        <div class="flex flex-col gap-4 bg-white rounded-xl shadow-lg">
          <div class="p-4 bg-base text-white rounded-t-xl flex flex-col md:flex-row justify-between items-center">
            <h1 class="text-xl font-bold self-start md:self-center">Product Details</h1>
            <button
              type="submit"
              class="bg-white/20 hover:bg-white/30 transition-colors self-end-safe text-white py-2 px-4 rounded w-[100px] h-[40px] cursor-pointer"
            >
              Save
            </button>
          </div>
          <div class="flex flex-col md:flex-row p-4 gap-8">
            <div class="flex flex-col items-center gap-4 flex-shrink-0 w-full md:w-80">
                <div class="w-full h-52 rounded-lg shadow-md flex items-center justify-center bg-gray-100 overflow-hidden">
                    <img
                        v-if="galleryImages.length > 0"
                        :src="galleryImages[0].url"
                        alt="Product Image"
                        class="w-full h-full object-cover cursor-pointer"
                        @click="openGallery(0)"
                    />
                    <i v-else class="fa-solid fa-image text-5xl text-gray-400"></i>
                </div>

                <div class="w-full grid grid-cols-4 gap-2">
                    <div v-for="(image, index) in galleryImages" :key="image.url" class="relative group">
                        <img
                            :src="image.url"
                            class="w-full h-16 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-blue-500"
                            @click="openGallery(index)"
                        />
                        <button
                            type="button"
                            @click="image.type === 'existing' ? deleteImage(image.id, index) : removePreview(index - product.product_image.length)"
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            :title="image.type === 'existing' ? 'Delete permanently' : 'Remove preview'"
                        >
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>
                </div>

              <button
                @click="handleChangeImageClick"
                type="button"
                class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold py-2 px-5 rounded-lg shadow-sm transition duration-200 w-full"
              >
                Tambah Gambar
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

            <div class="flex flex-col w-full">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col md:flex-row gap-4">
                    <StandardFloatingInput
                      id="product_name"
                      type="text"
                      name="product_name"
                      placeholder="Product Name"
                      label="Product Name"
                      v-model="product.product_name"
                      class="max-w-md w-full"
                    />
                    <StandardFloatingInput
                      id="product_description"
                      type="text"
                      name="product_description"
                      placeholder="Description"
                      label="Description"
                      v-model="product.product_description"
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
                      v-model="product.product_price"
                      class="max-w-md w-full"
                      @input="handlePriceInput"
                    />
                    <StandardFloatingInput
                      id="product_qty"
                      type="number"
                      name="product_qty"
                      placeholder="Quantity"
                      label="Quantity"
                      v-model="product.product_qty"
                      class="max-w-md w-full"
                    />
                  </div>
                </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  </main>

  <div v-if="isGalleryOpen" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" @click.self="closeGallery">
    <button @click="closeGallery" class="absolute top-4 right-4 text-white text-3xl">&times;</button>
    <button @click="prevImage" class="absolute left-4 text-white text-4xl p-2 bg-black/30 rounded-full">&lsaquo;</button>
    <button @click="nextImage" class="absolute right-4 text-white text-4xl p-2 bg-black/30 rounded-full">&rsaquo;</button>
    <div class="max-w-4xl max-h-[80vh]">
        <img :src="galleryImages[activeImageIndex]?.url" class="max-w-full max-h-full object-contain" alt="Gallery view"/>
    </div>
  </div>

  <Notivue v-slot="item">
    <Notification :item="item" :theme="pastelTheme">
      <NotificationProgress :item="item" />
    </Notification>
  </Notivue>
</template>
