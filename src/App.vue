<script setup>
import { RouterView } from 'vue-router'
import nav_component from './components/Navigation.vue';
</script>

<template>
  <div class="flex gap-5 h-screen">
    <nav_component class="hidden md:flex sticky top-0 h-screen"/>
    <div class="px-4 py-4 w-full overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
</style>
