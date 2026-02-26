import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    // 开发服务器配置
    server: {
        allowedHosts: ['local.robot.com']
    },
    // 为开发环境指定入口点 (Demo应用)
    build: {
        rollupOptions: {
            input: {
                main: './demo/index.html', // 指向 Demo 的 HTML 入口
            },
        },
    },
});