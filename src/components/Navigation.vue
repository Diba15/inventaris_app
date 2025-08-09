<script setup>
defineOptions({
  name: 'nav_component',
})

import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const isOpen = ref(false)
const menuToggle = localStorage.getItem('menuToogle') || 'open'
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const role = computed(() => authStore.role)
let menuItems = []

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)

console.log('User:', user.value)

const props = defineProps({
  toggleProfile: {
    type: Boolean,
    required: true,
  },
})

if (menuToggle === 'closed') {
  isOpen.value = false
} else {
  isOpen.value = true
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  localStorage.setItem('menuToogle', isOpen.value ? 'open' : 'closed')

  if (props.toggleProfile === true) {
    toggleProfileMenu()
  }
}

if (isAuthenticated.value.value) {
  menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-simple' },
    { name: 'Products', path: '/products', icon: 'fa-solid fa-box-open' },
    { name: 'Suppliers', path: '/suppliers', icon: 'fa-solid fa-truck' },
    { name: 'Warehouse', path: '/warehouse', icon: 'fa-solid fa-warehouse' },
    { name: 'Reports', path: '/reports', icon: 'fa-solid fa-chart-line' },
    { name: 'Users', path: '/users', icon: 'fa-solid fa-users' },
  ]
} else {
  menuItems = [
    { name: 'Home', path: '/', icon: 'fa-solid fa-house' },
  ]
}

const emit = defineEmits(['toggleProfileMenu'])

function toggleProfileMenu() {
  emit('toggleProfileMenu')
  console.log('Profile menu toggled')
}
</script>

<template>
  <nav
    v-show="true"
    id="sidebar_nav"
    class="sidebar h-full bg-base text-secondary rounded-r-3xl p-5 flex flex-col justify-between"
    :class="{ 'sidebar-open': isOpen, 'sidebar-closed': !isOpen }"
  >
    <div>
      <div class="flex gap-10 justify-between items-center" :class="{ 'justify-center': !isOpen }">
        <h1 class="text-md font-bold" :class="{ hidden: !isOpen }">Inventaris App</h1>
        <button @click="toggleMenu" class="text-2xl">
          <span><img src="@/assets/Pane.svg" alt="" width="25" height="25" /></span>
        </button>
      </div>

      <ul class="mt-10 space-y-4">
        <li v-for="item in menuItems" :key="item.name">
          <RouterLink
            :to="item.path"
            class="flex gap-2 items-center rounded hover:bg-sub hover:text-base hover:font-bold transition-colors"
            :class="{ 'px-4 py-2': isOpen, 'px-0 py-2 justify-center': !isOpen }"
          >
            <i :class="item.icon"></i>
            <span class="text-sm" v-if="isOpen">{{ item.name }}</span>
          </RouterLink>
          <div class="h-[0.5px] width-full bg-secondary mt-2"></div>
        </li>
      </ul>
    </div>

    <div>
      <div
        v-if="isAuthenticated.value"
        id="user"
        class="flex items-center justify-between mt-auto"
        @click="toggleProfileMenu"
      >
        <div id="user_img">
          <img
            src="https://ui-avatars.com/api/?name=User&background=random&size=30"
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
          :class="{ 'flex items-center justify-center gap-2': isOpen, 'block': !isOpen }"
        >
          <i class="fa-solid fa-right-to-bracket"></i> Login
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.sidebar-open {
  width: 250px;
}
.sidebar-closed {
  width: 80px;
}
</style>
