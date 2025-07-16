<script setup>
import { RouterView } from 'vue-router'
import nav_component from './components/Navigation.vue';

defineOptions({
  name: 'DashboardParent'
})
</script>

<template>
  <div class="flex gap-5 h-screen">
    <nav_component class="grow-5" />

    <div class="p-4 grow-3">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>

</style>
