import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/global.css'  // 引入全局样式
import './assets/tailwind.css' // 引入 Tailwind CSS

const app = createApp(App)
const pinia = createPinia()

// 使用 Pinia, ElementPlus 和 router
app.use(pinia)
app.use(ElementPlus)
app.use(router)

// 挂载 Vue 应用
app.mount('#app')
