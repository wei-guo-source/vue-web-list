<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProductStore } from '../stores/product'

const router = useRouter()
const productStore = useProductStore()

const queryForm = reactive({
  keyword: '',
  category: '',
  status: '',
  stockWarningOnly: false // 僅篩選庫存預警商品
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 5
})

const selectedRows = ref([])

// 多條件篩選（連動 Pinia 資料源）
const filteredProducts = computed(() => {
  return productStore.products.filter(item => {
    const matchKeyword = queryForm.keyword
      ? (item.name.toLowerCase().includes(queryForm.keyword.toLowerCase().trim()) ||
         item.sku.toLowerCase().includes(queryForm.keyword.toLowerCase().trim()))
      : true

    const matchCategory = queryForm.category ? item.category === queryForm.category : true
    const matchStatus = queryForm.status !== '' ? item.status === (queryForm.status === 'active') : true
    const matchWarning = queryForm.stockWarningOnly ? item.stock <= item.minStock : true

    return matchKeyword && matchCategory && matchStatus && matchWarning
  })
})

// 分頁切片
const displayedProducts = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredProducts.value.slice(start, start + pagination.pageSize)
})

function handleReset() {
  queryForm.keyword = ''
  queryForm.category = ''
  queryForm.status = ''
  queryForm.stockWarningOnly = false
  pagination.currentPage = 1
}

function handleSelectionChange(rows) {
  selectedRows.value = rows
}

function handleStatusChange(row) {
  productStore.updateProduct(row.id, { status: row.status })
  ElMessage.success(`商品 [${row.name}] 狀態已更新`)
}

function handleDelete(row) {
  ElMessageBox.confirm(`確定要刪除「${row.name}」嗎？`, '警告', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    productStore.deleteProduct(row.id)
    ElMessage.success('刪除成功')
  }).catch(() => {})
}

function handleBatchDelete() {
  ElMessageBox.confirm(`確定批次刪除 ${selectedRows.value.length} 筆商品？`, '確認', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    const ids = selectedRows.value.map(r => r.id)
    productStore.batchDelete(ids)
    selectedRows.value = []
    ElMessage.success('批次刪除成功')
  }).catch(() => {})
}

function goToEditProduct(row) {
  router.push({ path: '/products/new', query: { id: row.id } })
}

function goToAddProduct() {
  router.push('/products/new')
}
</script>

<template>
  <div class="product-page">
    <!-- 頂部庫存預警通知橫條 -->
    <el-alert
      v-if="productStore.lowStockCount > 0"
      :title="`⚠️ 庫存預警：目前共有 ${productStore.lowStockCount} 項商品低於安全庫存量，請盡快補貨！`"
      type="warning"
      show-icon
      :closable="false"
      class="warning-bar"
    />

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="商品/SKU">
          <el-input v-model="queryForm.keyword" placeholder="搜尋名稱或 SKU" clearable />
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
          <el-checkbox v-model="queryForm.stockWarningOnly" label="僅顯示庫存預警" border />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="pagination.currentPage = 1">查詢</el-button>
          <el-button icon="Refresh" @click="handleReset">重設</el-button>
        </el-form-item>
      </el-form>

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

    <el-card shadow="never" class="table-card">
      <el-table
        :data="displayedProducts"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="sku" label="商品 SKU" width="140" align="center">
          <template #default="scope">
            <el-tag type="info" effect="plain">{{ scope.row.sku }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="商品封面" width="80" align="center">
          <template #default="scope">
            <el-image :src="scope.row.cover" fit="cover" class="product-thumb" />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="商品名稱" min-width="160" />
        <el-table-column prop="category" label="分類" width="110" align="center" />

        <el-table-column prop="price" label="售價" width="110" align="right">
          <template #default="scope">
            <span class="price-text">NT$ {{ Number(scope.row.price).toLocaleString() }}</span>
          </template>
        </el-table-column>

        <!-- 庫存與安全庫存預警欄位 -->
        <el-table-column label="當前 / 最低庫存" width="150" align="center">
          <template #default="scope">
            <div>
              <el-tag :type="scope.row.stock <= scope.row.minStock ? 'danger' : 'success'" size="small">
                {{ scope.row.stock }} 件
              </el-tag>
              <span class="min-stock-hint"> (下限: {{ scope.row.minStock }})</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="狀態" width="90" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="goToEditProduct(scope.row)">編輯</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
.warning-bar {
  border-radius: 6px;
}
.filter-card, .table-card {
  border-radius: 8px;
}
.action-bar {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ebeef5;
}
.product-thumb {
  width: 45px;
  height: 45px;
  border-radius: 6px;
}
.price-text {
  font-weight: bold;
  color: #f56c6c;
}
.min-stock-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>