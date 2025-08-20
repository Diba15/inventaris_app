<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import dashboardImage from '@/assets/dashboard_preview.png'
import inventoryImage from '@/assets/inventory_preview.png'
import supplierImage from '@/assets/products_preview.png'
import warehouseImage from '@/assets/warehouse_preview.png'

// Data gambar - ganti dengan path gambar Anda
const images = ref([
  {
    src: dashboardImage,
    alt: 'Dashboard Preview',
    title: 'Dashboard Overview'
  },
  {
    src: inventoryImage,
    alt: 'Inventory Preview',
    title: 'Inventory Management'
  },
  {
    src: supplierImage,
    alt: 'Suppliers Preview',
    title: 'Supplier Management'
  },
  {
    src: warehouseImage,
    alt: 'Warehouse Preview',
    title: 'Warehouse Management'
  },
  {
    src: '@/assets/users_preview.png',
    alt: 'Users Preview',
    title: 'User Management'
  }
])

const currentIndex = ref(0)
const isAutoPlay = ref(true)
const autoPlayInterval = ref(null)

// Navigasi ke gambar berikutnya
const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

// Navigasi ke gambar sebelumnya
const prevImage = () => {
  currentIndex.value = currentIndex.value === 0
    ? images.value.length - 1
    : currentIndex.value - 1
}

// Navigasi langsung ke gambar tertentu
const goToImage = (index) => {
  currentIndex.value = index
}

// Auto play functionality
const startAutoPlay = () => {
  if (isAutoPlay.value) {
    autoPlayInterval.value = setInterval(nextImage, 4000) // Ganti setiap 4 detik
  }
}

const stopAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
    autoPlayInterval.value = null
  }
}

const toggleAutoPlay = () => {
  isAutoPlay.value = !isAutoPlay.value
  if (isAutoPlay.value) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
}

// Keyboard navigation
const handleKeydown = (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case ' ': // Spacebar
      event.preventDefault()
      toggleAutoPlay()
      break
  }
}

onMounted(() => {
  startAutoPlay()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopAutoPlay()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="relative w-full max-w-xl">
    <!-- Main Image Container -->
    <div
      class="flex-shrink-0 w-full h-96 mt-8 rounded-lg overflow-hidden bg-gradient-to-r from-sub to-yellow-300 flex items-center justify-center shadow-lg relative group"
      @mouseenter="stopAutoPlay"
      @mouseleave="isAutoPlay && startAutoPlay()"
    >
      <!-- Images -->
      <div class="relative w-full h-full overflow-hidden">
        <TransitionGroup
          name="slide"
          tag="div"
          class="relative w-full h-full"
        >
          <div
            v-for="(image, index) in images"
            v-show="index === currentIndex"
            :key="index"
            class="absolute inset-0 flex items-center justify-center"
          >
            <img
              :src="image.src"
              :alt="image.alt"
              class="w-md h-fit transition-transform duration-300 hover:scale-105"
            />
            <!-- Image Title Overlay -->
            <div class="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
              <span class="text-sm font-medium">{{ image.title }}</span>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Navigation Arrows -->
      <button
        @click="prevImage"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Previous image"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        @click="nextImage"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Next image"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Auto Play Toggle -->
      <button
        @click="toggleAutoPlay"
        class="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        :aria-label="isAutoPlay ? 'Pause slideshow' : 'Play slideshow'"
      >
        <svg v-if="isAutoPlay" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </div>

    <!-- Dots Navigation -->
    <div class="flex justify-center mt-4 space-x-2">
      <button
        v-for="(image, index) in images"
        :key="index"
        @click="goToImage(index)"
        :class="[
          'w-3 h-3 rounded-full transition-all duration-200',
          index === currentIndex
            ? 'bg-yellow-500 scale-125'
            : 'bg-gray-300 hover:bg-gray-400'
        ]"
        :aria-label="`Go to image ${index + 1}`"
      ></button>
    </div>
  </div>
</template>

<style scoped>
/* Slide transition animations */
.slide-enter-active {
  animation: slideIn 0.8s ease-in-out;
}

.slide-leave-active {
  animation: slideIn 0.8s ease-in-out reverse;
}

@keyframes slideIn {
  0% {
    transform: translateX(100%);
  }
  50% {
    transform: translateX(-10%);
  }
  100% {
    transform: translateX(0);
  }
}

/* Custom scrollbar untuk thumbnail navigation */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
