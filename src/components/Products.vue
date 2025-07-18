<script setup>
import { ref, computed } from 'vue'

defineOptions({
  name: 'products_component',
})

const emit = defineEmits(['deleteProduct'])

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
})

const sortOrder = ref('asc')
const sortKey = ref('product_category')

function sortBy(key) {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  sortKey.value = key
}

const handleSearch = (event) => {
  const searchTerm = event.target.value.toLowerCase()
  const filteredProducts = props.products.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm),
  )
  sortedProducts.value = filteredProducts
}

const sortedProducts = computed(() => {
  return [...props.products].sort((a, b) => {
    const aValue = a[sortKey.value]
    const bValue = b[sortKey.value]

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1

    console.log(aValue, bValue, sortKey.value, sortOrder.value)
    return 0
  })
})

function deleteProduct(id) {
  emit('deleteProduct', id)
}
</script>

<template>
  <div>
    <div class="flex items-center px-4">
      <input
        type="text"
        id="searchProduct"
        placeholder="Search Product"
        class="mb-2 px-2 py-1 rounded-l min-w-[250px] bg-white border-l border-t border-b border-black text-base focus:outline-none"
        @input="handleSearch"
      />
      <i
        class="mb-2 fa fa-search text-xl focus:outline-none bg-white px-2 py-1.5 rounded-r text-gray-400 border-r border-t border-b border-black"
      ></i>
    </div>
    <div class="product-grid">
      <table
        class="w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden hover-table"
      >
        <thead class="bg-base text-white">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_category')"
            >
              Product Category
              <span v-if="sortKey === 'product_category'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_code')"
            >
              Product Code
              <span v-if="sortKey === 'product_code'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_name')"
            >
              Nama Produk
              <span v-if="sortKey === 'product_name'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_description')"
            >
              Deskripsi
              <span v-if="sortKey === 'product_description'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_price')"
            >
              Harga
              <span v-if="sortKey === 'product_price'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
              @click="sortBy('product_qty')"
            >
              Quantity
              <span v-if="sortKey === 'product_qty'">
                <i :class="sortOrder === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
              </span>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 text-base text-sm">
          <tr
            v-for="(product, index) in sortedProducts"
            :key="product.id"
            :class="[
              'hover:bg-gray-300 transition-colors',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
            ]"
          >
            <td class="px-6 py-4 whitespace-nowrap">{{ product.product_category.category }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.product_code }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.product_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.product_description }}</td>
            <td class="px-6 py-4 whitespace-nowrap">Rp.{{ product.product_price }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.product_qty }}</td>
            <td class="px-6 py-4 whitespace-nowrap flex gap-2">
              <RouterLink
                :to="{ name: 'edit-product', params: { id: product.documentId } }"
                class="text-blue-500 hover:text-blue-700 text-xl"
              >
                <button>
                  <i class="fa-solid fa-eye"></i>
                </button>
              </RouterLink>
              <button
                class="text-red-500 hover:text-red-700 text-xl"
                @click="deleteProduct(product.documentId)"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="7" class="text-center py-4">No products available</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      id="pagination"
      class="flex justify-between text-base px-4 mt-2 text-sm items-center"
    >
      <div>1 - 5 of 100</div>
      <div class="flex gap-2 items-center">
        <div class="p-1 cursor-pointer"><i class="fa fa-angle-left"></i></div>
        <div id="current-page" class="p-1 cursor-pointer">Page 1</div>
        <div class="p-1 cursor-pointer"><i class="fa fa-angle-right"></i></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
