<script setup>
// 引入響應式資料工具
import { ref } from 'vue'
// 引入路由工具用於按鈕導航跳轉
import { useRouter } from 'vue-router'

const router = useRouter()

// 1. 頂部四大 KPI 指標卡片資料（模擬後端回傳的統計數據）
const statCards = ref([
  { title: '今日營業額', value: '$128,430', change: '+12.5%', isUp: true, icon: 'Umbrella', color: '#67C23A' },
  { title: '新增訂單數', value: '384 筆', change: '+8.2%', isUp: true, icon: 'ShoppingCart', color: '#409EFF' },
  { title: '活躍會員數', value: '1,290 人', change: '-2.4%', isUp: false, icon: 'User', color: '#E6A23C' },
  { title: '待處理售後', value: '12 件', change: '-15.0%', isUp: false, icon: 'Warning', color: '#F56C6C' }
])

// 2. 最新訂單速覽資料
const recentOrders = ref([
  { orderNo: 'ORD-20260801', customer: '王小明', amount: '$3,200', status: '已付款', statusType: 'success' },
  { orderNo: 'ORD-20260802', customer: '李大華', amount: '$1,580', status: '待出貨', statusType: 'warning' },
  { orderNo: 'ORD-20260803', customer: '張美美', amount: '$8,900', status: '處理中', statusType: 'primary' },
  { orderNo: 'ORD-20260804', customer: '陳志強', amount: '$650', status: '已取消', statusType: 'info' }
])

// 3. 系統即時動態時間軸
const activities = ref([
  { content: '管理員 (admin) 登入了系統', timestamp: '10 分鐘前', type: 'primary' },
  { content: '使用者 王小明 完成了訂單 ORD-20260801 付款', timestamp: '25 分鐘前', type: 'success' },
  { content: '系統自動備份資料庫完成 (PostgreSQL)', timestamp: '1 小時前', type: 'info' },
  { content: '庫存預警：商品 [Vue3 實戰手冊] 低於安全庫存', timestamp: '2 小時前', type: 'warning' }
])

// 頁面跳轉快捷方法
function goTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-header">
      <h2>👋 歡迎回來，系統管理員</h2>
      <p>這是您今日的營運數據與系統狀態總覽</p>
    </div>

    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-text">
              <span class="stat-title">{{ item.title }}</span>
              <h3 class="stat-value">{{ item.value }}</h3>
              <span class="stat-change" :class="{ 'up': item.isUp, 'down': !item.isUp }">
                {{ item.change }} 較昨日
              </span>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <el-icon size="28" color="#fff">
                <component :is="item.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-row">
      <el-col :xs="24" :lg="16">
        <el-card class="content-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>📦 最新訂單速覽</span>
              <el-button link type="primary" @click="goTo('/orders')">查看全部</el-button>
            </div>
          </template>

          <el-table :data="recentOrders" stripe style="width: 100%">
            <el-table-column prop="orderNo" label="訂單編號" width="160" />
            <el-table-column prop="customer" label="購買客戶" width="120" />
            <el-table-column prop="amount" label="金額" />
            <el-table-column label="狀態" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.statusType" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="content-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>⚡ 即時系統日誌</span>
              <el-button link type="primary" @click="goTo('/notifications')">日誌中心</el-button>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :type="activity.type"
              :timestamp="activity.timestamp"
              size="normal"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.welcome-header h2 {
  margin: 0;
  color: #303133;
}
.welcome-header p {
  margin: 6px 0 0 0;
  color: #909399;
  font-size: 14px;
}
.stat-row {
  margin-bottom: 0px;
}
.stat-card {
  border-radius: 8px;
  margin-bottom: 15px;
}
.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stat-title {
  font-size: 14px;
  color: #909399;
}
.stat-value {
  margin: 8px 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.stat-change {
  font-size: 12px;
}
.stat-change.up {
  color: #67C23A;
}
.stat-change.down {
  color: #F56C6C;
}
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.main-row {
  margin-top: 5px;
}
.content-card {
  border-radius: 8px;
  min-height: 380px;
  margin-bottom: 15px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>