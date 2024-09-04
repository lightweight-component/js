[![NPM](https://img.shields.io/npm/v/@ajaxjs/util.svg?sanitize=true)](https://www.npmjs.com/package/@ajaxjs/util)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.4-blue.svg?style=flat&logo=Typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Apache--2.0-green.svg?longCache=true&style=flat)](http://www.apache.org/licenses/LICENSE-2.0.txt)
[![Email](https://img.shields.io/badge/Contact--me-Email-orange.svg)](mailto:frank@ajaxjs.com)
[![QQ群](https://framework.ajaxjs.com/static/qq.svg)](https://shang.qq.com/wpa/qunwpa?idkey=3877893a4ed3a5f0be01e809e7ac120e346102bd550deb6692239bb42de38e22)

# AjaxJS JS Utils
Some common JS functions.

NPM: https://www.npmjs.com/package/@ajaxjs/util


# How to create a NPM package?
Use Rollup to build your package.

```
npm init
npm add typescript -D
tsc --init

npm install rollup -g        # 全局安装
npm install rollup -D        # 项目本地安装
npm install @rollup/plugin-typescript -D  # 将Typescript转换成为 ES6+ 标准
npm install @rollup/plugin-commonjs -D    # rollup默认不支持CommonJS，自己写的时候可以尽量避免使用CommonJS模块的语法，但有些外部库的是cjs或者umd（由webpack打包的）。如果使用这些外部库就需要支持CommonJS模块。
npm install @rollup/plugin-node-resolve -D
npm init @eslint/config
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

https://chieminchan.vercel.app/articles/Project%20Management/%E6%89%8B%E6%8A%8A%E6%89%8B%E6%95%99%E4%BD%A0%E5%8F%91%E4%B8%AAnpm%E5%8C%85.html

# Rollup Config
## 1

升级到最新版本 rollup: 4.14.3 后 rollup.config.js 配置文件中却不能使用 es6 import 语法了！

    rollup: 4.14.3 时报错：SyntaxError: Cannot use import statement outside a module

解决方法1
打包命令添加： `--bundleConfigAsCjs`
修改打包命令： `"dev": "rollup -c rollup.config.js --bundleConfigAsCjs -w"` 重新执行则解决


解决方法2
package.json 中添加："type": "module",
这样设置只是支持 es6语法，但 import 语法是不可以引入 .json文件的！


链接：https://juejin.cn/post/7359893210797015051

## 2
项目至少包含一个扩展名为 `.ts` 的文件

    error TS18003: No inputs were found in config file '/Users/jiyik/workspace/ts/tsconfig.json'. Specified 'include' paths were '["src/**/*"]' and 'exclude' paths were '["node_modules"]'

`tsconfig.json` 文件中设置：

```json
{
  "compilerOptions": {
    // ... 配置项
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```