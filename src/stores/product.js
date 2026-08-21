// 引入 Pinia 的 defineStore 方法
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('product', () => {
  // 從 localStorage 讀取或給予預設資料
  const initialData = [
    {
      id: 101,
      sku: 'SKU-VUE-001',
      name: 'Vue 3 高階組件設計手冊',
      category: '線上課程',
      price: 1880,
      stock: 99,
      minStock: 20, // 最低庫存警戒線
      status: true,
      description: '深入剖析 Composition API 與響應式底層原理。',
      tags: ['Vue3', '高階架構'],
      cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'
    },
    {
      id: 102,
      sku: 'SKU-TS-002',
      name: 'TypeScript 實戰精通密笈',
      category: '實體書籍',
      price: 680,
      stock: 8,
      minStock: 15, // 當前 8 < 15 觸發預警
      status: true,
      description: '全面掌握大型前端專案型別安全。',
      tags: ['TypeScript', '暢銷書'],
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=100'
    },
    {
      id: 103,
      sku: 'SKU-KB-003',
      name: '機械式人體工學鍵盤 (青軸)',
      category: '周邊硬體',
      price: 3490,
      stock: 3,
      minStock: 10, // 當前 3 < 10 觸發預警
      status: false,
      description: '工程師長時間打字必備。',
      tags: ['硬體', '人體工學'],
      cover: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100'
    }
  ]

  const saved = localStorage.getItem('vue_admin_products')
  const products = ref(saved ? JSON.parse(saved) : initialData)

  // 資料持久化同步函式
  function syncStorage() {
    localStorage.setItem('vue_admin_products', JSON.stringify(products.value))
  }

  // 1. 根據 ID 查詢商品
  function getProductById(id) {
    return products.value.find(p => p.id === Number(id))
  }

  // 2. 新增商品
  function addProduct(item) {
    const newId = products.value.length > 0 ? Math.max(...products.value.map(p => p.id)) + 1 : 101
    products.value.unshift({
      ...item,
      id: newId,
      cover: item.cover || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'
    })
    syncStorage()
  }

  // 3. 更新商品
  function updateProduct(id, updatedItem) {
    const index = products.value.findIndex(p => p.id === Number(id))
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...updatedItem }
      syncStorage()
      return true
    }
    return false
  }

  // 4. 刪除商品
  function deleteProduct(id) {
    products.value = products.value.filter(p => p.id !== Number(id))
    syncStorage()
  }

  // 5. 批次刪除
  function batchDelete(ids) {
    products.value = products.value.filter(p => !ids.includes(p.id))
    syncStorage()
  }

  // 計算屬性：低於最低庫存的商品數量
  const lowStockCount = computed(() => {
    return products.value.filter(p => p.stock <= p.minStock).length
  })

  return {
    products,
    lowStockCount,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    batchDelete
  }
})