// 從 vue 套件中引入 createApp 函式，用來建立 Vue 應用實例
import { createApp } from 'vue'

// 引入 Pinia 全域狀態管理庫的建立函式
import { createPinia } from 'pinia'

// 引入 Element Plus UI 元件庫本體
import ElementPlus from 'element-plus'

// 引入 Element Plus 的完整 CSS 樣式檔，確保按鈕、表格等元件有預設外觀
import 'element-plus/dist/index.css'

// 引入 Element Plus 官方提供的所有圖示（Icons）集合
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入根元件 App.vue（整個網站的最外層容器）
import App from './App.vue'

// 引入路由設定檔（router）
import router from './router'

// 建立 Vue 應用實例，並以 App 為根元件
const app = createApp(App)

// 使用迴圈遍歷 ElementPlusIconsVue 物件中的所有圖示元件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  // 將圖示一個個註冊為全域元件，讓專案中任何頁面都能直接使用 <Odometer /> 等標籤
  app.component(key, component)
}

// 註冊 Pinia 狀態管理外掛
app.use(createPinia())

// 註冊 Vue Router 路由外掛，啟用多頁面切換功能
app.use(router)

// 註冊 Element Plus UI 元件庫，啟用所有 el- 開頭的 UI 元件
app.use(ElementPlus)

// 將整個 Vue 應用掛載到 public/index.html 裡 id 為 app 的 div 標籤上
app.mount('#app')