# 简洁代理切换

Firefox WebExtension：在直连、SOCKS5 与 HTTP 代理之间快速切换。配置仅保存在 Firefox 的 `browser.storage.local`，扩展不会访问网络、修改系统代理或执行外部程序。

## 临时加载与调试

1. 在 Firefox 打开 `about:debugging`。
2. 选择“此 Firefox”。
3. 点击“临时载入附加组件”。
4. 选择本目录中的 `manifest.json`。

首次加载会创建 `Company SOCKS5`（`127.0.0.1:1080`、代理 DNS）、`Company HTTP`（`127.0.0.1:8080`）和 `Clash HTTP`（`127.0.0.1:7890`）三个配置。升级已安装的旧版本时会补上 Clash HTTP，但不会覆盖或重新创建用户已经删除的其他配置。若 Firefox 提示扩展没有隐私窗口访问权限，请在扩展管理页允许；代理设置同时影响普通与隐私窗口。

## 测试

- **直连**：在弹窗选择“直连”，工具栏角标显示 `D`。扩展写入 `{ proxyType: "none" }`。
- **SOCKS5**：先在本机启动 SOCKS5 服务，再选择对应配置；角标为 `S`。DNS 选项启用时会写入 `proxyDNS: true` 与 `socksVersion: 5`，让 Firefox 把名称交给 SOCKS5 代理解析。
- **HTTP**：先在本机启动 HTTP 代理，再选择对应配置；角标为 `H`。扩展会为 `http` 和 `ssl` 使用同一地址，因此 HTTPS 通过 HTTP CONNECT 隧道。
- **确认 SOCKS5 DNS**：用一个仅代理端能解析的测试域名访问，或查看 SOCKS5 服务日志应出现域名而不是仅 IP；同时确认设置页的“SOCKS5 通过代理解析 DNS”已勾选。
- **WebExtension Console**：在 `about:debugging` → “此 Firefox” 中，找到此临时扩展并点击“检查”。弹窗/设置页可从页面右键“检查元素”查看各自控制台。

## 打包与长期安装

PowerShell 中进入 `widgets/firefox-proxy` 后执行：

```powershell
Compress-Archive -Path manifest.json,popup.html,popup.css,popup.js,options.html,options.css,options.js,proxy.js,background.js,icons -DestinationPath simple-proxy-switch.zip
```

压缩包根目录必须直接包含 `manifest.json`。临时加载在重启 Firefox 后会失效；长期安装需要通过 [addons.mozilla.org](https://addons.mozilla.org/developers/) 上传并由 Mozilla 签名，或在受控的企业环境中使用相应的签名/策略部署方式。
