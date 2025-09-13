<script setup>
import UserTable from '@/components/user/UserTable.vue'
import StandardFloatingInput from '@/components/StandardFloatingInput.vue'
import AutoCompleteInput from '@/components/AutoCompleteInput.vue'
import ConfirmationDeleteUser from '@/components/user/ConfirmationDeleteUser.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { Notivue, Notification, push, pastelTheme, NotificationProgress } from 'notivue'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL

const users = ref([])
const roles = ref([])
const selectedRole = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const message = ref('')
const show = ref(false)
const modalType = ref('delete')
const deleteId = ref(null)

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

async function addUsers() {
  const notif = push.promise({
    type: 'info',
    message: 'Registering user...',
    duration: 0,
  })
  try {
    // Step 1: Register user
    const registerData = {
      username: username.value,
      email: email.value,
      password: password.value,
    }

    const registerResponse = await axios.post(`${STRAPI_URL}/api/auth/local/register`, registerData)

    const disconnect = {
      createdAt: '2025-07-16T04:48:14.611Z',
      description: 'Default role given to authenticated user.',
      documentId: 'ty3ayi1vrkzf6qn3dc4n0l6w',
      id: 1,
      name: 'Authenticated',
      publishedAt: '2025-07-16T04:48:14.612Z',
      type: 'authenticated',
      updatedAt: '2025-08-10T02:51:34.874Z',
    }

    // Step 2: Update user role
    const userId = registerResponse?.data?.user?.id
    const updateData = {
      role: {
        disconnect: [disconnect],
        connect: [selectedRole.value],
      },
    }

    await axios.put(`${STRAPI_URL}/api/users/${userId}`, updateData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    })

    fetchUsers()
    // Reset form
    username.value = ''
    email.value = ''
    password.value = ''
    selectedRole.value = ''
    notif.resolve({
      type: 'success',
      message: 'User registered successfully!',
      duration: 3000,
    })
  } catch (error) {
    notif.reject({
      type: 'error',
      message: error.response?.data?.error?.message || 'Failed to register user',
      duration: 5000,
    })
  }
}

async function deleteUsers(id) {
  const userId = id || deleteId.value

  const notif = push.promise({
    type: 'info',
    message: 'Deleting user...',
    duration: 0,
  })
  try {
    await axios.delete(`${STRAPI_URL}/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    })

    // Refresh data
    await fetchUsers()

    // Close modal
    show.value = false
    deleteId.value = null
    errorMessage.value = ''
    notif.resolve({
      type: 'success',
      message: 'User deleted successfully!',
      duration: 3000,
    })
  } catch (error) {
    show.value = false
    deleteId.value = null
    notif.reject({
      type: 'error',
      message: error.response?.data?.error?.message || 'Failed to delete user',
      duration: 5000,
    })
  }
}

function openDeleteModal(id) {
  message.value = `Are you sure you want to delete?`
  show.value = true
  modalType.value = 'delete'
  deleteId.value = id
}

onMounted(async () => {
  await fetchUsers()

  // Fetch roles for the autocomplete
  users.value.forEach((user) => {
    if (user.role && !roles.value.find((r) => r.documentId === user.role.documentId)) {
      roles.value.push(user.role)
    }
  })
})
</script>

<template>
  <div class="flex flex-col m-4 gap-4">
    <div class="bg-white rounded-xl shadow">
      <div
        class="bg-base text-secondary p-6 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <div>
          <h1 class="text-2xl font-bold">Add User</h1>
          <p class="text-[var(--color-secondary)] opacity-80 mt-1">Add a new user to the system</p>
        </div>
        <button
          @click="addUsers"
          class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors mt-4 md:mt-0 self-end md:self-center cursor-pointer"
        >
          Add User
        </button>
      </div>

      <div class="h-fit p-4">
        <p v-if="errorMessage" class="text-red-500 mb-2">{{ errorMessage }}</p>
        <form
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          @submit.prevent="addUsers"
        >
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
            :options="roles"
            option-label="name"
            option-value="role"
            required
            class="w-full max-w-md"
          />
        </form>
      </div>
    </div>

    <!-- Table Users -->
    <user-table :users="users" @deleteUser="deleteUsers" @open-delete-modal="openDeleteModal" />
    <ConfirmationDeleteUser
      :message="message"
      :show="show"
      @close="show = false"
      :type="modalType"
      @confirm="deleteUsers"
    />
    <Notivue v-slot="item">
      <Notification :item="item" :theme="pastelTheme">
        <NotificationProgress :item="item" />
      </Notification>
    </Notivue>
  </div>
</template>
