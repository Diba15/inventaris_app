<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
  type: {
    type: String,
    default: '',
  },
})
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import {ref} from 'vue'

const passConfirm = ref('')
const confirmStatus = ref(false)

const emit = defineEmits(['close', 'confirm'])

function confirm() {
  if (passConfirm.value === '' || passConfirm.value !== 'Persona345') {
    confirmStatus.value = true
    return
  }
  confirmStatus.value = false
  emit('confirm')
}

function close() {
  confirmStatus.value = false
  passConfirm.value = ''
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50 transition-all duration-300 ease-in-out"
  >
    <div class="bg-white min-w-md shadow-lg text-base rounded-xl">
      <div
        :class="[
          'p-4 rounded-t-xl',
          type === 'delete'
            ? 'bg-red-600 text-white'
            : type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-base text-white',
        ]"
      >
        <h1 class="text-lg font-bold">
          {{ type === 'delete' ? 'Delete Confirmation' : type === 'warning' ? 'Warning' : 'Alert' }}
        </h1>
      </div>
      <div class="p-6">
        <p class="mb-4">
          {{ type === 'delete' ? 'Are you sure you want to delete?' : message }}
        </p>
        <div v-if="type === 'delete'" class="flex flex-col gap-2">
          <StandardFloatingInput
            label="Delete Confirmation Password"
            type="password"
            id="deleteConfirmation"
            name="passwordDeleteConfirmation"
            required
            v-model="passConfirm"
          />
          <p v-show="confirmStatus" class="text-red-500 ">Password Wrong!</p>
          <div class="flex gap-2 justify-end">
            <button
              @click="confirm"
              class="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition"
            >
              Konfirmasi
            </button>
            <button
              @click="close"
              class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
            >
              Batal
            </button>
          </div>
        </div>
        <div v-else>
          <button
            @click="emit('close')"
            :class="[
              'px-4 py-2 rounded transition',
              type === 'warning'
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-sub text-white hover:bg-yellow-600',
            ]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
