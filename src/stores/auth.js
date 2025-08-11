// stores/auth.js
import { reactive, computed } from 'vue'
import axios from 'axios'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

// Simple reactive store
const state = reactive({
  user: null,
  role: null,
  token: localStorage.getItem('jwt') || null,
  isLoading: false,
  isInitialized: false // Track if auth has been initialized
})

// Auth store without Pinia
export const useAuthStore = () => {
  const isAuthenticated = computed(() => !!state.token && !!state.user)

  // Initialize auth from localStorage on app startup
  const initAuth = async () => {
    if (state.isInitialized) return

    console.log('🔄 Initializing auth...')

    try {
      state.isLoading = true

      if (state.token) {
        console.log('📱 Token found, verifying...')

        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`

        // Verify token and get user data
        await checkAuth()
        console.log('✅ Auth verification successful')
      } else {
        console.log('❌ No token found')
      }
    } catch (error) {
      console.error('❌ Auth initialization failed:', error)
      // Token is invalid, clear it
      logout()
    } finally {
      console.log('🏁 Auth initialization completed')
      state.isLoading = false
      state.isInitialized = true
    }
  }

  const login = async (credentials) => {
    try {
      state.isLoading = true

      const response = await axios.post(`${STRAPI_URL}/api/auth/local`, {
        identifier: credentials.email,
        password: credentials.password
      })

      const { jwt, user } = response.data

      state.token = jwt
      state.user = user

      localStorage.setItem('jwt', jwt)

      // Set default auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

      try {
        const userDetail = await axios.get(`${STRAPI_URL}/api/users/${user.id}?populate=*`)
        state.role = userDetail.data?.role?.name
      } catch (roleError) {
        console.warn('Failed to fetch role:', roleError)
        state.role = null
      }


      return { success: true, user }
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.error?.message || 'Login failed'
      throw new Error(message)
    } finally {
      state.isLoading = false
    }
  }

  const register = async (userData) => {
    try {
      state.isLoading = true

      const response = await axios.post(`${STRAPI_URL}/api/auth/local/register`, {
        username: userData.username,
        email: userData.email,
        password: userData.password
      })

      const { jwt, user } = response.data

      state.token = jwt
      state.user = user

      localStorage.setItem('jwt', jwt)
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

      return { success: true, user }
    } catch (error) {
      console.error('Register error:', error)
      const message = error.response?.data?.error?.message || 'Registration failed'
      throw new Error(message)
    } finally {
      state.isLoading = false
    }
  }

  const checkAuth = async () => {
    try {
      if (!state.token) {
        throw new Error('No token found')
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`

      const response = await axios.get(`${STRAPI_URL}/api/users/me`)
      const test = await axios.get(`${STRAPI_URL}/api/users/${response.data.id}?populate=*`)
      state.user = response.data
      state.role = test.data?.role?.name

      return { success: true, user: state.user }
    } catch (error) {
      console.error('Auth check error:', error)
      logout()
      throw error
    }
  }

  const logout = async () => {
    state.user = null
    state.token = null

    localStorage.removeItem('jwt')
    delete axios.defaults.headers.common['Authorization']
  }

  const forgotPassword = async (email) => {
    try {
      state.isLoading = true

      await axios.post(`${STRAPI_URL}/api/auth/forgot-password`, {
        email
      })

      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      console.error('Forgot password error:', error)
      const message = error.response?.data?.error?.message || 'Request failed'
      throw new Error(message)
    } finally {
      state.isLoading = false
    }
  }

  // Emergency method to force initialization completion
  const forceInitialized = () => {
    console.warn('🚨 Force completing initialization')
    state.isLoading = false
    state.isInitialized = true
  }

  return {
    // State
    user: computed(() => state.user),
    role: computed(() => state.role),
    token: computed(() => state.token),
    isLoading: computed(() => state.isLoading),
    isInitialized: computed(() => state.isInitialized),
    isAuthenticated,

    // Actions
    initAuth,
    login,
    register,
    checkAuth,
    logout,
    forgotPassword,
    forceInitialized
  }
}
