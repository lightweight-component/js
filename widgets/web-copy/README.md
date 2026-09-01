# Web Copy

一个使用 TypeScript 编写的 Chrome Manifest V3 扩展：在网页上点选一个 DOM 区域，将文字、内联样式和图片导出为可离线阅读的 HTML，并可同时生成 Markdown。

## 开发

```bash
npm install
npm test
npm run build
```

然后打开 `chrome://extensions`，启用“开发者模式”，选择“加载已解压的扩展程序”，并选择项目中的 `dist` 目录。

## 使用

1. 在普通网页中点击工具栏里的 Web Copy。
2. 移动鼠标查看蓝色高亮框，单击需要导出的元素；按 Esc 可退出。
3. 在自动打开的导出页中选择 Markdown、图片命名和 WebP 设置。
4. 点击“选择目录并导出”，选择一个本地根目录。扩展会在其中创建“页面标题-时间戳”子目录。

### 本地 `file://` 网页

`manifest.json` 中的 `<all_urls>` 已包含文件网址权限声明，但 Chrome 默认不会把该权限直接授予扩展。打开 `chrome://extensions`，进入 Web Copy 的“详情”，开启“允许访问文件网址”，然后重新加载本地 HTML 页面。之后可选择本地 DOM，并保存通过 `file://` 引用的图片。

## 已知边界

- Chrome 内置页、扩展商店页等受保护页面不允许内容脚本运行。
- 本地网页需要用户在扩展详情中手动开启“允许访问文件网址”；扩展无法自动开启该 Chrome 安全设置。
- 图片读取会尽量复用 HTTP 缓存，但受服务器缓存策略、登录状态和防盗链规则影响。
- 首版处理 `img`/`picture` 的实际图片和 inline style 背景图，不处理外链 CSS、iframe、canvas 或 Shadow DOM 组合选择。
- GIF 与 SVG 不转 WebP，以免丢失动画或矢量信息。
