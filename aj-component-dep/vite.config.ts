// vite.config.ts
import vue from '@vitejs/plugin-vue';
import { defineConfig as defineViteConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
console.log('vite.config.ts', resolve('/', 'entry.ts'));

// const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineViteConfig({
  plugins: [
    vue({
      template: {
        // 支持 web-component
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('my-')
        }
      }
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'entry.ts'),     // 入口
      name: 'Role',                     // 全局变量名（如用 script 引入）
      formats: ['es', 'umd'],                   // 输出格式
      fileName: 'role'
    },
    outDir: 'dist/lib',                         // 输出到 lib 目录
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});