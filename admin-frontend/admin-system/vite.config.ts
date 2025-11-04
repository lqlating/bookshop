import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// ✅ 自动根据运行环境设置 base 路径
// - 开发环境（npm run dev）：base = '/'
// - 生产环境（npm run build 后部署）：base = '/admin/'
const basePath = process.env.NODE_ENV === 'production' ? '/admin/' : '/'

export default defineConfig({
  base: basePath,

  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    port: 5173,
    open: true,
    hmr: {
      overlay: false // 禁用错误覆盖
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`
      }
    }
  }
})
