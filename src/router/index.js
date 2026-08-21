// 從 vue-router 引入建立路由實例與 Web 歷史紀錄模式的函式 [cite: 121]
import { createRouter, createWebHistory } from 'vue-router'

// 定義 10 大頁面的路由表 [cite: 121]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // [cite: 121]
  routes: [
    {
      path: '/',
      redirect: '/dashboard' // 預設轉向儀表板 
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'), // 
      meta: { hideLayout: true } // 登入頁全螢幕，不顯示側邊欄 
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue') // [cite: 106, 123]
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue') // [cite: 106, 123]
    },
    {
      path: '/products/new',
      name: 'product-new',
      component: () => import('../views/ProductEditView.vue') // [cite: 106, 123]
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue') // [cite: 107, 124]
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue') // [cite: 107, 124]
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue') // [cite: 107, 124]
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/AnalyticsView.vue') // [cite: 108, 125]
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue') // [cite: 108, 125]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'), // [cite: 108, 126]
      meta: { hideLayout: true } // [cite: 108, 126]
    },
    {
  path: '/logs',
  name: 'logs',
  component: () => import('../views/LogsView.vue'),
  meta: { requiresAuth: true, title: '審計日誌' }
  }
  ]
})

// ==========================================
// 🛡️ 全域路由守衛（求職核心亮點：權限攔截） 
// ==========================================
router.beforeEach((to, from, next) => {
  // 1. 從 localStorage 檢查是否有登入 Token [cite: 141]
  const token = localStorage.getItem('admin_token')

  // 2. 如果使用者「沒有登入」且「即將前往的不是登入頁」
  if (!token && to.path !== '/login') {
    // 強制攔截並轉跳到登入頁
    next('/login')
  } 
  // 3. 如果使用者「已經登入」卻想手動輸入網址回 /login
  else if (token && to.path === '/login') {
    // 直接導向儀表板，避免重複登入
    next('/dashboard')
  } 
  // 4. 其他正常情況直接放行
  else {
    next()
  }
})

export default router // [cite: 108, 126]