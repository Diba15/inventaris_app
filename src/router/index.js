// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '@/views/Auth/DashboardView.vue'
import ProductsView from '@/views/Auth/ProductsView.vue'
import SuppliersView from '@/views/Auth/SuppliersView.vue'
import WarehouseView from '@/views/Auth/WarehouseView.vue'
import ReportsView from '@/views/Auth/ReportsView.vue'
import UsersVue from '@/views/Auth/UsersVue.vue'

// Auth views
import LoginView from '@/views/Auth/LoginView.vue'
import RegisterView from '@/views/Auth/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'bg-sub text-base font-bold',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Home',
        description: 'Welcome to the Inventaris App',
        requiresGuest: true // Public page
      }
    },
    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: 'Login',
        description: 'Sign in to your account',
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        title: 'Register',
        description: 'Create new account',
        requiresGuest: true
      }
    },
    // Protected routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: 'Dashboard',
        description: 'Overview of your inventory management',
        requiresAuth: true
      }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: ProductsView,
      meta: {
        title: 'Transactions',
        description: 'Manage your inventory transactions',
        requiresAuth: true
      }
    },
    {
      path: '/edit-product/:id',
      name: 'edit-product',
      component: () => import('../views/Auth/ProductDetails.vue'),
      meta: {
        title: 'Edit Product',
        description: 'Edit product details',
        requiresAuth: true
      }
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: SuppliersView,
      meta: {
        title: 'Suppliers',
        description: 'Manage your suppliers',
        requiresAuth: true
      }
    },
    {
      path: '/warehouse',
      name: 'warehouse',
      component: WarehouseView,
      meta: {
        title: 'Warehouse',
        description: 'Manage your warehouse inventory',
        requiresAuth: true
      }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      meta: {
        title: 'Reports',
        description: 'Generate and view reports',
        requiresAuth: true
      }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersVue,
      meta: {
        title: 'Users',
        description: 'Manage users and permissions',
        requiresAuth: true
      }
    }
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || 'Inventaris App'

  // Import auth store dynamically to avoid circular dependency
  const { useAuthStore } = await import('../stores/auth')
  const authStore = useAuthStore()

  // Wait for auth to be initialized (handled by App.vue)
  if (!authStore.isInitialized.value) {
    // If not initialized yet, let it pass and App.vue will handle the loading
    next()
    return
  }

  const isAuthenticated = authStore.isAuthenticated.value
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest

  // Check if route requires authentication
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // Check if route is for guests only (like login/register) but user is authenticated
  else if (requiresGuest && isAuthenticated && ['/login', '/register'].includes(to.path)) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router
