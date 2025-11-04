import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  // ✅ 关键修改：让打包后静态资源使用相对路径，避免 404
  base: './',

  plugins: [
    vue(),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
      dts: 'src/components.d.ts',
    }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    hmr: {
      overlay: false, // ✅ 部署时建议关闭 HMR 错误遮罩，防止报错影响调试
    },
    port: 5174,
    strictPort: true,
    watch: {
      usePolling: true, // 适用于 WSL、Docker 等环境
    },
    open: true,
  },

  build: {
    outDir: 'dist', // 默认即可，不改也行
    assetsDir: 'assets',
    sourcemap: false, // ✅ 生产环境关闭 source map，提高安全性
  },
});
