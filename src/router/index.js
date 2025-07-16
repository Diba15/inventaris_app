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
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
    },
    {
      path: '/edit-product/:id',
      name: 'edit-product',
      component: () => import('../views/Auth/ProductDetails.vue'),
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: SuppliersView,
    },
    {
      path: '/warehouse',
      name: 'warehouse',
      component: WarehouseView,
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
    },
    {
      path: '/users',
      name: 'users',
      component: UsersVue,
    }
  ],
})

export default router
