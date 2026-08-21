<script setup>
// 引入響應式工具
import { ref, reactive } from 'vue'
// 引入路由跳轉工具
import { useRouter } from 'vue-router'
// 引入 Element Plus 提示訊息元件
import { ElMessage } from 'element-plus'

// 初始化路由器
const router = useRouter()

// 取得表單元件的引用 (用來執行驗證)
const loginFormRef = ref(null)

// 登入按鈕的 Loading 動畫狀態
const loading = ref(false)

// 表單輸入資料綁定
const loginForm = reactive({
  username: 'admin',      // 預設填入測試帳號
  password: 'password123' // 預設填入測試密碼
})

// 表單驗證規則
const loginRules = {
  username: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { min: 3, max: 20, message: '帳號長度需為 3~20 個字元', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能少於 6 位', trigger: 'blur' }
  ]
}

// 登入送出處理函式
function handleLogin() {
  loginFormRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.warning('請依照提示填寫完整！')
      return
    }

    loading.value = true

    // 模擬後端驗證延遲 1 秒
    setTimeout(() => {
      loading.value = false

      if (loginForm.username === 'admin' && loginForm.password === 'password123') {
        localStorage.setItem('admin_token', 'mock_jwt_token_vue_admin')
        localStorage.setItem('admin_user', loginForm.username)
        ElMessage.success('登入成功！正在進入系統...')
        router.push('/dashboard')
      } else {
        ElMessage.error('帳號或密碼錯誤！(預設 admin / password123)')
      }
    }, 1000)
  })
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <div class="login-title">
        <h2>🚀 Vue Admin Pro</h2>
        <p>企業級後台管理系統</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        size="large"
      >
        <el-form-item label="帳號" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="請輸入帳號"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密碼" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            show-password
            placeholder="請輸入密碼"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登入驗證中...' : '立即登入' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="tip-box">
        <el-tag type="info" size="small">測試預設帳號：admin / 密碼：password123</el-tag>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #2b4b6b 0%, #1f2d3d 100%);
}
.login-card {
  width: 420px;
  padding: 20px 10px;
  border-radius: 12px;
}
.login-title {
  text-align: center;
  margin-bottom: 25px;
}
.login-title h2 {
  margin: 0;
  color: #303133;
  font-weight: bold;
}
.login-title p {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 14px;
}
.submit-btn {
  width: 100%;
  margin-top: 10px;
  font-weight: bold;
}
.tip-box {
  text-align: center;
  margin-top: 10px;
}
</style>