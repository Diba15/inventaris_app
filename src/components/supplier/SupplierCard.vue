<script setup>
defineProps({
  id: {
    type: Number,
    required: true,
  },
  img: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  picName: {
    type: String,
    default: 'N/A',
  },
  contact: {
    type: String,
    default: 'N/A',
  },
  address: {
    type: String,
    default: 'N/A',
  },
})

const emit = defineEmits(['openDeleteModal', 'openEditModal'])

function openDeleteModal(idSupplier) {
  emit('openDeleteModal', idSupplier)
}

function openEditModal(idSupplier) {
  emit('openEditModal', idSupplier)
}
</script>

<template>
  <!-- Main card container with shadow, border, and rounded corners -->
  <div
    class="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-lg transform transition-all hover:shadow-2xl"
  >
    <div class="flex flex-col items-center p-6">
      <!-- Supplier Image Section -->
      <div class="w-32 h-32 mb-4 flex items-center justify-center bg-gray-100">
        <img v-if="img" :src="img" alt="Supplier Image" class="w-full h-full object-cover" />
        <div v-else class="text-center">
          <img :src="`https://ui-avatars.com/api/?name=${name}&background=random&size=100`" alt="">
        </div>
      </div>

      <!-- Supplier Name -->
      <h1 class="text-xl font-bold text-gray-800 text-center">{{ name }}</h1>
      <hr class="w-3/4 my-4 border-t border-gray-200" />

      <!-- Supplier Details Section -->
      <div class="w-full text-left space-y-3 px-2">
        <div class="flex items-start">
          <i class="fa fa-user-circle text-yellow-500 w-5 mt-1"></i>
          <div class="ml-3">
            <h2 class="text-xs font-semibold text-gray-500">PIC Name</h2>
            <p class="text-sm text-gray-700">{{ picName }}</p>
          </div>
        </div>
        <div class="flex items-start">
          <i class="fa fa-phone-alt text-yellow-500 w-5 mt-1"></i>
          <div class="ml-3">
            <h2 class="text-xs font-semibold text-gray-500">Contact - <i class="fa fa-whatsapp text-green-500"></i> Whatsapp Available</h2>
            <p class="text-sm text-gray-700">{{ contact }}</p>
          </div>
        </div>
        <div class="flex items-start">
          <i class="fa fa-map-marker-alt text-yellow-500 w-5 mt-1"></i>
          <div class="ml-3">
            <h2 class="text-xs font-semibold text-gray-500">Address</h2>
            <p class="text-sm text-gray-700">{{ address }}</p>
          </div>
        </div>
      </div>

      <!-- Detail Button -->
      <div class="flex justify-center gap-2">
        <button
          @click="openEditModal(id)"
          class="flex items-center gap-2 mt-6 text-white font-bold bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 py-2.5 px-12 rounded-lg shadow-md transition-transform transform hover:translate-y-[-2px]"
        >
          <span><i class="fa fa-pen"></i></span>
          <p>Edit</p>
        </button>
        <button
          @click="openDeleteModal(id)"
          class="flex items-center gap-2 mt-6 text-white font-bold bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 py-2.5 px-12 rounded-lg shadow-md transition-transform transform hover:translate-y-[-2px]"
        >
          <span><i class="fa fa-trash"></i></span>
          <p>Delete</p>
        </button>
      </div>
    </div>
  </div>
</template>
