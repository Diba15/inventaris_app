import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '@/views/Auth/DashboardView.vue'
import ProductsView from '@/views/Auth/ProductsView.vue'
import SuppliersView from '@/views/Auth/SuppliersView.vue'
import WarehouseView from '@/views/Auth/WarehouseView.vue'
import ReportsView from '@/views/Auth/ReportsView.vue'
import UsersVue from '@/views/Auth/UsersVue.vue'

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
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: 'About',
        description: 'Learn more about the Inventaris App',
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: 'Dashboard',
        description: 'Overview of your inventory management',
      }
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: {
        title: 'Products',
        description: 'Manage your products efficiently',
      }
    },
    {
      path: '/edit-product/:id',
      name: 'edit-product',
      component: () => import('../views/Auth/ProductDetails.vue'),
      meta: {
        title: 'Edit Product',
        description: 'Edit product details',
      }
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: SuppliersView,
      meta: {
        title: 'Suppliers',
        description: 'Manage your suppliers',
      }
    },
    {
      path: '/warehouse',
      name: 'warehouse',
      component: WarehouseView,
      meta: {
        title: 'Warehouse',
        description: 'Manage your warehouse inventory',
      }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      meta: {
        title: 'Reports',
        description: 'Generate and view reports',
      }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersVue,
      meta: {
        title: 'Users',
        description: 'Manage users and permissions',
      }
    }
  ],
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Inventaris App'
  next()
})

export default router
