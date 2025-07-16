<script setup>
defineOptions({
  name: 'nav_component',
})

import { ref } from 'vue'
import { RouterLink } from 'vue-router'
const isOpen = ref(false)
const menuToggle =localStorage.getItem('menuToogle') || 'open';
const profileToggle = ref(false)

if (menuToggle === 'closed') {
  isOpen.value = false
} else {
  isOpen.value = true
}

console.log('Menu state:', isOpen.value ? 'open' : 'closed')

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  localStorage.setItem('menuToogle', isOpen.value ? 'open' : 'closed');
}
const closeMenu = () => {
  isOpen.value = false
  localStorage.setItem('menuToogle', 'closed');
}

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-simple' },
  { name: 'Products', path: '/products', icon: 'fa-solid fa-box-open' },
  { name: 'Suppliers', path: '/suppliers', icon: 'fa-solid fa-truck' },
  { name: 'Warehouse', path: '/warehouse', icon: 'fa-solid fa-warehouse' },
  { name: 'Reports', path: '/reports', icon: 'fa-solid fa-chart-line' },
  { name: 'Users', path: '/users', icon: 'fa-solid fa-users' },
]

const toggleProfileMenu = () => {
  profileToggle.value = !profileToggle.value
  console.log('Profile menu state:', profileToggle.value ? 'open' : 'closed')
}


const menuProfile = [
  { name: 'Edit Profile', action: () => console.log('Edit Profile clicked') },
  { name: 'Settings', action: () => console.log('Settings clicked') },
  { name: 'Logout', action: () => console.log('Logout clicked') },
]
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
      <div id="profile_menu" class="flex flex-col gap-2 text-sm mb-3 items-start bg-sub text-base p-4 rounded" :class="{ hidden: !profileToggle }">
        <div v-for="item in menuProfile" :key="item.name" class="cursor-pointer hover:font-bold transition-colors w-full" @click="item.action">
          {{ item.name }}
          <div class="h-[0.5px] width-full bg-base mt-2"></div>
        </div>
      </div>
      <div id="user" class="flex items-center justify-between mt-auto">
        <div id="user_img">
          <img
            src="https://ui-avatars.com/api/?name=User&background=random&size=30"
            alt="User Avatar"
            class="rounded-full"
          />
        </div>
        <div class="ml-3" :class="{ hidden: !isOpen }">
          <p class="text-xs font-semibold">User Name</p>
          <p class="text-xs text-secondary">User Role</p>
        </div>
        <button
          :class="{ hidden: !isOpen }"
          class="ml-auto text-secondar hover:font-bold transition-colors cursor-pointer"
          @click="toggleProfileMenu"
        >
          <i class="fa-solid fa-chevron-up"></i>
        </button>
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
