<script setup>
// 引入 Vue 3 核心 API（加入 watch 監聽路由參數變化）
import { ref, reactive, onMounted, computed, watch } from 'vue'
// 引入路由工具
import { useRoute, useRouter } from 'vue-router'
// 引入 Element Plus 提示與確認框
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const productFormRef = ref(null)
const submitting = ref(false)

// 判斷當前是「編輯模式」還是「新增模式」
const productId = computed(() => route.query.id)
const isEditMode = computed(() => !!productId.value)

// 表單資料模型
const form = reactive({
  name: '',
  category: '線上課程',
  price: 0,
  stock: 0,
  status: true,
  description: '',
  tags: [],
  coverUrl: ''
})

// 重設表單為空白（供「新增模式」使用）
function resetForm() {
  form.name = ''
  form.category = '線上課程'
  form.price = 0
  form.stock = 0
  form.status = true
  form.description = ''
  form.tags = ['Vue3']
  form.coverUrl = ''
}

// 模擬後端資料庫（依照不同 ID 回傳不同資料）
const mockDatabase = {
  '101': {
    name: 'Vue 3 高階組件設計手冊',
    category: '線上課程',
    price: 1880,
    stock: 99,
    status: true,
    description: '深入剖析 Composition API 與響應式底層原理，邁向資深架構師必讀。',
    tags: ['Vue3', '高階架構', '熱門推薦'],
    coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300'
  },
  '102': {
    name: 'TypeScript 實戰精通密笈',
    category: '實體書籍',
    price: 680,
    stock: 12,
    status: true,
    description: '從型別推導到泛型進階，全面掌握大型前端專案型別安全。',
    tags: ['TypeScript', '暢銷書'],
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=300'
  },
  '103': {
    name: '機械式人體工學鍵盤 (青軸)',
    category: '周邊硬體',
    price: 3490,
    stock: 5,
    status: false,
    description: '工程師長時間打字必備，段落感強烈，極致舒適手感。',
    tags: ['硬體', '人體工學'],
    coverUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300'
  },
  '104': {
    name: '4K IPS 專業級色彩顯示器',
    category: '周邊硬體',
    price: 12900,
    stock: 0,
    status: false,
    description: '99% sRGB 廣色域，精準色彩呈現，多工切割螢幕首選。',
    tags: ['螢幕', '4K'],
    coverUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300'
  },
  '105': {
    name: 'Pinia 全域狀態架構實務班',
    category: '線上課程',
    price: 2400,
    stock: 150,
    status: true,
    description: '擺脫 Vuex 複雜語法，現代化 Pinia Store 模組化設計實戰。',
    tags: ['Pinia', '線上課'],
    coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'
  },
  '106': {
    name: 'Vite 高速打包工程化指引',
    category: '實體書籍',
    price: 520,
    stock: 38,
    status: true,
    description: '秒級熱重載 HMR 原理解析與 Rollup 打包優化秘笈。',
    tags: ['Vite', '前端工程化'],
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300'
  }
}

// 根據 ID 動態載入對應商品資料
function loadProductDetail(id) {
  const product = mockDatabase[String(id)]
  if (product) {
    // 使用 Object.assign 將找到的商品屬性複製到 form 物件
    Object.assign(form, product)
    ElMessage.info(`已載入商品 [ID: ${id}] 資料`)
  } else {
    ElMessage.warning(`查無 ID 為 ${id} 的商品資料`)
  }
}

// 初始化檢查
function initView() {
  if (isEditMode.value) {
    loadProductDetail(productId.value)
  } else {
    resetForm()
  }
}

// 💡 關鍵：使用 watch 監聽 route.query.id
// 當使用者在「新增商品」與「編輯商品」之間切換時，動態刷新表單內容
watch(
  () => route.query.id,
  () => {
    initView()
  },
  { immediate: true }
)

// 動態標籤輸入控制
const inputTagVisible = ref(false)
const inputTagValue = ref('')

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入商品名稱', trigger: 'blur' },
    { min: 3, max: 50, message: '長度需在 3 到 50 個字元之間', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '請選擇商品類別', trigger: 'change' }
  ],
  price: [
    { required: true, message: '請設定商品售價', trigger: 'blur' },
    { type: 'number', min: 1, message: '售價金額必須大於 0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '請設定庫存數量', trigger: 'blur' },
    { type: 'number', min: 0, message: '庫存不能為負數', trigger: 'blur' }
  ]
}

function handleCloseTag(tag) {
  form.tags.splice(form.tags.indexOf(tag), 1)
}

function handleInputTagConfirm() {
  if (inputTagValue.value.trim()) {
    form.tags.push(inputTagValue.value.trim())
  }
  inputTagVisible.value = false
  inputTagValue.value = ''
}

function showTagInput() {
  inputTagVisible.value = true
}

function handleSubmit() {
  productFormRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.warning('表單內容有誤，請依照紅字提示修正！')
      return
    }

    submitting.value = true
    setTimeout(() => {
      submitting.value = false
      ElMessage.success(isEditMode.value ? `商品 [ID: ${productId.value}] 修改成功！` : '商品新增成功！')
      router.push('/products')
    }, 600)
  })
}

function handleCancel() {
  ElMessageBox.confirm('尚未儲存的內容將會遺失，確定要離開嗎？', '提示', {
    confirmButtonText: '確定離開',
    cancelButtonText: '繼續編輯',
    type: 'warning'
  }).then(() => {
    router.push('/products')
  }).catch(() => {})
}
</script>

<template>
  <div class="edit-page">
    <el-card shadow="never" class="form-card">
      <!-- 頂部頁面標題與返回按鈕 -->
      <template #header>
        <div class="page-header">
          <div class="header-title">
            <el-button icon="ArrowLeft" link @click="handleCancel">返回列表</el-button>
            <el-divider direction="vertical" />
            <span class="title-text">{{ isEditMode ? `編輯商品 (ID: ${productId})` : '✨ 新增商品' }}</span>
          </div>
        </div>
      </template>

      <!-- 核心表單元件 -->
      <el-form
        ref="productFormRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="product-form"
      >
        <!-- 商品名稱 -->
        <el-form-item label="商品名稱" prop="name">
          <el-input v-model="form.name" placeholder="請輸入商品名稱" maxlength="50" show-word-limit />
        </el-form-item>

        <!-- 商品分類與上架狀態 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品分類" prop="category">
              <el-select v-model="form.category" placeholder="請選擇分類" style="width: 100%;">
                <el-option label="線上課程" value="線上課程" />
                <el-option label="實體書籍" value="實體書籍" />
                <el-option label="周邊硬體" value="周邊硬體" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上架狀態">
              <el-switch v-model="form.status" active-text="立即上架" inactive-text="暫存下架" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 售價與庫存數量 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="售價 (NT$)" prop="price">
              <el-input-number v-model="form.price" :min="0" :step="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="庫存數量" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 動態商品標籤（Tag 增刪） -->
        <el-form-item label="商品標籤">
          <div class="tags-wrapper">
            <el-tag
              v-for="tag in form.tags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="handleCloseTag(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputTagVisible"
              ref="InputRef"
              v-model="inputTagValue"
              size="small"
              style="width: 100px;"
              @keyup.enter="handleInputTagConfirm"
              @blur="handleInputTagConfirm"
            />
            <el-button v-else size="small" icon="Plus" @click="showTagInput">新增標籤</el-button>
          </div>
        </el-form-item>

        <!-- 商品描述 -->
        <el-form-item label="詳細描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="請輸入商品的特色介紹、規格或售後說明..."
          />
        </el-form-item>

        <!-- 表單操作按鈕區 -->
        <el-form-item class="form-actions">
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEditMode ? '儲存變更' : '確認發布商品' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.edit-page {
  max-width: 900px;
  margin: 0 auto;
}
.form-card {
  border-radius: 8px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  display: flex;
  align-items: center;
}
.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
.product-form {
  margin-top: 15px;
}
.tags-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.form-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>