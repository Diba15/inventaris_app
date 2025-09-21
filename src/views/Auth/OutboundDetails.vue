<script setup>
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

import { defineOptions, onBeforeUnmount } from 'vue'
defineOptions({
  name: 'outbound_details',
})

import { useRoute, useRouter } from 'vue-router'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const outbound = ref(null)
const originalQty = ref(0) // To store the initial quantity

// --- State for Multiple Image Handling ---
const imageInput = ref(null) // Ref for the file input element
const previewUrls = ref([]) // Array for new image preview URLs
const selectedFiles = ref([]) // Array for new selected file objects

// --- State for Gallery Popup ---
const isGalleryOpen = ref(false)
const activeImageIndex = ref(0)

// Computed property to combine existing and new images for the gallery
const galleryImages = computed(() => {
  const existingImages =
    outbound.value?.invoice?.map((img) => ({
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

const getOutboundDetails = async () => {
  const id = route.params.id
  try {
    const response = await axios.get(`${STRAPI_URL}/api/outbound-products/${id}?populate=*`)
    // Ensure invoice is always an array
    if (response.data.data.invoice && !Array.isArray(response.data.data.invoice)) {
      response.data.data.invoice = [response.data.data.invoice]
    } else if (!response.data.data.invoice) {
      response.data.data.invoice = []
    }
    outbound.value = response.data.data
    originalQty.value = outbound.value.qty // Store original quantity
  } catch (error) {
    console.error('Failed to fetch outbound details:', error)
    push.error('Failed to load outbound details.')
  }
}

onMounted(() => {
  getOutboundDetails()
  // Add keyboard event listener for gallery navigation
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Logic for updating outbound record with multiple images
const updateOutbound = async () => {
  const id = route.params.id

  const updatedData = {
    destination: outbound.value.destination,
    notes: outbound.value.notes,
    qty: Number(outbound.value.qty),
  }

  // --- Quantity validation ---
  const qtyDifference = updatedData.qty - originalQty.value
  const availableStock = outbound.value.product.product_qty

  if (qtyDifference > availableStock) {
    push.error({
      title: 'Stok Tidak Mencukupi',
      message: `Anda hanya bisa menambah ${availableStock} unit lagi.`,
    })
    return
  }
  // --- End of validation ---

  const notif = push.promise({
    message: 'Updating outbound record...',
    duration: 0,
  })

  try {
    const promises = []
    let newImageIds = []

    // 1. Handle image uploads first if there are new files
    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach((file) => formData.append('files', file))
      const imageResponse = await axios.post(`${STRAPI_URL}/api/upload`, formData)
      newImageIds = imageResponse.data.map((img) => img.id)
    }

    // 2. Combine existing image IDs with new ones
    const existingImageIds = outbound.value.invoice.map((img) => img.id)
    const allImageIds = [...existingImageIds, ...newImageIds]

    // 3. Add promise to update outbound record with text fields and new image relations
    promises.push(
      axios.put(`${STRAPI_URL}/api/outbound-products/${id}`, {
        data: {
          ...updatedData,
          invoice: allImageIds, // Send the combined array of IDs
        },
      }),
    )

    // 4. If quantity changed, add promise to update product stock
    if (qtyDifference !== 0) {
      promises.push(
        axios.put(`${STRAPI_URL}/api/products/${outbound.value.product.documentId}`, {
          data: {
            product_qty: availableStock - qtyDifference,
          },
        }),
      )
    }

    // 5. Execute all updates
    await Promise.all(promises)

    clearImageChange() // Clear the preview
    await getOutboundDetails() // Refresh the details after update

    notif.resolve({
      type: 'success',
      message: 'Outbound record updated successfully!',
    })

    // Navigate back after a short delay
    setTimeout(() => {
      router.push({ name: 'Products' })
    }, 1500)
  } catch (error) {
    console.error('Error updating outbound:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to update outbound record.',
    })
  }
}

// Function to delete an existing image
async function deleteImage(imageIdToDelete, indexInInvoiceArray) {
  if (!confirm('Are you sure you want to delete this invoice image?')) return

  const outboundId = route.params.id
  try {
    // 1. Unlink from outbound record
    const remainingImageIds = outbound.value.invoice
      .filter((img) => img.id !== imageIdToDelete)
      .map((img) => img.id)

    await axios.put(`${STRAPI_URL}/api/outbound-products/${outboundId}`, {
      data: { invoice: remainingImageIds },
    })

    // 2. Delete the file from Strapi's media library
    await axios.delete(`${STRAPI_URL}/api/upload/files/${imageIdToDelete}`)

    // 3. Update local state for immediate UI feedback
    outbound.value.invoice.splice(indexInInvoiceArray, 1)

    push.success('Invoice image deleted successfully!')
  } catch (error) {
    console.error('Failed to delete image:', error)
    push.error('Failed to delete image.')
  }
}

// --- Image Handling Functions ---
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

function removePreview(indexToRemove) {
  const urlToRemove = previewUrls.value[indexToRemove]
  URL.revokeObjectURL(urlToRemove)

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

// --- Gallery Functions ---
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
    <div v-if="outbound" class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <form @submit.prevent="updateOutbound">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div
            class="p-6 bg-base text-white flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div>
              <h1 class="text-2xl font-bold">Edit Outbound Details</h1>
              <p class="text-white/80 mt-1">
                Update transaction for {{ outbound.product?.product_name || '...' }}
              </p>
            </div>
            <button
              type="submit"
              class="bg-white/20 hover:bg-white/30 transition-colors self-end md:self-center text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2"
            >
              <i class="fa-solid fa-save"></i>
              <span>Save Changes</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
            <!-- Left Column: Image Gallery -->
            <div class="md:col-span-1 flex flex-col gap-4">
              <div
                class="w-full aspect-square rounded-xl shadow-md flex items-center justify-center bg-gray-100 overflow-hidden relative group"
              >
                <img
                  v-if="galleryImages.length > 0"
                  :src="galleryImages[0].url"
                  alt="Invoice Image"
                  class="w-full h-full object-cover"
                />
                <div
                  v-if="galleryImages.length > 0"
                  @click="openGallery(0)"
                  class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <i class="fa-solid fa-magnifying-glass-plus text-white text-4xl"></i>
                </div>
                <i v-else class="fa-solid fa-receipt text-6xl text-gray-300"></i>
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
                        : removePreview(index - outbound.invoice.length)
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
                <span>Add Invoice</span>
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
                    :modelValue="outbound.product?.product_name || 'N/A'"
                    :disabled="true"
                  />
                  <StandardFloatingInput
                    id="product_code"
                    type="text"
                    name="product_code"
                    placeholder="Product Code"
                    label="Product Code"
                    :modelValue="outbound.product?.product_code || 'N/A'"
                    :disabled="true"
                  />
                </div>
              </div>

              <!-- Transaction Details Section -->
              <div class="p-5 border rounded-xl">
                <h3 class="font-bold text-lg text-gray-800 mb-4">Transaction Details</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <StandardFloatingInput
                    id="outbound_destination"
                    type="text"
                    name="outbound_destination"
                    placeholder="Customer"
                    label="Customer / Destination"
                    v-model="outbound.destination"
                  />
                  <StandardFloatingInput
                    id="outbound_qty"
                    type="number"
                    name="outbound_qty"
                    placeholder="Quantity"
                    label="Quantity"
                    v-model="outbound.qty"
                  />
                  <div class="sm:col-span-2">
                    <label for="outbound_notes" class="block text-sm font-medium text-gray-500 mb-1"
                      >Notes</label
                    >
                    <textarea
                      id="outbound_notes"
                      name="outbound_notes"
                      rows="4"
                      placeholder="Enter transaction notes (optional)"
                      v-model="outbound.notes"
                      class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sub focus:border-sub text-base sm:text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div v-else class="text-center py-20">
      <p class="text-gray-500">Loading outbound details...</p>
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
