<script setup>
// 引入 Vue 3 響應式工具
import { ref, reactive, computed } from 'vue'
// 引入 Element Plus 提示與對話框
import { ElMessage, ElMessageBox } from 'element-plus'

// 當前選中的狀態頁籤
const activeTab = ref('all')

// 搜尋條件
const filterForm = reactive({
  orderNo: '',
  customer: ''
})

// 分頁控制
const pagination = reactive({
  currentPage: 1,
  pageSize: 5
})

// 訂單狀態定義字典
const ORDER_STATUS = {
  PENDING_PAY: { label: '待付款', type: 'warning', next: 'PAID', actionName: '模擬付款' },
  PAID: { label: '待出貨', type: 'primary', next: 'SHIPPED', actionName: '安排出貨' },
  SHIPPED: { label: '配送中', type: 'info', next: 'COMPLETED', actionName: '確認送達' },
  COMPLETED: { label: '已完成', type: 'success', next: null, actionName: null },
  CANCELLED: { label: '已取消', type: 'danger', next: null, actionName: null }
}

// 模擬訂單原始資料
const orders = ref([
  {
    id: 1,
    orderNo: 'ORD-20260801-01',
    customer: '王小明',
    phone: '0912-345-678',
    address: '台北市信義區信義路五段7號',
    createdAt: '2026-08-01 10:25',
    statusCode: 'PENDING_PAY',
    totalAmount: 3760,
    items: [
      { name: 'Vue 3 高階組件設計手冊', price: 1880, qty: 2 }
    ]
  },
  {
    id: 2,
    orderNo: 'ORD-20260801-02',
    customer: '李大華',
    phone: '0922-888-999',
    address: '新北市板橋區縣民大道二段7號',
    createdAt: '2026-08-01 11:40',
    statusCode: 'PAID',
    totalAmount: 4170,
    items: [
      { name: 'TypeScript 實戰精通密笈', price: 680, qty: 1 },
      { name: '機械式人體工學鍵盤 (青軸)', price: 3490, qty: 1 }
    ]
  },
  {
    id: 3,
    orderNo: 'ORD-20260801-03',
    customer: '張美美',
    phone: '0933-111-222',
    address: '台中市西屯區台灣大道三段99號',
    createdAt: '2026-08-01 14:15',
    statusCode: 'SHIPPED',
    totalAmount: 12900,
    items: [
      { name: '4K IPS 專業級色彩顯示器', price: 12900, qty: 1 }
    ]
  },
  {
    id: 4,
    orderNo: 'ORD-20260801-04',
    customer: '陳志強',
    phone: '0955-666-777',
    address: '高雄市苓雅區四維三路2號',
    createdAt: '2026-08-01 16:50',
    statusCode: 'COMPLETED',
    totalAmount: 2400,
    items: [
      { name: 'Pinia 全域狀態架構實務班', price: 2400, qty: 1 }
    ]
  }
])

// 依據頁籤與搜尋條件計算過濾清單
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // 頁籤過濾
    const matchTab = activeTab.value === 'all' ? true : order.statusCode === activeTab.value
    // 訂單號過濾
    const matchOrderNo = filterForm.orderNo
      ? order.orderNo.toLowerCase().includes(filterForm.orderNo.toLowerCase().trim())
      : true
    // 客戶姓名過濾
    const matchCustomer = filterForm.customer
      ? order.customer.includes(filterForm.customer.trim())
      : true

    return matchTab && matchOrderNo && matchCustomer
  })
})

// 分頁切片運算
const paginatedOrders = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredOrders.value.slice(start, start + pagination.pageSize)
})

// 處理狀態流轉
function handleNextStep(order) {
  const currentConfig = ORDER_STATUS[order.statusCode]
  if (!currentConfig || !currentConfig.next) return

  ElMessageBox.confirm(
    `確認要將訂單「${order.orderNo}」推進至【${ORDER_STATUS[currentConfig.next].label}】狀態嗎？`,
    '訂單狀態流轉',
    {
      confirmButtonText: '確認推進',
      cancelButtonText: '取消',
      type: 'primary'
    }
  ).then(() => {
    order.statusCode = currentConfig.next
    ElMessage.success(`訂單狀態已更新為：${ORDER_STATUS[order.statusCode].label}`)
  }).catch(() => {})
}

// 處理取消訂單
function handleCancelOrder(order) {
  ElMessageBox.confirm(
    `確定要取消訂單「${order.orderNo}」嗎？`,
    '警告',
    {
      confirmButtonText: '確定取消',
      cancelButtonText: '返回',
      type: 'warning'
    }
  ).then(() => {
    order.statusCode = 'CANCELLED'
    ElMessage.info('訂單已取消')
  }).catch(() => {})
}

// 重設篩選
function handleResetFilter() {
  filterForm.orderNo = ''
  filterForm.customer = ''
  pagination.currentPage = 1
}
</script>

<template>
  <div class="orders-page">
    <!-- 頂部篩選卡片 -->
    <el-card shadow="never" class="box-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="訂單編號">
          <el-input v-model="filterForm.orderNo" placeholder="請輸入訂單號" clearable />
        </el-form-item>
        <el-form-item label="購買人姓名">
          <el-input v-model="filterForm.customer" placeholder="請輸入姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="pagination.currentPage = 1">搜尋</el-button>
          <el-button icon="Refresh" @click="handleResetFilter">重設</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 訂單列表與頁籤 -->
    <el-card shadow="never" class="box-card">
      <el-tabs v-model="activeTab" @tab-change="pagination.currentPage = 1">
        <el-tab-pane label="全部訂單" name="all" />
        <el-tab-pane label="待付款" name="PENDING_PAY" />
        <el-tab-pane label="待出貨" name="PAID" />
        <el-tab-pane label="配送中" name="SHIPPED" />
        <el-tab-pane label="已完成" name="COMPLETED" />
        <el-tab-pane label="已取消" name="CANCELLED" />
      </el-tabs>

      <el-table :data="paginatedOrders" stripe border style="width: 100%">
        <!-- 巢狀可展開內容 Slot -->
        <el-table-column type="expand">
          <template #default="props">
            <div class="expand-detail">
              <h4>📦 訂單明細清單</h4>
              <el-table :data="props.row.items" size="small" border style="margin-bottom: 12px;">
                <el-table-column prop="name" label="商品名稱" />
                <el-table-column prop="price" label="單價" width="120" align="right">
                  <template #default="itemScope">
                    NT$ {{ itemScope.row.price.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="qty" label="數量" width="100" align="center" />
                <el-table-column label="小計" width="120" align="right">
                  <template #default="itemScope">
                    NT$ {{ (itemScope.row.price * itemScope.row.qty).toLocaleString() }}
                  </template>
                </el-table-column>
              </el-table>

              <div class="shipping-info">
                <p><strong>收件電話：</strong>{{ props.row.phone }}</p>
                <p><strong>配送地址：</strong>{{ props.row.address }}</p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="orderNo" label="訂單編號" min-width="160" />
        <el-table-column prop="customer" label="購買客戶" width="120" align="center" />
        <el-table-column prop="createdAt" label="下單時間" width="170" align="center" />

        <el-table-column label="總金額" width="130" align="right">
          <template #default="scope">
            <span class="price-text">NT$ {{ scope.row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column label="當前狀態" width="110" align="center">
          <template #default="scope">
            <el-tag :type="ORDER_STATUS[scope.row.statusCode].type">
              {{ ORDER_STATUS[scope.row.statusCode].label }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 狀態流轉操作 -->
        <el-table-column label="狀態操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button
              v-if="ORDER_STATUS[scope.row.statusCode].next"
              size="small"
              type="primary"
              @click="handleNextStep(scope.row)"
            >
              {{ ORDER_STATUS[scope.row.statusCode].actionName }}
            </el-button>
            <el-button
              v-if="scope.row.statusCode === 'PENDING_PAY'"
              size="small"
              type="danger"
              link
              @click="handleCancelOrder(scope.row)"
            >
              取消
            </el-button>
            <span v-if="!ORDER_STATUS[scope.row.statusCode].next" class="completed-text">流程已結束</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="filteredOrders.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.orders-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.box-card {
  border-radius: 8px;
}
.price-text {
  font-weight: bold;
  color: #f56c6c;
}
.expand-detail {
  padding: 10px 20px;
  background-color: #fafafa;
}
.expand-detail h4 {
  margin: 0 0 10px 0;
  color: #303133;
}
.shipping-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}
.completed-text {
  font-size: 12px;
  color: #909399;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>