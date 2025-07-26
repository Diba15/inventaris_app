<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
})
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50 transition-all duration-300 ease-in-out"
  >
    <div class="min-w-[300px] shadow-lg text-base rounded-xl">
      <div id="spinner">
        <div class="flex items-center justify-center space-x-2">
          <div class="w-4 h-4 bg-sub rounded-full animate-bounce" style="animation-delay: 0s"></div>
          <div
            class="w-4 h-4 bg-sub rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="w-4 h-4 bg-sub rounded-full animate-bounce"
            style="animation-delay: 0.4s"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
