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
    <div class="min-w-[200px] min-h-[200px] p-4 rounded-xl flex items-center justify-center ">
      <img
        v-if="img"
        :src="img"
        alt="Supplier Image"
        class="w-full h-full object-cover rounded-lg"
      />
      <div v-else class="w-full h-full flex flex-col gap-4 items-center justify-center">
        <i class="fa fa-image text-4xl text-gray-500"></i>
        <p class="text-center text-gray-500">No Image Available</p>
      </div>
    </div>
    <button class="text-base font-bold">Detail</button>
  </div>
</template>
