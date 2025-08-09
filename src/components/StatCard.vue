<script setup>
defineProps({
  title: {
    type: String,
    default: 'Stat Card',
  },
  value: {
    type: String,
    default: '0',
  },
  icon: {
    type: String,
    default: 'fa-chart-pie',
  },
  color: {
    type: String,
    default: 'bg-sub',
  },
  textColor: {
    type: String,
    default: 'text-sub',
  },
})
</script>

<template>
  <div class="flex gap-2 w-full text-base bg-white shadow rounded-md">
    <div class="w-[10px] h-full rounded-s-md" :class="color"></div>
    <div class="flex justify-between items-center w-full p-4">
      <div class="flex flex-col">
        <div class="text-3xl font-bold">{{ value }}</div>
        <div class="text-sm text-gray-500">{{ title }}</div>
      </div>
      <div class="rounded-full p-4">
        <i class="fa-solid text-6xl" :class="[icon, textColor]"></i>
      </div>
    </div>
  </div>
</template>
