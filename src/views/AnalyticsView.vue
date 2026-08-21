<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// 時間維度選擇
const timeRange = ref('7days')
const chartLoading = ref(false)

// DOM 引用
const trendChartRef = ref(null)
const categoryChartRef = ref(null)

// ECharts 實例引用
let trendChartInstance = null
let categoryChartInstance = null

// 模擬多維度統計數據字典
const mockAnalyticsData = {
  '7days': {
    dates: ['08-15', '08-16', '08-17', '08-18', '08-19', '08-20', '08-21'],
    revenue: [12400, 18900, 15600, 24800, 21000, 32000, 28400],
    orderCounts: [8, 12, 10, 16, 14, 22, 19],
    categoryPie: [
      { value: 45, name: '線上課程' },
      { value: 25, name: '實體書籍' },
      { value: 30, name: '周邊硬體' }
    ]
  },
  '30days': {
    dates: ['第1週', '第2週', '第3週', '第4週'],
    revenue: [88000, 124000, 156000, 142000],
    orderCounts: [60, 85, 110, 95],
    categoryPie: [
      { value: 50, name: '線上課程' },
      { value: 20, name: '實體書籍' },
      { value: 30, name: '周邊硬體' }
    ]
  },
  'year': {
    dates: ['Q1', 'Q2', 'Q3', 'Q4 (預估)'],
    revenue: [420000, 580000, 650000, 710000],
    orderCounts: [310, 420, 480, 530],
    categoryPie: [
      { value: 55, name: '線上課程' },
      { value: 15, name: '實體書籍' },
      { value: 30, name: '周邊硬體' }
    ]
  }
}

// 初始化折線/長條雙軸趨勢圖
function initTrendChart() {
  if (!trendChartRef.value) return
  trendChartInstance = echarts.init(trendChartRef.value)
  updateTrendChart()
}

// 更新趨勢圖配置
function updateTrendChart() {
  const data = mockAnalyticsData[timeRange.value]
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['營業額 (NT$)', '訂單數 (筆)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: { lineStyle: { color: '#909399' } }
    },
    yAxis: [
      {
        type: 'value',
        name: '營業額',
        axisLabel: { formatter: 'NT${value}' }
      },
      {
        type: 'value',
        name: '訂單數',
        position: 'right',
        axisLabel: { formatter: '{value} 筆' }
      }
    ],
    series: [
      {
        name: '營業額 (NT$)',
        type: 'bar',
        barWidth: '35%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#ecf5ff' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: data.revenue
      },
      {
        name: '訂單數 (筆)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        itemStyle: { color: '#67C23A' },
        lineStyle: { width: 3 },
        data: data.orderCounts
      }
    ]
  }
  trendChartInstance.setOption(option)
}

// 初始化類別佔比圓餅圖
function initCategoryChart() {
  if (!categoryChartRef.value) return
  categoryChartInstance = echarts.init(categoryChartRef.value)
  updateCategoryChart()
}

// 更新圓餅圖配置
function updateCategoryChart() {
  const data = mockAnalyticsData[timeRange.value]
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '營收佔比',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data.categoryPie
      }
    ]
  }
  categoryChartInstance.setOption(option)
}

// 時間區間切換聯動
function handleTimeRangeChange() {
  chartLoading.value = true
  setTimeout(() => {
    updateTrendChart()
    updateCategoryChart()
    chartLoading.value = false
  }, 250)
}

// 視窗縮放重繪監聽（自適應）
function handleResize() {
  trendChartInstance?.resize()
  categoryChartInstance?.resize()
}

onMounted(async () => {
  await nextTick()
  initTrendChart()
  initCategoryChart()
  window.addEventListener('resize', handleResize)
})

// 生命週期銷毀：解除事件監聽並銷毀實例，防止記憶體洩漏
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChartInstance?.dispose()
  categoryChartInstance?.dispose()
})
</script>

<template>
  <div class="analytics-page">
    <!-- 頂部控制列 -->
    <el-card shadow="never" class="control-card">
      <div class="control-header">
        <div>
          <h3 class="page-title">📈 營運數據大屏</h3>
          <p class="subtitle">即時監控營收走勢、訂單量轉化與商品品類分佈</p>
        </div>
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button label="7days">近 7 天</el-radio-button>
          <el-radio-button label="30days">近 30 天</el-radio-button>
          <el-radio-button label="year">年度營運</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- 圖表展示區塊 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" class="chart-card" v-loading="chartLoading">
          <template #header>
            <span class="card-title">營收趨勢與訂單總量分析</span>
          </template>
          <div ref="trendChartRef" class="chart-container" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="chart-card" v-loading="chartLoading">
          <template #header>
            <span class="card-title">商品分類營收佔比</span>
          </template>
          <div ref="categoryChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.analytics-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.control-card, .chart-card {
  border-radius: 8px;
}
.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.page-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}
.subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #909399;
}
.card-title {
  font-weight: bold;
  color: #303133;
}
.chart-container {
  width: 100%;
  height: 380px;
}
</style>