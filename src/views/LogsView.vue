<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 模組類型字典配置
const MODULE_TYPES = {
  ALL: { label: '全部模組', tagType: '' },
  AUTH: { label: '權限認證', tagType: 'danger' },
  PRODUCT: { label: '商品管理', tagType: 'primary' },
  ORDER: { label: '訂單流轉', tagType: 'warning' },
  SYSTEM: { label: '系統設定', tagType: 'info' }
}

const viewMode = ref('table')

const filterForm = reactive({
  keyword: '',
  module: 'ALL',
  status: 'ALL'
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 6
})

const logList = ref([
  {
    id: 'LOG-9001',
    operator: 'admin (系統主管)',
    ip: '192.168.1.108',
    module: 'AUTH',
    action: '管理員成功登入系統',
    timestamp: '2026-08-21 16:45:12',
    status: 'SUCCESS',
    details: { userAgent: 'Chrome 128 / Windows 11', authType: 'JWT Token' }
  },
  {
    id: 'LOG-9002',
    operator: 'editor_amy (艾咪)',
    ip: '192.168.1.115',
    module: 'PRODUCT',
    action: '更新商品售價與最低庫存警戒',
    timestamp: '2026-08-21 15:20:05',
    status: 'SUCCESS',
    details: { productId: 101, sku: 'SKU-VUE-001', oldPrice: 1680, newPrice: 1880, minStock: 20 }
  },
  {
    id: 'LOG-9003',
    operator: 'guest_user (實習生小張)',
    ip: '192.168.1.140',
    module: 'SYSTEM',
    action: '嘗試刪除超級管理員帳號 (操作攔截)',
    timestamp: '2026-08-21 14:10:30',
    status: 'FAILED',
    details: { targetUserId: 1, reason: '403 Forbidden - Insufficient Permission' }
  },
  {
    id: 'LOG-9004',
    operator: 'editor_bob (鮑伯)',
    ip: '192.168.1.122',
    module: 'ORDER',
    action: '推進訂單 ORD-20260801-02 狀態至「待出貨」',
    timestamp: '2026-08-21 11:35:48',
    status: 'SUCCESS',
    details: { orderNo: 'ORD-20260801-02', prevStatus: 'PENDING_PAY', nextStatus: 'PAID' }
  },
  {
    id: 'LOG-9005',
    operator: 'admin (系統主管)',
    ip: '192.168.1.108',
    module: 'SYSTEM',
    action: '啟用深色主題模式與庫存通知偏好',
    timestamp: '2026-08-21 09:12:00',
    status: 'SUCCESS',
    details: { isDarkMode: true, enableStockAlertNotice: true }
  }
])

const filteredLogs = computed(() => {
  return logList.value.filter(log => {
    const matchKeyword = filterForm.keyword
      ? (log.action.toLowerCase().includes(filterForm.keyword.toLowerCase().trim()) ||
         log.operator.includes(filterForm.keyword.trim()) ||
         log.ip.includes(filterForm.keyword.trim()))
      : true

    const matchModule = filterForm.module === 'ALL' ? true : log.module === filterForm.module
    const matchStatus = filterForm.status === 'ALL' ? true : log.status === filterForm.status

    return matchKeyword && matchModule && matchStatus
  })
})

const displayedLogs = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredLogs.value.slice(start, start + pagination.pageSize)
})

const payloadDialogVisible = ref(false)
const currentPayload = ref(null)

function showDetails(row) {
  currentPayload.value = row
  payloadDialogVisible.value = true
}

function handleExportLogs() {
  ElMessage.success('審計日誌匯出中，已下載 audit_logs_2026.csv')
}

function handleResetFilter() {
  filterForm.keyword = ''
  filterForm.module = 'ALL'
  filterForm.status = 'ALL'
  pagination.currentPage = 1
}
</script>

<template>
  <div class="logs-page">
    <el-card shadow="never" class="box-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="關鍵字">
          <el-input v-model="filterForm.keyword" placeholder="搜尋操作內容 / 操作者 / IP" clearable style="width: 220px;" />
        </el-form-item>

        <el-form-item label="業務模組">
          <el-select v-model="filterForm.module" style="width: 130px;">
            <el-option v-for="(cfg, key) in MODULE_TYPES" :key="key" :label="cfg.label" :value="key" />
          </el-select>
        </el-form-item>

        <el-form-item label="執行結果">
          <el-select v-model="filterForm.status" style="width: 120px;">
            <el-option label="全部結果" value="ALL" />
            <el-option label="成功" value="SUCCESS" />
            <el-option label="失敗/拒絕" value="FAILED" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="pagination.currentPage = 1">查詢</el-button>
          <el-button icon="Refresh" @click="handleResetFilter">重設</el-button>
        </el-form-item>
      </el-form>

      <div class="action-bar">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="table">📋 表格視圖</el-radio-button>
          <el-radio-button label="timeline">⏱️ 時間軸視圖</el-radio-button>
        </el-radio-group>

        <el-button type="success" icon="Download" plain size="small" @click="handleExportLogs">匯出日誌</el-button>
      </div>
    </el-card>

    <!-- 表格視圖 -->
    <el-card v-if="viewMode === 'table'" shadow="never" class="box-card">
      <el-table :data="displayedLogs" stripe border style="width: 100%">
        <el-table-column prop="id" label="日誌 ID" width="110" align="center" />
        <el-table-column prop="timestamp" label="發生時間" width="170" align="center" />
        <el-table-column prop="operator" label="操作帳號" width="160" />
        <el-table-column prop="ip" label="來源 IP" width="130" align="center" />

        <el-table-column label="所屬模組" width="110" align="center">
          <template #default="scope">
            <el-tag :type="MODULE_TYPES[scope.row.module].tagType" effect="plain">
              {{ MODULE_TYPES[scope.row.module].label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="action" label="操作事件說明" min-width="220" />

        <el-table-column label="狀態" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'SUCCESS' ? 'success' : 'danger'">
              {{ scope.row.status === 'SUCCESS' ? '成功' : '異常' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="明細" width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="showDetails(scope.row)">查看 Payload</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="filteredLogs.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <!-- 時間軸視圖 -->
    <el-card v-else shadow="never" class="box-card">
      <div class="timeline-container">
        <el-timeline>
          <el-timeline-item
            v-for="log in displayedLogs"
            :key="log.id"
            :timestamp="log.timestamp"
            placement="top"
            :type="log.status === 'SUCCESS' ? 'primary' : 'danger'"
          >
            <el-card shadow="hover" class="timeline-card">
              <div class="timeline-header">
                <div>
                  <el-tag size="small" :type="MODULE_TYPES[log.module].tagType" style="margin-right: 8px;">
                    {{ MODULE_TYPES[log.module].label }}
                  </el-tag>
                  <strong>{{ log.action }}</strong>
                </div>
                <el-button size="small" type="primary" link @click="showDetails(log)">詳細資訊</el-button>
              </div>
              <p class="timeline-meta">操作者: {{ log.operator }} | IP: {{ log.ip }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- JSON Payload 彈窗 -->
    <el-dialog v-model="payloadDialogVisible" title="審計日誌詳細 Payload" width="550px">
      <div v-if="currentPayload">
        <p><strong>日誌 ID：</strong>{{ currentPayload.id }}</p>
        <p><strong>操作內容：</strong>{{ currentPayload.action }}</p>
        <p><strong>結構化資料封包 (JSON)：</strong></p>
        <pre class="json-viewer">{{ JSON.stringify(currentPayload.details, null, 2) }}</pre>
      </div>
      <template #footer>
        <el-button type="primary" @click="payloadDialogVisible = false">關閉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.logs-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.box-card {
  border-radius: 8px;
}
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
.timeline-container {
  padding: 10px 20px;
}
.timeline-card {
  border-radius: 6px;
}
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.timeline-meta {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #909399;
}
.json-viewer {
  background-color: #282c34;
  color: #abb2bf;
  padding: 12px;
  border-radius: 6px;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  overflow-x: auto;
}
</style>