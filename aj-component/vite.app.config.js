import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        allowedHosts: ['local.robot.com']
    },
    base: './', 
    plugins: [vue()],
    build: {
        outDir: 'dist-demo' // 指定 Demo 应用的输出目录
    }
});