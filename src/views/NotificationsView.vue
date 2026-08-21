<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 篩選標籤
const currentCategory = ref('ALL')

// 模擬通知資料
const notifications = ref([
  {
    id: 1,
    title: '庫存不足警示',
    content: '商品「TypeScript 實戰精通密笈」當前庫存已低於安全警戒值 (8 < 15)，請即時補貨。',
    category: 'STOCK',
    read: false,
    time: '10 分鐘前'
  },
  {
    id: 2,
    title: '新訂單成立通知',
    content: '客戶「李大華」已成功建立訂單 ORD-20260801-02，金額 NT$ 4,170。',
    category: 'ORDER',
    read: false,
    time: '1 小時前'
  },
  {
    id: 3,
    title: '資安異常登入攔截',
    content: '帳號 guest_user 嘗試執行高權限刪除操作已被系統安全性守衛攔截。',
    category: 'SECURITY',
    read: true,
    time: '昨天 14:10'
  },
  {
    id: 4,
    title: '系統版本升級通知',
    content: '後台管理系統已完成 Vite 打包工程化配置與 Dark Mode 支援。',
    category: 'SYSTEM',
    read: true,
    time: '2 天前'
  }
])

// 標籤類型映射
const CATEGORY_MAP = {
  STOCK: { label: '庫存預警', type: 'danger' },
  ORDER: { label: '訂單通知', type: 'warning' },
  SECURITY: { label: '資安監控', type: 'info' },
  SYSTEM: { label: '系統公告', type: 'primary' }
}

// 過濾清單
const filteredList = computed(() => {
  if (currentCategory.value === 'ALL') return notifications.value
  if (currentCategory.value === 'UNREAD') return notifications.value.filter(n => !n.read)
  return notifications.value.filter(n => n.category === currentCategory.value)
})

// 未讀總數
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// 單筆標記已讀
function markAsRead(item) {
  item.read = true
  ElMessage.success(`已將「${item.title}」標記為已讀`)
}

// 一鍵全部已讀
function markAllAsRead() {
  notifications.value.forEach(n => (n.read = true))
  ElMessage.success('全站通知已全部標記為已讀！')
}

// 清空已讀通知
function clearReadNotifications() {
  notifications.value = notifications.value.filter(n => !n.read)
  ElMessage.info('已清除所有已讀通知')
}
</script>

<template>
  <div class="notifications-page">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="card-header">
          <div>
            <span class="title">🔔 訊息與通知中心</span>
            <el-tag v-if="unreadCount > 0" type="danger" size="small" style="margin-left: 8px;">
              {{ unreadCount }} 則未讀
            </el-tag>
          </div>
          <div class="actions">
            <el-button size="small" type="primary" plain :disabled="unreadCount === 0" @click="markAllAsRead">
              全部標為已讀
            </el-button>
            <el-button size="small" type="danger" plain @click="clearReadNotifications">
              清空已讀
            </el-button>
          </div>
        </div>
      </template>

      <!-- 篩選 Tabs -->
      <el-tabs v-model="currentCategory">
        <el-tab-pane label="全部訊息" name="ALL" />
        <el-tab-pane :label="`未讀訊息 (${unreadCount})`" name="UNREAD" />
        <el-tab-pane label="庫存預警" name="STOCK" />
        <el-tab-pane label="訂單通知" name="ORDER" />
        <el-tab-pane label="資安監控" name="SECURITY" />
        <el-tab-pane label="系統公告" name="SYSTEM" />
      </el-tabs>

      <!-- 訊息列表 -->
      <div v-if="filteredList.length > 0" class="notice-list">
        <div
          v-for="item in filteredList"
          :key="item.id"
          :class="['notice-item', { unread: !item.read }]"
        >
          <div class="notice-left">
            <el-tag :type="CATEGORY_MAP[item.category]?.type || 'info'" size="small">
              {{ CATEGORY_MAP[item.category]?.label }}
            </el-tag>
            <div class="notice-content">
              <h4 class="notice-title">{{ item.title }}</h4>
              <p class="notice-desc">{{ item.content }}</p>
              <span class="notice-time">{{ item.time }}</span>
            </div>
          </div>
          <div class="notice-right">
            <el-button v-if="!item.read" size="small" link type="primary" @click="markAsRead(item)">
              標為已讀
            </el-button>
            <span v-else class="read-text">已讀</span>
          </div>
        </div>
      </div>
      <el-empty v-else description="目前沒有任何通知訊息" />
    </el-card>
  </div>
</template>

<style scoped>
.notifications-page {
  max-width: 1000px;
  margin: 0 auto;
}
.box-card {
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 16px;
  font-weight: bold;
}
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.notice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 6px;
  background-color: #f8f9fa;
  border: 1px solid #ebeef5;
  transition: all 0.2s ease;
}
.notice-item.unread {
  background-color: #f0f7ff;
  border-color: #c6e2ff;
}
.notice-left {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.notice-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
}
.notice-desc {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #606266;
}
.notice-time {
  font-size: 12px;
  color: #909399;
}
.read-text {
  font-size: 12px;
  color: #c0c4cc;
}
</style>