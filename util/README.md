

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