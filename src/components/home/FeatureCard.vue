<script setup>
  defineProps({
    title: {
      type: String,
      default: 'Feature Title'
    },
    description: {
      type: String,
      default: 'Brief description of the feature highlighting its benefits and use cases.'
    },
    icon: {
      type: String,
      default: 'fa-box'
    }
  })
</script>

<template>
  <main
    class="flex flex-col p-4 bg-white rounded-xl justify-center items-center shadow-sm hover:scale-105 hover:shadow-xl transition-all"
  >
    <!-- Feature Icon -->
    <div class="bg-sub py-8 px-9 rounded-full">
      <i class="fa-solid text-xl" :class="icon"></i>
    </div>
    <!-- Feature Name -->
    <h3 class="text-lg font-semibold mt-4 text-base">{{ title }}</h3>
    <!-- Feature Description -->
    <p class="text-gray-600 mt-2 text-center max-w-xs">
      {{ description }}
    </p>
    <!-- Action Button -->
    <button
      class="mt-4 bg-sub text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
    >
      Learn More
    </button>
  </main>
</template>
