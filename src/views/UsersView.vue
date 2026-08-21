<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 1. RBAC 角色字典配置
const ROLES = {
  ADMIN: { label: '超級管理員', tagType: 'danger', desc: '擁有系統所有操作權限' },
  EDITOR: { label: '運營小編', tagType: 'primary', desc: '可編輯商品與處理訂單' },
  VIEWER: { label: '唯讀訪客', tagType: 'info', desc: '僅能查看數據報表' }
}

// 模擬目前登入者的角色（實務中由 Pinia 全域 Store 提供）
const currentUserRole = ref('ADMIN')

// 搜尋條件
const filterForm = reactive({
  keyword: '',
  role: ''
})

// 分頁控制
const pagination = reactive({
  currentPage: 1,
  pageSize: 5
})

// 使用者列表資料
const userList = ref([
  {
    id: 1,
    username: 'admin',
    name: '系統主管',
    email: 'admin@company.com',
    role: 'ADMIN',
    status: true,
    lastLogin: '2026-08-21 14:30'
  },
  {
    id: 2,
    username: 'editor_amy',
    name: '艾咪',
    email: 'amy@company.com',
    role: 'EDITOR',
    status: true,
    lastLogin: '2026-08-20 09:15'
  },
  {
    id: 3,
    username: 'editor_bob',
    name: '鮑伯',
    email: 'bob@company.com',
    role: 'EDITOR',
    status: false,
    lastLogin: '2026-08-15 18:22'
  },
  {
    id: 4,
    username: 'guest_user',
    name: '實習生小張',
    email: 'intern@company.com',
    role: 'VIEWER',
    status: true,
    lastLogin: '2026-08-21 11:05'
  }
])

// 計算屬性：多條件過濾
const filteredUsers = computed(() => {
  return userList.value.filter(user => {
    const matchKeyword = filterForm.keyword
      ? (user.username.toLowerCase().includes(filterForm.keyword.toLowerCase().trim()) ||
         user.name.includes(filterForm.keyword.trim()) ||
         user.email.toLowerCase().includes(filterForm.keyword.toLowerCase().trim()))
      : true

    const matchRole = filterForm.role ? user.role === filterForm.role : true

    return matchKeyword && matchRole
  })
})

// 分頁切片
const displayedUsers = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredUsers.value.slice(start, start + pagination.pageSize)
})

// 彈窗控制與表單資料
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' | 'edit'
const formRef = ref(null)

const userForm = reactive({
  id: null,
  username: '',
  name: '',
  email: '',
  role: 'VIEWER',
  status: true
})

const formRules = {
  username: [
    { required: true, message: '請輸入登入帳號', trigger: 'blur' },
    { min: 4, max: 20, message: '長度需在 4 到 20 個字元之間', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入使用者姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的 Email 格式', trigger: ['blur', 'change'] }
  ],
  role: [
    { required: true, message: '請指派角色權限', trigger: 'change' }
  ]
}

// 打開新增彈窗
function openAddDialog() {
  dialogType.value = 'add'
  userForm.id = null
  userForm.username = ''
  userForm.name = ''
  userForm.email = ''
  userForm.role = 'VIEWER'
  userForm.status = true
  dialogVisible.value = true
}

// 打開編輯彈窗
function openEditDialog(row) {
  dialogType.value = 'edit'
  Object.assign(userForm, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

// 提交表單
function handleSaveUser() {
  formRef.value.validate(valid => {
    if (!valid) return

    if (dialogType.value === 'add') {
      const newId = userList.value.length > 0 ? Math.max(...userList.value.map(u => u.id)) + 1 : 1
      userList.value.unshift({
        ...userForm,
        id: newId,
        lastLogin: '尚未登入'
      })
      ElMessage.success('成功新增使用者！')
    } else {
      const index = userList.value.findIndex(u => u.id === userForm.id)
      if (index !== -1) {
        userList.value[index] = { ...userList.value[index], ...userForm }
        ElMessage.success('使用者資訊已更新！')
      }
    }
    dialogVisible.value = false
  })
}

// 狀態切換
function handleStatusChange(row) {
  ElMessage.success(`使用者 [${row.name}] 帳號狀態已切換為：${row.status ? '正常啟用' : '已凍結'}`)
}

// 重設密碼
function handleResetPassword(row) {
  ElMessageBox.confirm(
    `確定要將使用者「${row.name}」的密碼重設為預設密碼「Password123!」嗎？`,
    '安全操作',
    {
      confirmButtonText: '確定重設',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`密碼重設通知信已發送至 ${row.email}`)
  }).catch(() => {})
}

// 刪除使用者
function handleDeleteUser(row) {
  if (row.role === 'ADMIN') {
    ElMessage.error('禁止刪除超級管理員帳號！')
    return
  }

  ElMessageBox.confirm(
    `確定要刪除使用者「${row.name}」嗎？此操作不可還原！`,
    '高風險操作',
    {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    userList.value = userList.value.filter(u => u.id !== row.id)
    ElMessage.success('使用者已刪除')
  }).catch(() => {})
}

function handleResetFilter() {
  filterForm.keyword = ''
  filterForm.role = ''
  pagination.currentPage = 1
}
</script>

<template>
  <div class="users-page">
    <!-- 頂部篩選卡片 -->
    <el-card shadow="never" class="box-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="關鍵字">
          <el-input v-model="filterForm.keyword" placeholder="搜尋帳號 / 姓名 / Email" clearable />
        </el-form-item>

        <el-form-item label="角色權限">
          <el-select v-model="filterForm.role" placeholder="全部角色" clearable style="width: 140px;">
            <el-option v-for="(cfg, key) in ROLES" :key="key" :label="cfg.label" :value="key" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="pagination.currentPage = 1">查詢</el-button>
          <el-button icon="Refresh" @click="handleResetFilter">重設</el-button>
        </el-form-item>
      </el-form>

      <div class="action-bar">
        <el-button type="primary" icon="Plus" @click="openAddDialog">新增成員</el-button>
      </div>
    </el-card>

    <!-- 使用者列表表格 -->
    <el-card shadow="never" class="box-card">
      <el-table :data="displayedUsers" stripe border style="width: 100%">
        <el-table-column prop="id" label="UID" width="70" align="center" />
        <el-table-column prop="username" label="帳號名稱" min-width="130" />
        <el-table-column prop="name" label="真實姓名" width="120" align="center" />
        <el-table-column prop="email" label="電子信箱" min-width="180" />

        <!-- 角色標籤 -->
        <el-table-column label="角色權限" width="130" align="center">
          <template #default="scope">
            <el-tag :type="ROLES[scope.row.role].tagType" effect="light">
              {{ ROLES[scope.row.role].label }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 帳號啟用/凍結開關 -->
        <el-table-column label="帳號狀態" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :disabled="scope.row.role === 'ADMIN'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="lastLogin" label="最後登入時間" width="170" align="center" />

        <!-- 操作欄位 -->
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="openEditDialog(scope.row)">編輯</el-button>
            <el-button size="small" type="warning" link @click="handleResetPassword(scope.row)">重設密碼</el-button>
            <el-button
              size="small"
              type="danger"
              link
              :disabled="scope.row.role === 'ADMIN'"
              @click="handleDeleteUser(scope.row)"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="filteredUsers.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <!-- 新增 / 編輯成員彈窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增系統成員' : '編輯成員資訊'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="userForm" :rules="formRules" label-width="100px">
        <el-form-item label="登入帳號" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'" placeholder="例: alex_chen" />
        </el-form-item>

        <el-form-item label="真實姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="請輸入姓名" />
        </el-form-item>

        <el-form-item label="電子信箱" prop="email">
          <el-input v-model="userForm.email" placeholder="name@company.com" />
        </el-form-item>

        <el-form-item label="指派角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%;">
            <el-option
              v-for="(cfg, key) in ROLES"
              :key="key"
              :label="`${cfg.label} - ${cfg.desc}`"
              :value="key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="帳號啟用">
          <el-switch v-model="userForm.status" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveUser">儲存送出</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.box-card {
  border-radius: 8px;
}
.action-bar {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ebeef5;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>