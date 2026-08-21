<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProductStore } from '../stores/product'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const productFormRef = ref(null)
const submitting = ref(false)

const productId = computed(() => route.query.id)
const isEditMode = computed(() => !!productId.value)

const form = reactive({
  sku: '',
  name: '',
  category: '線上課程',
  price: 0,
  stock: 10,
  minStock: 5,
  status: true,
  description: '',
  tags: ['Vue3'],
  cover: ''
})

const inputTagVisible = ref(false)
const inputTagValue = ref('')

const rules = {
  sku: [
    { required: true, message: '請輸入商品 SKU 編號', trigger: 'blur' },
    { min: 3, message: 'SKU 長度至少 3 碼', trigger: 'blur' }
  ],
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
    { required: true, message: '請設定目前庫存', trigger: 'blur' },
    { type: 'number', min: 0, message: '庫存不可為負數', trigger: 'blur' }
  ],
  minStock: [
    { required: true, message: '請設定安全庫存警戒值', trigger: 'blur' },
    { type: 'number', min: 0, message: '警戒值不可為負數', trigger: 'blur' }
  ]
}

function resetForm() {
  form.sku = `SKU-${Date.now().toString().slice(-4)}`
  form.name = ''
  form.category = '線上課程'
  form.price = 0
  form.stock = 10
  form.minStock = 5
  form.status = true
  form.description = ''
  form.tags = ['Vue3']
  form.cover = ''
}

function initData() {
  if (isEditMode.value) {
    const existProduct = productStore.getProductById(productId.value)
    if (existProduct) {
      Object.assign(form, JSON.parse(JSON.stringify(existProduct)))
    } else {
      ElMessage.error('找不到該商品，返回列表')
      router.push('/products')
    }
  } else {
    resetForm()
  }
}

watch(() => route.query.id, () => initData(), { immediate: true })

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
      ElMessage.warning('請依照提示修正表單欄位！')
      return
    }

    submitting.value = true
    setTimeout(() => {
      if (isEditMode.value) {
        productStore.updateProduct(productId.value, form)
        ElMessage.success('商品資訊已成功更新！')
      } else {
        productStore.addProduct(form)
        ElMessage.success('全新商品已成功發布！')
      }
      submitting.value = false
      router.push('/products')
    }, 400)
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
      <template #header>
        <div class="page-header">
          <el-button icon="ArrowLeft" link @click="handleCancel">返回列表</el-button>
          <el-divider direction="vertical" />
          <span class="title-text">{{ isEditMode ? `編輯商品 (ID: ${productId})` : '✨ 新增商品' }}</span>
        </div>
      </template>

      <el-form
        ref="productFormRef"
        :model="form"
        :rules="rules"
        label-width="130px"
        class="product-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品 SKU" prop="sku">
              <el-input v-model="form.sku" placeholder="例: SKU-VUE-001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品分類" prop="category">
              <el-select v-model="form.category" placeholder="請選擇分類" style="width: 100%;">
                <el-option label="線上課程" value="線上課程" />
                <el-option label="實體書籍" value="實體書籍" />
                <el-option label="周邊硬體" value="周邊硬體" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品名稱" prop="name">
          <el-input v-model="form.name" placeholder="請輸入商品名稱" maxlength="50" show-word-limit />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="售價 (NT$)" prop="price">
              <el-input-number v-model="form.price" :min="0" :controls="false" :step="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目前庫存" prop="stock">
              <el-input-number v-model="form.stock" :min="0":controls="false"  style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最低庫存警戒" prop="minStock">
              <el-input-number v-model="form.minStock" :min="0" :controls="false" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品狀態">
          <el-switch v-model="form.status" active-text="立即上架" inactive-text="暫存下架" />
        </el-form-item>

        <el-form-item label="商品標籤">
          <div class="tags-wrapper">
            <el-tag
              v-for="tag in form.tags"
              :key="tag"
              closable
              @close="handleCloseTag(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputTagVisible"
              v-model="inputTagValue"
              size="small"
              style="width: 100px;"
              @keyup.enter="handleInputTagConfirm"
              @blur="handleInputTagConfirm"
            />
            <el-button v-else size="small" icon="Plus" @click="showTagInput">新增標籤</el-button>
          </div>
        </el-form-item>

        <el-form-item label="詳細描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="請輸入商品說明..." />
        </el-form-item>

        <el-form-item class="form-actions">
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEditMode ? '儲存修改' : '立即新增' }}
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
  align-items: center;
}
.title-text {
  font-size: 16px;
  font-weight: bold;
}
.tags-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.form-actions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}
</style>