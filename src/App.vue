<script setup>
import { RouterView } from 'vue-router'
import nav_component from './components/Navigation.vue'
import { ref } from 'vue'

const profileToggle = ref(false)

const menuProfile = [
  { name: 'Edit Profile', action: () => console.log('Edit Profile clicked') },
  { name: 'Settings', action: () => console.log('Settings clicked') },
  { name: 'Logout', action: () => console.log('Logout clicked') },
]

function toggleProfileMenu() {
  profileToggle.value = !profileToggle.value
}
</script>

<template>
  <div class="flex gap-5 h-screen">
    <nav_component
      class="hidden md:flex sticky top-0 h-screen"
      @toggleProfileMenu="toggleProfileMenu"
      :toggle-profile="profileToggle"
    />
    <div
      id="profile_menu"
      class="flex flex-col gap-2 text-sm mb-3 items-start bg-sub text-base p-4 rounded h-fit min-w-40 absolute left-5 bottom-15 shadow-lg"
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
    <div class="px-4 py-4 w-full overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
