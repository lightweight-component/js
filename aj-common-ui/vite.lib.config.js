import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts'; // 导入 dts 插件
// import { resolve } from 'path';

export default defineConfig({
    plugins: [vue(),
    dts({ // 添加 dts 插件
        insertTypesEntry: true, // 自动生成 types 字段指向入口类型文件
        tsconfigPath: './tsconfig.json', // 指向你的 tsconfig
        // copyDtsFiles: true, // 是否复制源码中的 .d.ts 文件 (通常不需要，因为会编译)
    }),
    ],
    build: {
        lib: {
            entry: './src/index.js', // 您的组件库入口文件
            name: 'ajaxjs_ui', // UMD 模式下的全局变量名
            fileName: (format) => `ajaxjs-ui.${format}.js`, // 输出文件名
            formats: ['es', 'umd', 'cjs']
        },
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ['vue'], // 例如，不要将 Vue 打包进来
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
});