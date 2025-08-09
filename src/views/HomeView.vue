<script setup>
defineOptions({
  name: 'HomeView',
})

import HeroComponent from '@/components/home/Hero.vue'
import HeroContact from '@/components/home/HeroContact.vue'
import FeatureCard from '@/components/home/FeatureCard.vue'
import StepComponent from '@/components/home/StepComponent.vue'
import ImageCarousel from '@/components/home/ImageCarousel.vue'

const stepList = [
  {
    stepNumber: 1,
    stepName: 'Login',
    stepDescription: 'Login to your account to access the app features and functionalities.',
  },
  {
    stepNumber: 2,
    stepName: 'Data Input',
    stepDescription: 'Input your inventory data to start managing your items effectively.',
  },
  {
    stepNumber: 3,
    stepName: 'Monitoring',
    stepDescription:
      'Monitor your inventory in real-time to keep track of your items and their status.',
  },
  {
    stepNumber: 4,
    stepName: 'Reporting',
    stepDescription: 'Generate reports to analyze your inventory data and make informed decisions.',
  },
]

const featureList = [
  {
    title: 'Comprehensive Inventory Management',
    description: 'Manage your inventory with ease using our intuitive interface.',
    icon: 'fa-boxes-stacked',
  },
  {
    title: 'Real-time Updates',
    description: 'Get real-time updates on your inventory status and changes.',
    icon: 'fa-sync-alt',
  },
  {
    title: 'Secure Data Storage',
    description: 'Keep your data safe with our secure storage solutions.',
    icon: 'fa-lock',
  },
  {
    title: 'Customizable Reports',
    description: 'Generate reports tailored to your specific needs and requirements.',
    icon: 'fa-chart-bar',
  },
]
</script>

<template>
  <HeroComponent />

  <!-- Feature Section -->
  <div class="max-w-lg flex flex-col items-center mx-auto my-2">
    <h2 class="text-2xl font-bold text-center mt-8 text-base">Our Features</h2>
    <p class="text-gray-600 text-center mt-2">
      Explore the features that make our app unique and powerful.
    </p>
    <div
      class="w-full h-3 bg-gradient-to-r from-sub to-yellow-300 rounded-full transform -skew-x-12 opacity-80"
    ></div>
    <div class="w-3/4 h-1 bg-yellow-300 rounded-full transform skew-x-6 opacity-50"></div>
  </div>
  <div class="flex flex-wrap justify-center gap-4 p-4">
    <FeatureCard
      v-for="feature in featureList"
      :key="feature.title"
      :title="feature.title"
      :icon="feature.icon"
      :description="feature.description"
    />
  </div>

  <!-- Reason Section -->
  <div class="max-w-lg flex flex-col items-center mx-auto my-2">
    <h2 class="text-2xl font-bold text-center text-base">Why Choose Us?</h2>
    <p class="text-gray-600 mt-2 text-center">
      Discover the reasons why our app stands out in the market.
    </p>
    <div
      class="w-full h-3 bg-gradient-to-r from-sub to-yellow-300 rounded-full transform -skew-x-12 opacity-80"
    ></div>
    <div class="w-3/4 h-1 bg-yellow-300 rounded-full transform skew-x-6 opacity-50"></div>
  </div>
  <div class="max-w-full mx-20 mb-10 rounded-xl flex flex-row items-center justify-between">
    <div class="max-w-lg my-8 p-4 flex flex-col items-center">
      <ul class="mt-4 space-y-8">
        <li class="flex items-center">
          <i class="fa-solid fa-check text-sub mr-2"></i>
          <span class="text-gray-500">Feature 1: Comprehensive inventory management</span>
        </li>
        <li class="flex items-center">
          <i class="fa-solid fa-check text-sub mr-2"></i>
          <span class="text-gray-500">Feature 2: User-friendly interface</span>
        </li>
        <li class="flex items-center">
          <i class="fa-solid fa-check text-sub mr-2"></i>
          <span class="text-gray-500">Feature 3: Real-time updates and notifications</span>
        </li>
        <li class="flex items-center">
          <i class="fa-solid fa-check text-sub mr-2"></i>
          <span class="text-gray-500">Feature 4: Secure data storage and access</span>
        </li>
        <li class="flex items-center">
          <i class="fa-solid fa-check text-sub mr-2"></i>
          <span class="text-gray-500">Feature 5: Customizable reports and analytics</span>
        </li>
      </ul>
    </div>

    <!-- Image Preview -->
    <image-carousel />
  </div>

  <!-- Step to use our apps -->
  <div class="max-w-lg flex flex-col items-center mx-auto my-2">
    <h2 class="text-2xl font-bold text-center text-base">How to use our apps</h2>
    <p class="text-gray-600 mt-2 text-center">
      Follow these simple steps to get started with our app and make the most of its features.
    </p>
    <div
      class="w-full h-3 bg-gradient-to-r from-sub to-yellow-300 rounded-full transform -skew-x-12 opacity-80"
    ></div>
    <div class="w-3/4 h-1 bg-yellow-300 rounded-full transform skew-x-6 opacity-50"></div>
  </div>
  <div class="flex flex-wrap justify-center gap-4 p-4">
    <StepComponent
      v-for="step in stepList"
      :key="step.stepNumber"
      :stepNumber="step.stepNumber"
      :stepName="step.stepName"
      :stepDescription="step.stepDescription"
    />
  </div>

  <HeroContact />
</template>

<style scoped>
@keyframes draw {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.animate-draw {
  animation: draw 2s ease-out forwards;
}
</style>
