<script setup>
import { ref } from 'vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

const isOpen = ref(true)

defineProps({
  message: {
    type: String,
    required: true
  }
})
defineEmits(['closeModal', 'openModal'])

function closeModal() {
  isOpen.value = false
}
function openModal() {
  isOpen.value = true
}
</script>


<template>
  <div class="fixed inset-0 flex flex-col items-center justify-center">
    <button
      type="button"
      @click="openModal"
      class="rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
    >
      Open dialog
    </button>
    <div class="bg-white text-base p-4 rounded-xl shadow">
      <h1 class="text-2xl font-bold">{{ message }}</h1>
      <p>{{ message }}</p>
      <button class="bg-sub text-white px-4 py-2 min-w-[250px] rounded hover:bg-yellow-600 transition-colors cursor-pointer">Close</button>
    </div>
  </div>
</template>
