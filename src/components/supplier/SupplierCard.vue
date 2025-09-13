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
})
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-base font-bold">{{ name }}</h1>
    <div class="min-w-[150px] min-h-[150px] py-4 px-8 rounded-xl flex items-center justify-center">
      <img
        v-if="img"
        :src="img"
        alt="Supplier Image"
        class="max-w-[120px] max-h-[120px] object-cover rounded-lg"
      />

      <div v-else class="w-full h-full flex flex-col gap-4 items-center justify-center">
        <i class="fa fa-image text-4xl text-gray-500"></i>
        <p class="text-center text-gray-500">No Image Available</p>
      </div>
    </div>
    <button class="text-white font-bold bg-sub hover:bg-yellow-600 py-1.5 px-10 rounded-lg">Detail</button>
  </div>
</template>
