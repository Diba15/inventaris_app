<script setup>
defineProps({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
})
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-base">{{ name }}</h1>
    <div class="min-w-[200px] min-h-[200px] bg-gray-300 p-4">

    </div>
    <button class="text-base">Detail</button>
  </div>
</template>
