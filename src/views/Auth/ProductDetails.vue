<script setup>
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

import { defineOptions } from 'vue'
defineOptions({
  name: 'product_details',
})

// ingin mengambil id dari route params
import { useRoute } from 'vue-router'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'

const route = useRoute()

import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const product = ref(null)
const isEditing = ref(false)
const imgUrl = ref('')
const imgPreview = ref(false)
const imgInput = ref(null)
// const isLoading = ref(false)

const getProductDetails = async () => {
  const id = route.params.id
  const response = await axios.get(`${STRAPI_URL}/api/products/${id}?populate=*`)
  product.value = response.data.data
  imgUrl.value = response.data.data.product_image.url
}

onMounted(() => {
  getProductDetails()
  watch(isEditing, (val) => {
    const inputs = document.querySelectorAll('input')
    const textarea = document.querySelector('textarea')
    if (val) {
      inputs.forEach((input) => {
        input.removeAttribute('readonly')
        input.classList.remove('bg-gray-100')
        input.classList.add('bg-white')
      })
      if (inputs.length > 0) {
        inputs[0].focus()
        inputs[0].select()
      }
      textarea.removeAttribute('readonly')
      textarea.classList.remove('bg-gray-100')
      textarea.classList.add('bg-white')
    } else {
      inputs.forEach((input) => {
        input.setAttribute('readonly', 'readonly')
        input.classList.remove('bg-white')
        input.classList.add('bg-gray-100')
      })
      textarea.setAttribute('readonly', 'readonly')
      textarea.classList.remove('bg-white')
      textarea.classList.add('bg-gray-100')
    }
  })

  if (imgUrl.value) {
    imgPreview.value = true
  } else {
    imgPreview.value = false
  }
})

async function handleDeleteImage(id) {
  await axios.delete(`${STRAPI_URL}/api/upload/files/${id}`)
}

const updateProduct = async () => {
  const id = route.params.id
  const updatedData = {
    product_name: product.value.product_name,
    product_description: product.value.product_description,
    product_price: product.value.product_price,
    product_qty: product.value.product_qty,
  }

  console.log(updatedData)

  const notif = push.promise({
    type: 'info',
    message: 'Updating product...',
    duration: 0,
  })

  try {
    await axios.put(`${STRAPI_URL}/api/products/${id}`, {
      data: {
        ...updatedData,
      },
    })

    const deleteId = product.value.product_image?.id

    const imgFile = imgInput.value ? imgInput.value.files[0] : null

    console.log(imgFile)

    if (imgFile) {
      const formData = new FormData()
      formData.append('files', imgFile)

      const imageResponse = await axios.post(`${STRAPI_URL}/api/upload`, formData)
      const uploadedFile = imageResponse.data[0]

      // Coba berbagai cara mengambil ID
      const imageId = uploadedFile.id || uploadedFile.documentId || uploadedFile.attributes?.id

      if (uploadedFile) {
        // 2. Update product dengan image ID
        const updateResponse = await axios.put(`${STRAPI_URL}/api/products/${id}`, {
          data: {
            product_image: imageId,
          },
        })

        console.log('Product updated with new image:', updateResponse.data)
      }

      if (deleteId) {
        handleDeleteImage(deleteId) // Delete the old image if it exists
      }
    }

    getProductDetails() // Refresh the product details after update

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

function handleChangeImage() {
  const imageInput = document.querySelector('#image-upload')
  if (imageInput) {
    imageInput.click()
  }
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    const img = document.querySelector('#product-image')
    reader.onload = (e) => {
      img.src = e.target.result
      imgPreview.value = false // Hide the default image
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <main class="text-base">
    <div v-if="product" class="mt-4">
      <form action="" @submit="updateProduct">
        <div class="flex flex-col gap-4 bg-white rounded shadow-lg">
          <div class="p-4 bg-base text-white rounded-t flex flex-col md:flex-row justify-between items-center">
            <h1 class="text-xl font-bold self-start md:self-center">Product Details</h1>
            <button
              type="button"
              class="self-end-safe bg-sub hover:bg-yellow-600 text-white py-2 px-4 rounded w-[100px] h-[40px] cursor-pointer"
              @click="updateProduct"
            >
              Save
            </button>
          </div>
          <div class="flex flex-col md:flex-row p-4 gap-8">
            <!-- Image -->
            <div class="flex flex-col items-center gap-4 mb-6">
              <!-- Gambar Produk -->
              <img
                id="product-image"
                :src="imgUrl"
                v-if="imgUrl"
                alt="Product Image"
                class="w-60 h-40 object-cover rounded-lg shadow-md"
              />
              <div v-else class="w-60 h-40 object-cover rounded-lg shadow-md flex items-center justify-center bg-gray-200">
                <i class="fa-solid fa-image text-4xl text-gray-500"></i>
              </div>


              <!-- Input File -->
              <input
                type="file"
                @change="handleFileChange"
                class="hidden"
                id="image-upload"
                accept="image/*"
                ref="imgInput"
              />

              <!-- Tombol Ganti Gambar -->
              <button
                @click="handleChangeImage"
                type="button"
                class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold py-2 px-5 rounded-lg shadow-sm transition duration-200"
              >
                Ganti Gambar
              </button>
            </div>
            <!-- Form -->
            <div class="flex flex-col w-full">
              <div class="flex flex-col gap-2">
                <!-- Product -->
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="flex flex-col gap-2 w-full">
                    <label for="product_name" class="font-semibold text-xs">Nama Produk</label>
                    <input
                      type="text"
                      id="product_name"
                      v-model="product.product_name"
                      class="border border-base rounded p-2 bg-white w-full"
                    />
                  </div>
                  <div class="flex flex-col gap-2 w-full">
                    <label for="product_description" class="font-semibold text-xs">Deskripsi</label>
                    <textarea
                      id="product_description"
                      v-model="product.product_description"
                      class="border border-base rounded p-2 bg-white w-full"
                    ></textarea>
                  </div>
                </div>
                <!-- Price -->
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="flex flex-col gap-2 w-full">
                    <label for="product_price" class="font-semibold text-xs">Harga</label>
                    <input
                      type="text"
                      id="product_price"
                      v-model="product.product_price"
                      class="border border-base rounded p-2 bg-white w-full"
                    />
                  </div>
                  <div class="flex flex-col gap-2 w-full">
                    <label for="product_qty" class="font-semibold text-xs">Quantity</label>
                    <input
                      type="number"
                      id="product_qty"
                      v-model="product.product_qty"
                      class="border border-base rounded p-2 bg-white w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <Notivue v-slot="item">
      <Notification :item="item" :theme="pastelTheme">
        <NotificationProgress :item="item" />
      </Notification>
    </Notivue>
  </main>
</template>
