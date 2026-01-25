import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: 'dist-demo', // 指定 Demo 应用的输出目录
        rollupOptions: {
            input: {
                main: './demo/index.html', // 指向 Demo 的 HTML 入口
            },
        },
    },
});