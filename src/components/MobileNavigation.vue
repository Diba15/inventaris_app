<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const isOpen = ref(false)
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const role = computed(() => authStore.role)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const emit = defineEmits(['toggleProfileMenu'])

const menuItems = computed(() => {
  if (isAuthenticated.value.value) {
    if (role.value.value === 'Admin') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-simple' },
        { name: 'Products', path: '/products', icon: 'fa-solid fa-box-open' },
        { name: 'Suppliers', path: '/suppliers', icon: 'fa-solid fa-truck' },
        { name: 'Warehouse', path: '/warehouse', icon: 'fa-solid fa-warehouse' },
        { name: 'Reports', path: '/reports', icon: 'fa-solid fa-chart-line' },
        { name: 'Users', path: '/users', icon: 'fa-solid fa-users' },
      ]
    } else if (role.value.value === 'Employee') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-simple' },
        { name: 'Products', path: '/products', icon: 'fa-solid fa-box-open' },
      ]
    } else {
      // Default untuk authenticated user tanpa role atau role lainnya
      return [{ name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-simple' }]
    }
  } else {
    return [{ name: 'Home', path: '/', icon: 'fa-solid fa-house' }]
  }
})

function toggleMobileMenu() {
  isOpen.value = !isOpen.value
}

function toggleProfileMenu() {
  emit('toggleProfileMenu')
}
</script>

<template>
  <div class="fixed top-0 left-0 w-full z-50">
    <button
      @click="toggleMobileMenu"
      class="py-2 pl-6 pr-4 flex items-center justify-between rounded-full text-white bg-base w-fit fixed -left-6 top-[50%]"
    >
      <i class="fa-solid fa-caret-right text-2xl"></i>
    </button>
    <div
      class="flex flex-col justify-between bg-base text-white py-4 px-8  absolute top-0 w-full h-screen transition-all duration-300 ease-in-out"
      :class="{ 'left-0': isOpen, 'left-[-100%]': !isOpen }"
    >
      <!-- Sidebar -->
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.name">
          <RouterLink :to="item.path" @click="toggleMobileMenu" class="flex items-center p-2">
            <i :class="item.icon" class="mr-2 text-xl"></i>
            <span class="text-xl">{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>

      <!-- Close Menu -->
      <button
        @click="toggleMobileMenu"
        class="py-2 pr-6 pl-4 flex items-center justify-between rounded-full text-base bg-sub w-fit absolute -right-6 top-[50%]"
        :class="{ hidden: !isOpen }"
      >
        <i class="fa-solid fa-caret-left text-2xl"></i>
      </button>

      <!-- User Profile -->
      <div>
        <div
          v-if="isAuthenticated.value"
          id="user"
          class="flex items-center justify-between mt-auto"
          @click="toggleProfileMenu"
        >
          <div id="user_img">
            <img
              :src="`https://ui-avatars.com/api/?name=${user.value?.username}&background=random&size=30`"
              alt="User Avatar"
              class="rounded-full"
            />
          </div>
          <div class="ml-3" :class="{ hidden: !isOpen }">
            <p class="text-xs font-semibold">{{ user.value?.username }}</p>
            <p class="text-xs text-secondary">{{ role ?? 'Auth User' }}</p>
          </div>
          <button
            :class="{ hidden: !isOpen }"
            class="ml-auto text-secondar hover:font-bold transition-colors cursor-pointer"
          >
            <i class="fa-solid fa-chevron-up"></i>
          </button>
        </div>
        <div v-else class="mt-auto text-center">
          <RouterLink
            to="/login"
            class="text-sm text-secondary hover:font-bold transition-colors cursor-pointer"
            :class="{ 'flex items-center justify-center gap-2': isOpen, block: !isOpen }"
          >
            <i class="fa-solid fa-right-to-bracket"></i> Login
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
