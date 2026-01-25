// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'; // 解析 node_modules 中的模块
import commonjs from '@rollup/plugin-commonjs';   // 将 CommonJS 模块转换为 ES6 模块
import typescript from '@rollup/plugin-typescript'; // 编译 TypeScript
import { defineConfig } from 'rollup';

// 通常需要一个 tsconfig.json 文件来指导 TypeScript 编译
// 确保你的项目根目录有 tsconfig.json
// import tsconfig from './tsconfig.json'; // 如果需要从文件读取配置

export default defineConfig({
    // 入口文件，指向你的库的主入口 (通常是 src/index.ts)
    input: './src/index.ts', // 请根据你的实际入口文件路径修改
    output: [
        {
            file: 'dist/index.umd.js', // UMD 格式输出文件
            format: 'umd',             // Universal Module Definition, 适用于浏览器和 Node.js
            name: 'AjaxjsUtil',        // UMD 格式下，全局变量的名字 (window.AjaxjsUtil)
            sourcemap: true,          // 生成 sourcemap 文件，便于调试
            exports: 'named'          // 指定导出方式，'named' 表示使用命名导出
        },
        {
            file: 'dist/index.esm.js', // ES Module 格式输出文件
            format: 'es',              // ES Module, 适用于现代打包工具 (Webpack, Vite)
            sourcemap: true,          // 生成 sourcemap 文件
            exports: 'named'          // 指定导出方式
        }
    ],
    plugins: [
        // 解析和加载 node_modules 中的第三方模块
        resolve({
            browser: true, // 如果你的库需要在浏览器中运行，设置为 true
            extensions: ['.ts', '.js'] // 指定解析的文件扩展名
        }),
        // 将 CommonJS 模块转换为 ES6 模块，以便 Rollup 处理
        commonjs(),
        // 编译 TypeScript 代码
        typescript({
            // tsconfig: tsconfig, // 如果需要从变量加载配置
            // 如果不指定 tsconfig，会默认读取项目根目录下的 tsconfig.json
            sourceMap: true, // 生成 .ts 文件的 sourcemap
            declaration: true, // 生成 .d.ts 类型声明文件
            declarationDir: 'dist/src', // 指定 .d.ts 文件的输出目录
            // declarationMap: true, // 生成 .d.ts.map 文件 (可选)
            // outDir: 'dist-temp', // 指定编译后的 JS 输出目录 (通常不需要，因为 Rollup 会处理)
        })
    ],
    // 指定外部依赖，这些依赖不会被打包进最终的库文件中
    external: [], // 例如: ['vue', 'lodash'] 如果你的库依赖这些外部包且希望用户自行安装
});