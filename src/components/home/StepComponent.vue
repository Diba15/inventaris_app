<script setup>
  defineProps({
    stepNumber: {
      type: Number,
      default: 1
    },
    stepName: {
      type: String,
      default: 'Step Name'
    },
    stepDescription: {
      type: String,
      default: 'Brief description of the feature highlighting its benefits and use cases.'
    }
  });
</script>

<template>
  <main class="flex flex-col p-4 justify-center items-center">
    <!-- Step Number -->
    <div class="bg-sub py-5 px-7 rounded-full">
      <span class="text-2xl text-white">{{ stepNumber }}</span>
    </div>
    <!-- Step Name -->
    <h3 class="text-lg font-semibold mt-4 text-base">{{ stepName }}</h3>
    <!-- Step Description -->
    <p class="text-gray-600 mt-2 text-center max-w-xs">
      {{ stepDescription }}
    </p>
  </main>
</template>
