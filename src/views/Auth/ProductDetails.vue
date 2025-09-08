<script setup>
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

import { defineOptions } from 'vue'
defineOptions({
  name: 'product_details',
})

// Mengambil id dari route params
import { useRoute } from 'vue-router'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'

const route = useRoute()

import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const product = ref(null)
const imageInput = ref(null) // Ref for the file input element
const previewUrl = ref(null) // Ref for the new image preview URL
const selectedFile = ref(null) // Ref to store the new selected file object

// Computed property to get the current image URL (either original or preview)
const currentImageUrl = computed(() => {
  if (previewUrl.value) {
    return previewUrl.value
  }
  if (product.value?.product_image?.url) {
    return product.value.product_image.url
  }
  return null
})

const getProductDetails = async () => {
  const id = route.params.id
  try {
    const response = await axios.get(`${STRAPI_URL}/api/products/${id}?populate=*`)
    product.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch product details:', error)
    push.error('Failed to load product details.')
  }
}

onMounted(() => {
  getProductDetails()
})

async function handleDeleteImage(id) {
  try {
    await axios.delete(`${STRAPI_URL}/api/upload/files/${id}`)
  } catch (error) {
    console.error('Failed to delete old image:', error)
  }
}

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
    type: 'info',
    message: 'Updating product...',
    duration: 0,
  })

  if (
    !updatedData.product_name ||
    !updatedData.product_description ||
    !updatedData.product_price ||
    !updatedData.product_qty
  ) {
    notif.reject({
      type: 'error',
      message: 'Please fill in all required fields.',
      duration: 3000,
    })
    return
  }

  try {
    // 1. Update text fields first
    await axios.put(`${STRAPI_URL}/api/products/${id}`, {
      data: {
        ...updatedData,
      },
    })

    // 2. Handle image update if a new file is selected
    if (selectedFile.value) {
      const oldImageId = product.value.product_image?.id
      const formData = new FormData()
      formData.append('files', selectedFile.value)

      // Upload the new image
      const imageResponse = await axios.post(`${STRAPI_URL}/api/upload`, formData)
      const newImageId = imageResponse.data[0]?.id

      if (newImageId) {
        // Link the new image to the product
        await axios.put(`${STRAPI_URL}/api/products/${id}`, {
          data: { product_image: newImageId },
        })

        // Delete the old image after the new one is successfully linked
        if (oldImageId) {
          await handleDeleteImage(oldImageId)
        }
      }
    }

    await getProductDetails() // Refresh the product details after update
    clearImageChange() // Clear the preview

    notif.resolve({
      type: 'success',
      message: 'Product updated successfully!',
      duration: 3000,
    })
  } catch (error) {
    console.error('Error updating product:', error)
    notif.reject({
      type: 'error',
      message: 'Failed to update product. Please try again.',
      duration: 3000,
    })
  }
}

// --- Image Upload Functions ---
function handleChangeImageClick() {
  imageInput.value.click()
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

// Clears the newly selected image preview, reverting to the original image
function clearImageChange() {
  previewUrl.value = null
  selectedFile.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

function handlePriceInput(event) {
  const input = event.target.value
  const numericValue = input.replace(/[^0-9]/g, '')
  // Format with dot as thousand separator
  product.value.product_price = numericValue
    ? numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : ''
}
</script>

<template>
  <main class="text-base px-4">
    <div v-if="product" class="mt-4">
      <form action="" @submit.prevent="updateProduct">
        <div class="flex flex-col gap-4 bg-white rounded-xl shadow-lg">
          <div
            class="p-4 bg-base text-white rounded-t-xl flex flex-col md:flex-row justify-between items-center"
          >
            <h1 class="text-xl font-bold self-start md:self-center">Product Details</h1>
            <button
              type="submit"
              class="self-end-safe bg-sub hover:bg-yellow-600 text-white py-2 px-4 rounded w-[100px] h-[40px] cursor-pointer"
            >
              Save
            </button>
          </div>
          <div class="flex flex-col md:flex-row p-4 gap-8">
            <!-- Image Uploader Section (Updated) -->
            <div class="flex flex-col items-center gap-4 flex-shrink-0">
              <div class="w-60 h-40">
                <!-- Image Display Area -->
                <div
                  v-if="currentImageUrl"
                  class="relative w-full h-full"
                  @click="handleChangeImageClick"
                >
                  <img
                    :src="currentImageUrl"
                    alt="Product Image"
                    class="w-full h-full object-cover rounded-lg shadow-md cursor-pointer"
                  />
                  <button
                    v-if="previewUrl"
                    @click.stop="clearImageChange"
                    type="button"
                    class="absolute top-2 right-2 bg-white bg-opacity-75 rounded-full py-1 px-1.5 text-gray-700 hover:bg-opacity-100 hover:text-red-600 focus:outline-none transition-colors"
                    title="Cancel image change"
                  >
                    <i class="fa-solid fa-xmark w-5 h-5"></i>
                  </button>
                </div>

                <!-- Placeholder when no image exists -->
                <div
                  v-else
                  @click="handleChangeImageClick"
                  class="w-full h-full object-cover rounded-lg shadow-md flex items-center justify-center bg-gray-200 cursor-pointer hover:bg-gray-300"
                >
                  <i class="fa-solid fa-image text-4xl text-gray-500"></i>
                </div>
              </div>

              <!-- Input File (Hidden) -->
              <input
                type="file"
                @change="handleFileChange"
                class="hidden"
                accept="image/*"
                ref="imageInput"
              />

              <!-- Tombol Ganti Gambar -->
              <button
                @click="handleChangeImageClick"
                type="button"
                class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold py-2 px-5 rounded-lg shadow-sm transition duration-200"
              >
                Ganti Gambar
              </button>
            </div>
            <!-- Form -->
            <div class="flex flex-col w-full">
              <div class="flex flex-col gap-4">
                <!-- Product -->
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
                <!-- Price -->
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
  <Notivue v-slot="item">
    <Notification :item="item" :theme="pastelTheme">
      <NotificationProgress :item="item" />
    </Notification>
  </Notivue>
</template>
