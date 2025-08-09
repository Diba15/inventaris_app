<script setup>
defineOptions({
  name: 'HeroComponent',
});

defineProps({
  title: {
    type: String,
    default: 'Inventaris App',
  },
  description: {
    type: String,
    default: 'Welcome to the Inventaris App, your go-to solution for managing inventory efficiently.',
  },
  subDescription: {
    type: String,
    default: 'Get started by exploring our features below.',
  },
  buttonText: {
    type: String,
    default: 'Get Started',
  },
});

</script>

<template>
  <main class="flex p-8 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-xl justify-evenly items-center">
    <div class="flex flex-col">
      <h1 class="text-white font-bold text-4xl">{{ title }}</h1>
      <p class="text-gray-200 mt-2">{{ description }}</p>
      <p class="text-gray-200 mt-1">{{ subDescription }}</p>
      <div class="mt-4">
        <button class="bg-white text-yellow-500 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
          {{ buttonText }}
        </button>
      </div>
    </div>
    <img src="@/assets/vector_hero_home.svg" alt="" class="w-xs h-auto" />
  </main>
</template>
