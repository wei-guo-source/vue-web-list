<script setup>
// 從 vue 引入 computed 計算屬性
import { computed } from 'vue'

// 從 vue-router 引入 useRoute（取得當前網址資訊）與 useRouter（執行頁面跳轉）
import { useRoute, useRouter } from 'vue-router'

// 取得當前活躍的路由物件（包含當前 path、meta 等）
const route = useRoute()

// 取得全域路由器實例，用來呼叫 push、replace 等跳轉方法
const router = useRouter()

// 定義計算屬性：判斷當前頁面是否設定了 hideLayout，若是則全螢幕呈現（例如 Login 或 404）
const isFullscreenPage = computed(() => route.meta.hideLayout)

// 處理點擊登出按鈕的函式
function handleLogout() {
  // 1. 清除登入憑證與使用者資料
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')

  // 2. 跳轉回登入頁 [cite: 109, 126]
  router.push('/login') // [cite: 109, 126]
}
</script>

<template>
  <div v-if="isFullscreenPage">
    <RouterView />
  </div>

  <el-container v-else class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">🚀 Vue Admin Pro</div>

      <el-menu
        :default-active="route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>主控總覽</span>
        </el-menu-item>

        <el-sub-menu index="products-menu">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/products">商品列表</el-menu-item>
          <el-menu-item index="/products/new">新增商品</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <span>訂單管理</span>
        </el-menu-item>

        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>會員權限</span>
        </el-menu-item>

        <el-menu-item index="/analytics">
          <el-icon><TrendCharts /></el-icon>
          <span>數據分析</span>
        </el-menu-item>

        <el-menu-item index="/notifications">
          <el-icon><Bell /></el-icon>
          <span>通知中心</span>
        </el-menu-item>

        <el-menu-item index="/profile">
          <el-icon><Setting /></el-icon>
          <span>個人設定</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span>後台管理系統</span>
        </div>
        <div class="header-right">
          <el-button type="danger" size="small" @click="handleLogout">登出</el-button>
        </div>
      </el-header>

      <el-main class="main-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
/* 全域基本樣式重設，撐滿瀏覽器高度並消除邊距 */
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* 外層容器撐滿視窗 100vh 高度 */
.layout-container {
  height: 100vh;
}

/* 側邊欄深藍色背景 */
.aside {
  background-color: #304156;
}

/* 側邊欄上方 Logo 區塊樣式 */
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #263445;
}

/* 頂部 Header 白色背景與邊框排版 */
.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* 中間主內容區塊淺灰底色，留內邊距 */
.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>