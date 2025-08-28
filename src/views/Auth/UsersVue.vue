<script setup>
import UserTable from '@/components/user/UserTable.vue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import AutoCompleteInput from '@/components/AutoCompleteInput.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

const users = ref([])
const selectedRole = ref('')
const username = ref('')
const email = ref('')
const password = ref('')

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
]

const getRoles = async() => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/roles`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const result = await response.json()
    console.log(result)
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
}

// Fetch users data (mocked for now)
const fetchUsers = async () => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/users?populate=*`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
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

function addUsers() {
  const dataUser = {
    username: username.value,
    email: email.value,
    password: password.value,
    role: selectedRole.value,
  }

  axios.post(`${STRAPI_URL}/api/auth/local/register`, dataUser).then((response) => {
    console.log('User registered:', response.data)
    // Optionally, refresh the user list or provide feedback to the user
  }).catch((error) => {
    console.error('Error registering user:', error)
  })
}

onMounted(async () => {
  await fetchUsers()
  await getRoles()
})
</script>

<template>
  <div class="flex flex-col m-4 gap-4">
    <div class="bg-white rounded-xl shadow">
      <div
        class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <h1 class="text-xl font-bold self-start md:self-center">Add User</h1>
      </div>

      <div class="min-h-[250px] p-4">
        <form class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" @submit.prevent="addUsers">
          <StandardFloatingInput
            label="Username"
            type="text"
            id="username"
            name="username"
            required
            v-model="username"
          />
          <StandardFloatingInput
            label="Email"
            type="email"
            id="email"
            name="email"
            v-model="email"
            required
          />
          <StandardFloatingInput
            label="Password"
            type="password"
            id="password"
            name="password"
            v-model="password"
            required
          />
          <AutoCompleteInput
            id="role"
            label="Select Role"
            v-model="selectedRole"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            required
            class="w-full max-w-md"
          />
          <div class="col-span-full flex justify-end">
            <button
              type="submit"
              class="bg-sub text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Table Users -->
    <user-table :users="users" />
  </div>
</template>
