<script setup>
// 引入 Vue 3 核心響應式 API
import { ref, reactive, computed } from 'vue'
// 引入 Element Plus 提示與對話框元件
import { ElMessage, ElMessageBox } from 'element-plus'
// 引入路由實例用於跳轉新增頁面
import { useRouter } from 'vue-router'

const router = useRouter()

// ==========================================
// 1. 響應式狀態定義
// ==========================================
// 載入中狀態（模擬 API 請求）
const loading = ref(false)

// 搜尋與篩選條件表單
const queryForm = reactive({
  keyword: '',
  category: '',
  status: ''
})

// 分頁控制參數
const pagination = reactive({
  currentPage: 1,
  pageSize: 5
})

// 被勾選的多選項目陣列
const selectedRows = ref([])

// ==========================================
// 2. 原始商品資料清單（模擬後端資料庫回傳）
// ==========================================
const productList = ref([
  {
    id: 101,
    name: 'Vue 3 高階組件設計手冊',
    category: '線上課程',
    price: 1880,
    stock: 99,
    status: true,
    cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'
  },
  {
    id: 102,
    name: 'TypeScript 實戰精通密笈',
    category: '實體書籍',
    price: 680,
    stock: 12,
    status: true,
    cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=100'
  },
  {
    id: 103,
    name: '機械式人體工學鍵盤 (青軸)',
    category: '周邊硬體',
    price: 3490,
    stock: 5,
    status: false,
    cover: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100'
  },
  {
    id: 104,
    name: '4K IPS 專業級色彩顯示器',
    category: '周邊硬體',
    price: 12900,
    stock: 0,
    status: false,
    cover: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100'
  },
  {
    id: 105,
    name: 'Pinia 全域狀態架構實務班',
    category: '線上課程',
    price: 2400,
    stock: 150,
    status: true,
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'
  },
  {
    id: 106,
    name: 'Vite 高速打包工程化指引',
    category: '實體書籍',
    price: 520,
    stock: 38,
    status: true,
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100'
  }
])

// ==========================================
// 3. 計算屬性：多條件篩選與分頁切片運算
// ==========================================
// 先依據關鍵字、分類、狀態進行過濾
const filteredProducts = computed(() => {
  return productList.value.filter(item => {
    // 關鍵字搜尋（比對名稱）
    const matchKeyword = queryForm.keyword
      ? item.name.toLowerCase().includes(queryForm.keyword.toLowerCase().trim())
      : true

    // 分類篩選
    const matchCategory = queryForm.category
      ? item.category === queryForm.category
      : true

    // 狀態篩選
    const matchStatus = queryForm.status !== ''
      ? item.status === (queryForm.status === 'active')
      : true

    return matchKeyword && matchCategory && matchStatus
  })
})

// 再將過濾後的結果依照當前頁碼進行分頁切片（Pagination Slice）
const displayedProducts = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredProducts.value.slice(start, end)
})

// ==========================================
// 4. 事件處理方法
// ==========================================
// 搜尋重設
function handleReset() {
  queryForm.keyword = ''
  queryForm.category = ''
  queryForm.status = ''
  pagination.currentPage = 1
  ElMessage.info('篩選條件已重設')
}

// 表格勾選項目變更
function handleSelectionChange(rows) {
  selectedRows.value = rows
}

// 單一商品上架狀態切換
function handleStatusChange(row) {
  ElMessage.success(`商品 [${row.name}] 狀態已更新為：${row.status ? '上架中' : '已下架'}`)
}

// 單一刪除
function handleDelete(row) {
  ElMessageBox.confirm(
    `確定要刪除商品「${row.name}」嗎？此操作不可逆！`,
    '安全警告',
    {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    productList.value = productList.value.filter(item => item.id !== row.id)
    ElMessage.success('商品刪除成功')
  }).catch(() => {
    ElMessage.info('已取消刪除')
  })
}

// 批次刪除多個已勾選商品
function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('請先勾選要刪除的商品！')
    return
  }

  ElMessageBox.confirm(
    `確定要批次刪除選中的 ${selectedRows.value.length} 筆商品嗎？`,
    '批次操作確認',
    {
      confirmButtonText: '批次刪除',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    const selectedIds = selectedRows.value.map(item => item.id)
    productList.value = productList.value.filter(item => !selectedIds.includes(item.id))
    selectedRows.value = []
    ElMessage.success('批次刪除成功！')
  }).catch(() => {})
}

// 跳轉到新增商品頁
function goToAddProduct() {
  router.push('/products/new')
}

// 跳轉到編輯商品頁（帶入 query 參數 id）
function goToEditProduct(row) {
  router.push({ path: '/products/new', query: { id: row.id } })
}


</script>

<template>
  <div class="product-page">
    <!-- 頂部篩選與操作卡片 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="商品名稱">
          <el-input v-model="queryForm.keyword" placeholder="請輸入關鍵字" clearable />
        </el-form-item>

        <el-form-item label="商品類別">
          <el-select v-model="queryForm.category" placeholder="全部類別" clearable style="width: 140px;">
            <el-option label="線上課程" value="線上課程" />
            <el-option label="實體書籍" value="實體書籍" />
            <el-option label="周邊硬體" value="周邊硬體" />
          </el-select>
        </el-form-item>

        <el-form-item label="上架狀態">
          <el-select v-model="queryForm.status" placeholder="全部狀態" clearable style="width: 120px;">
            <el-option label="上架中" value="active" />
            <el-option label="已下架" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="pagination.currentPage = 1">查詢</el-button>
          <el-button icon="Refresh" @click="handleReset">重設</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按鈕列 -->
      <div class="action-bar">
        <el-button type="primary" icon="Plus" @click="goToAddProduct">新增商品</el-button>
        <el-button
          type="danger"
          icon="Delete"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批次刪除 ({{ selectedRows.length }})
        </el-button>
      </div>
    </el-card>

    <!-- 主要資料表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="displayedProducts"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <!-- 多選勾選框欄位 -->
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <!-- 自訂縮圖 Slot -->
        <el-table-column label="商品封面" width="100" align="center">
          <template #default="scope">
            <el-image
              :src="scope.row.cover"
              fit="cover"
              class="product-thumb"
              :preview-src-list="[scope.row.cover]"
              preview-teleported
            />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="商品名稱" min-width="180" />
        <el-table-column prop="category" label="分類" width="120" align="center">
          <template #default="scope">
            <el-tag effect="plain">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>

        <!-- 金額格式化 -->
        <el-table-column prop="price" label="售價" width="120" align="right">
          <template #default="scope">
            <span class="price-text">NT$ {{ scope.row.price.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <!-- 庫存提示標籤 -->
        <el-table-column prop="stock" label="庫存" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.stock > 10 ? 'success' : (scope.row.stock === 0 ? 'danger' : 'warning')">
              {{ scope.row.stock === 0 ? '缺貨中' : scope.row.stock }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 上架 Switch 開關 -->
        <el-table-column label="狀態" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <!-- 操作欄位 -->
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="goToEditProduct(scope.row)">編輯</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部動態分頁器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20]"
          :total="filteredProducts.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.product-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-card {
  border-radius: 8px;
}
.filter-form {
  margin-bottom: -10px;
}
.action-bar {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ebeef5;
}
.table-card {
  border-radius: 8px;
}
.product-thumb {
  width: 50px;
  height: 50px;
  border-radius: 6px;
}
.price-text {
  font-weight: bold;
  color: #f56c6c;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>