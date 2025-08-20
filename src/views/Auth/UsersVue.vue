<script setup>
import UserTable from '@/components/user/UserTable.vue'
import { onMounted, ref } from 'vue'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

const users = ref([])

// Fetch users data (mocked for now)
const fetchUsers = async () => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/users?populate=*`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}` // Replace with your actual token
      }
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const result = await response.json()
    users.value = result
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

onMounted(async () => {
  await fetchUsers()
})
</script>

<template>
  <div class="flex flex-col m-4 gap-4">
    <div class="bg-white rounded-xl shadow">
      <div
        class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <h1 class="text-xl font-bold self-start md:self-center">Users</h1>
      </div>

      <div class="min-h-[250px] p-4">
        <div
          class="bg-gray-400 min-h-[250px] min-w-full rounded-lg flex items-center justify-center"
        >
          <h1>Form Users</h1>
        </div>
      </div>
    </div>

    <!-- Table Users -->
    <user-table :users="users" />
  </div>
</template>
