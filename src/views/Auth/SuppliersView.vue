<script setup>
import SupplierCard from '@/components/supplier/SupplierCard.vue';
import { ref } from 'vue';

const dummySupplierList = ref([
  {
    id: 1,
    name: 'Supplier 1'
  },
  {
    id: 2,
    name: 'Supplier 2'
  },
  {
    id: 3,
    name: 'Supplier 3'
  }
])
</script>

<template>
  <div class="flex mx-4 gap-4">
    <supplier-card v-for="supplier in dummySupplierList" :key="supplier.id" :id="supplier.id" :name="supplier.name" />
  </div>
</template>
