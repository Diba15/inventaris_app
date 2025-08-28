<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import nav_component from './components/Navigation.vue'
import MobileNavigation from './components/MobileNavigation.vue'
import LoadingComponent from './components/LoadingComponent.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { Analytics } from '@vercel/analytics/nuxt'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const profileToggle = ref(false)
const appReady = ref(false)

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)

const isAuthPage = computed(() => {
  return ['/login', '/register', '/forgot-password'].includes(route.path)
})

const menuProfile = [
  {
    name: 'Edit Profile',
    action: () => {
      console.log('Edit Profile clicked')
      // router.push('/profile')
      profileToggle.value = false
    },
  },
  {
    name: 'Settings',
    action: () => {
      console.log('Settings clicked')
      // router.push('/settings')
      profileToggle.value = false
    },
  },
  {
    name: 'Logout',
    action: async () => {
      await handleLogout()
    },
  },
]

function toggleProfileMenu() {
  profileToggle.value = !profileToggle.value
}

const handleLogout = async () => {
  try {
    profileToggle.value = false
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Initialize auth on app mount
onMounted(async () => {
  try {
    // Simple timeout fallback
    setTimeout(() => {
      if (!appReady.value) {
        console.warn('Force app ready')
        appReady.value = true
      }
    }, 3000)

    await authStore.initAuth()
    appReady.value = true
  } catch (error) {
    console.error('Init error:', error)
    appReady.value = true // Show app anyway
  }
})

// Watch route changes for additional logic
watch(
  route,
  () => {
    // Close profile menu when route changes
    profileToggle.value = false
  },
  { immediate: false },
)
</script>

<template>
  <Analytics />
  <!-- Loading Screen - Show while auth is being initialized -->
  <div v-if="!appReady" class="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
    <LoadingComponent />
  </div>

  <!-- App Content - Only show when auth is initialized -->
  <template v-else>
    <!-- Login Page Layout (No Sidebar) -->
    <div v-if="isAuthPage" class="min-h-screen bg-gray-50">
      <RouterView />
    </div>

    <!-- Main App Layout (With Sidebar) - Only when authenticated -->
    <div v-else-if="isAuthenticated" class="flex gap-5 h-screen">
      <nav_component
        class="hidden md:flex sticky top-0 h-screen"
        @toggleProfileMenu="toggleProfileMenu"
        :toggle-profile="profileToggle"
      />

      <MobileNavigation
        class="md:hidden"
        @toggleProfileMenu="toggleProfileMenu"
        :toggle-profile="profileToggle"
      />

      <!-- Profile Menu -->
      <div
        id="profile_menu"
        class="flex flex-col gap-2 text-sm mb-3 items-start bg-sub text-base p-4 rounded h-fit min-w-40 absolute left-5 bottom-15 shadow-lg z-[9999]"
        :class="{ hidden: !profileToggle }"
      >
        <div
          v-for="item in menuProfile"
          :key="item.name"
          class="cursor-pointer hover:font-bold transition-colors w-full"
          @click="item.action"
        >
          {{ item.name }}
          <div class="h-[0.5px] width-full bg-base mt-2"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-4 py-4 w-full overflow-auto">
        <RouterView />
      </div>
    </div>

    <!-- Guest/Unauthenticated Layout -->
    <div v-else class="min-h-screen bg-gray-50">
      <RouterView />
    </div>
  </template>
</template>
