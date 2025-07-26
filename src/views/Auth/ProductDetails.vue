<script setup>
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

import { defineOptions } from 'vue'
defineOptions({
  name: 'product_details',
})

// ingin mengambil id dari route params
import { useRoute } from 'vue-router'
const route = useRoute()

import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const product = ref(null)
const isEditing = ref(false)
const imgUrl = ref('')
const imgPreview = ref(false)

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

const updateProduct = async () => {
  const id = route.params.id
  const updatedData = {
    product_name: product.value.product_name,
    product_code: product.value.product_code,
    product_description: product.value.product_description,
    product_price: product.value.product_price,
    product_qty: product.value.product_qty,
  }
  await axios.put(`${STRAPI_URL}/api/products/${id}`, { updatedData })
  alert('Product updated successfully!')
  getProductDetails() // Refresh the product details after update
  const inputs = document.querySelectorAll('input')
  const textarea = document.querySelector('textarea')
  inputs.forEach((input) => {
    input.setAttribute('readonly', 'readonly')
    input.classList.remove('bg-white')
    input.classList.add('bg-gray-100')
  })
  textarea.setAttribute('readonly', 'readonly')
  textarea.classList.remove('bg-white')
  textarea.classList.add('bg-gray-100')
  inputs[0].focus() // Focus on the first input field after update
}

function handleChangeImage() {
  const imageInput = document.querySelector('#image-upload')
  if (imageInput) {
    imageInput.click()
  }
}
</script>

<template>
  <main class="text-base">
    <div v-if="product" class="mt-4">
      <form action="" @submit="updateProduct">
        <div class="flex flex-col gap-4 bg-white rounded shadow-lg">
          <div class="p-4 bg-base text-white rounded-t flex justify-between items-center">
            <h1 class="text-xl font-bold">Product Details</h1>
            <button
                type="button"
                class="bg-sub hover:bg-yellow-600 text-white py-2 px-4 rounded w-[100px] h-[40px] cursor-pointer"
                @click="isEditing = !isEditing"
              >
                Save
              </button>
          </div>
          <div class="flex flex-row p-4 gap-4 items-center">
            <!-- Image -->
            <div class="flex flex-col mb-4 justify-center items-center">
              <img
                v-show="!imgPreview"
                :src="imgUrl"
                alt=""
                class="object-contain w-[300px] h-[300px] rounded-top"
              />
              <input type="file" @change="imageUploadHandleClick" class="hidden" id="image-upload" />
              <button
                v-on:click="handleChangeImage"
                id="changeImage"
                type="button"
                class="mb-2 bg-sub hover:bg-yellow-600 text-white py-2 px-4 rounded-br rounded-bl w-sm h-sm"
                @click="imageUploadHandleClick"
              >
                Change Image
              </button>
            </div>
            <!-- Form -->
            <div class="flex flex-col gap-2 w-full">
              <div class="flex flex-col gap-4 w-full">
                <!-- Product -->
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col gap-2">
                    <label for="product_name" class="font-semibold">Nama Produk</label>
                    <input
                      type="text"
                      id="product_name"
                      v-model="product.product_name"
                      class="border border-base rounded p-2 bg-white min-w-sm"
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="product_description" class="font-semibold">Deskripsi</label>
                    <textarea
                      id="product_description"
                      v-model="product.product_description"
                      class="border border-base rounded p-2 bg-white min-w-sm"
                    ></textarea>
                  </div>
                </div>
                <!-- Price -->
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col gap-2">
                    <label for="product_price" class="font-semibold">Harga</label>
                    <input
                      type="text"
                      id="product_price"
                      v-model="product.product_price"
                      class="border border-base rounded p-2 bg-white min-w-sm"
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="product_qty" class="font-semibold">Quantity</label>
                    <input
                      type="number"
                      id="product_qty"
                      v-model="product.product_qty"
                      class="border border-base rounded p-2 bg-white min-w-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div v-else class="mt-4">
      <p>Loading product details...</p>
    </div>
  </main>
</template>
