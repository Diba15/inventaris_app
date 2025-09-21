<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import FloatingInput from '@/components/FloatingInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})

const error = ref('')
const isLoading = ref(false)
const fieldErrors = ref({
  email: '',
  password: ''
})

const validateForm = () => {
  fieldErrors.value = {
    email: '',
    password: ''
  }

  let isValid = true

  if (!form.value.email) {
    fieldErrors.value.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    fieldErrors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!form.value.password) {
    fieldErrors.value.password = 'Password is required'
    isValid = false
  } else if (form.value.password.length < 6) {
    fieldErrors.value.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  try {
    error.value = ''

    if (!validateForm()) {
      return
    }

    isLoading.value = true

    await authStore.login(form.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>


<template>
  <div
    class="min-h-screen flex items-center justify-center bg-secondary py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 bg-base py-20 px-10 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">Sign in to your account</h2>
        <p class="mt-2 text-center text-sm text-gray-400">
          Access your inventory management system
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <FloatingInput
            id="email"
            label="Email Address"
            type="email"
            v-model="form.email"
            :required="true"
            :error-message="fieldErrors.email"
          />

          <FloatingInput
            id="password"
            label="Password"
            type="password"
            v-model="form.password"
            :required="true"
            :error-message="fieldErrors.password"
          />
        </div>

        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm"
        >
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-base bg-sub hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-base"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>
        </div>

        <div class="relative bottom-0 w-fit mx-auto">
          <router-link
            to="/"
            class="text-white hover:text-sub text-sm flex items-center gap-1"
          >
            <i class="fa-solid fa-arrow-left"></i> Back to Home
          </router-link>
        </div>
      </form>
    </div>
  </div>

  <div class="absolute flex flex-col gap-2 text-gray-400 top-5 left-5">
    <h1 class="text-2xl font-bold ">Guest Account</h1>
    <p>Email: admin@email.com</p>
    <p>Password: admin123</p>
  </div>
</template>
