<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 1. 偏好設定狀態（讀取或給予預設值）
const preferences = reactive({
  isDarkMode: false,
  enableEmailNotice: true,
  enableStockAlertNotice: true,
  tableDenseMode: false,
  language: 'zh-TW'
})

// 2. 安全性密碼表單
const pwdFormRef = ref(null)
const pwdSubmitting = ref(false)

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 自訂密碼驗證規則
const validateNewPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請輸入新密碼'))
  } else if (value.length < 8) {
    callback(new Error('密碼長度至少需要 8 個字元'))
  } else if (value === pwdForm.oldPassword) {
    callback(new Error('新密碼不能與當前舊密碼相同！'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請再次輸入新密碼'))
  } else if (value !== pwdForm.newPassword) {
    callback(new Error('兩次輸入的新密碼不一致！'))
  } else {
    callback()
  }
}

const pwdRules = {
  oldPassword: [
    { required: true, message: '請輸入目前的舊密碼', trigger: 'blur' }
  ],
  newPassword: [
    { validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 切換深色/淺色主題
function handleThemeChange(val) {
  if (val) {
    document.documentElement.classList.add('dark')
    ElMessage.success('已切換為暗色模式 (Dark Mode)')
  } else {
    document.documentElement.classList.remove('dark')
    ElMessage.info('已切換為明亮模式 (Light Mode)')
  }
}

// 儲存偏好設定
function handleSavePreferences() {
  localStorage.setItem('vue_admin_pref', JSON.stringify(preferences))
  ElMessage.success('系統偏好設定已儲存並生效！')
}

// 提交密碼修改
function handleChangePassword() {
  pwdFormRef.value.validate((valid) => {
    if (!valid) return

    pwdSubmitting.value = true
    setTimeout(() => {
      pwdSubmitting.value = false
      ElMessage.success('密碼修改成功！下次登入時請使用新密碼。')
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
      pwdFormRef.value.resetFields()
    }, 600)
  })
}

// 清除快取並重置儲存空間
function handleClearCache() {
  ElMessageBox.confirm(
    '清除快取將會重置本地商品庫存、偏好設定等暫存資料，確定要清理嗎？',
    '危險操作提示',
    {
      confirmButtonText: '確定清理',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    localStorage.removeItem('vue_admin_products')
    localStorage.removeItem('vue_admin_pref')
    ElMessage.success('全站本地快取已順利清除，將於 1 秒後重新整理頁面...')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }).catch(() => {})
}
</script>

<template>
  <div class="settings-page">
    <el-row :gutter="16">
      <!-- 左側：偏好設定 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="box-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 介面與通知偏好</span>
            </div>
          </template>

          <el-form label-position="left" label-width="160px">
            <el-form-item label="暗黑模式 (Dark Mode)">
              <el-switch v-model="preferences.isDarkMode" @change="handleThemeChange" />
            </el-form-item>

            <el-form-item label="庫存預警通知">
              <el-switch v-model="preferences.enableStockAlertNotice" />
            </el-form-item>

            <el-form-item label="新訂單郵件通知">
              <el-switch v-model="preferences.enableEmailNotice" />
            </el-form-item>

            <el-form-item label="表格緊湊排版">
              <el-switch v-model="preferences.tableDenseMode" />
            </el-form-item>

            <el-form-item label="後台語系切換">
              <el-select v-model="preferences.language" style="width: 140px;">
                <el-option label="繁體中文" value="zh-TW" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSavePreferences">儲存偏好設定</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右側：帳號安全性與快取清理 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="box-card">
          <template #header>
            <div class="card-header">
              <span>🔒 帳號安全與快取管理</span>
            </div>
          </template>

          <el-form
            ref="pwdFormRef"
            :model="pwdForm"
            :rules="pwdRules"
            label-position="top"
          >
            <el-form-item label="目前舊密碼" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="請輸入舊密碼" />
            </el-form-item>

            <el-form-item label="設定新密碼" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="至少 8 碼且不可與舊密碼相同" />
            </el-form-item>

            <el-form-item label="再次確認新密碼" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="請再次輸入新密碼" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="pwdSubmitting" @click="handleChangePassword">
                更新密碼
              </el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <!-- 本地快取清理區塊 -->
          <div class="danger-zone">
            <div>
              <h4 class="danger-title">清理系統快取</h4>
              <p class="danger-desc">重置瀏覽器中所有暫存的商品資料與使用者偏好設定。</p>
            </div>
            <el-button type="danger" plain @click="handleClearCache">清除快取</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.box-card {
  border-radius: 8px;
  margin-bottom: 16px;
}
.card-header {
  font-weight: bold;
  font-size: 15px;
}
.danger-zone {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #fef0f0;
  border-radius: 6px;
  border: 1px solid #fde2e2;
}
.danger-title {
  margin: 0;
  font-size: 14px;
  color: #f56c6c;
}
.danger-desc {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #909399;
}
</style>