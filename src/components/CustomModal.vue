<script setup>
defineProps({
  modalTitle: {
    type: String,
    required: true,
  },
  isAddModalOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['closeAddModal'])

function closeAddModal() {
  emit('closeAddModal')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999] transition-opacity duration-300"
      @click="closeAddModal"
    >
      <div
        class="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg transform transition-all duration-300 scale-95"
        :class="{ 'scale-100': isAddModalOpen }"
        @click.stop
      >
        <h2 class="text-2xl font-bold mb-6 text-gray-800">{{ modalTitle }}</h2>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
