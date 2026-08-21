<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="not-found-container">
    <el-result
      icon="warning"
      title="404 - 找不到該頁面"
      sub-title="您所請求的後台資源不存在，或無存取權限。"
    >
      <template #extra>
        <el-button type="primary" icon="HomeFilled" @click="goHome">
          返回主控台首頁
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>