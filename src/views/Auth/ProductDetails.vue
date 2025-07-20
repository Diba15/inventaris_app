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

const getProductDetails = async () => {
  const id = route.params.id
  const response = await axios.get(`${STRAPI_URL}/api/products/${id}?populate=*`)
  product.value = response.data.data
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

  isEditing.value = false
}
</script>

<template>
  <main class="text-base">
    <h1 class="text-2xl font-bold">Product Details</h1>

    <div v-if="product" class="mt-4">
      <form action="" @submit="updateProduct">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="product_name" class="font-semibold">Nama Produk</label>
            <input
              type="text"
              id="product_name"
              v-model="product.product_name"
              class="border border-gray-300 rounded p-2 bg-gray-100"
              readonly
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="product_code" class="font-semibold">Kode Produk</label>
            <input
              type="text"
              id="product_code"
              v-model="product.product_code"
              class="border border-gray-300 rounded p-2 bg-gray-100"
              readonly
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="product_description" class="font-semibold">Deskripsi</label>
            <textarea
              id="product_description"
              v-model="product.product_description"
              class="border border-gray-300 rounded p-2 bg-gray-100"
              readonly
            ></textarea>
          </div>
          <div class="flex flex-col gap-2">
            <label for="product_price" class="font-semibold">Harga</label>
            <input
              type="text"
              id="product_price"
              v-model="product.product_price"
              class="border border-gray-300 rounded p-2 bg-gray-100"
              readonly
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="product_qty" class="font-semibold">Quantity</label>
            <input
              type="number"
              id="product_qty"
              v-model="product.product_qty"
              class="border border-gray-300 rounded p-2 bg-gray-100"
              readonly
            />
          </div>
        </div>
        <div class="mt-4">
          <button
            type="button"
            class="bg-sub hover:bg-yellow-600 text-white py-2 px-4 rounded"
            @click="isEditing = !isEditing"
          >
            Edit
          </button>
        </div>
      </form>
    </div>
    <div v-else class="mt-4">
      <p>Loading product details...</p>
    </div>
  </main>
</template>
