# HTTP/HTTPS → SOCKS5 代理

这是一个轻量级 Go 命令行程序：将 HTTP/HTTPS Proxy 请求转发到 SOCKS5 上游。它不会解析本地域名后再连接；SOCKS5 请求直接携带目标域名，因此具备 `socks5h` 的 DNS 行为。

程序不管理 SSH、不修改 Windows 系统代理、路由或环境变量，不记录 HTTP 正文、Cookie 或认证信息，也不会解密 HTTPS。

## 构建

需要 Go 1.20 或更高版本。在 Windows 命令提示符执行：

```bat
build.bat
```

它会运行 `go mod tidy`，并生成不依赖额外运行时的 `proxy.exe`。在其他系统交叉编译 Windows amd64：

```powershell
$env:GOOS="windows"
$env:GOARCH="amd64"
go build -trimpath -ldflags="-s -w" -o proxy.exe .
```

## 运行与停止

```bat
proxy.exe
proxy.exe -listen 127.0.0.1:8888 -socks 127.0.0.1:1080 -v
proxy.exe -listen 0.0.0.0:8080 -socks 127.0.0.1:1080 -user YOUR_USER -password "YOUR_PASSWORD"
proxy.exe -listen 0.0.0.0:8443 -socks 127.0.0.1:1080 -user YOUR_USER -password "YOUR_PASSWORD" -cert /path/proxy.pem -key /path/proxy.key
```

默认监听 `127.0.0.1:8080`，上游为 `127.0.0.1:1080`。默认不会监听局域网地址；只有显式传入 `-listen 0.0.0.0:8080` 才会暴露公网入口。`-user` 和 `-password` 同时省略时保持无认证；只设置其中一个会启动失败。`-cert` 和 `-key` 同时省略时运行普通 HTTP Proxy；两者同时提供时运行 HTTPS Proxy，TLS 仅保护客户端到代理的连接。只设置其中一个会启动失败。启动时 SOCKS5 不可用只会显示警告，程序仍会继续监听。按 `Ctrl+C` 可优雅停止；已经建立的 CONNECT 隧道会在关闭过程中断开，避免无限等待。

认证采用标准 `Proxy-Authorization: Basic ...`。HTTP、HTTPS CONNECT 和 Upgrade 请求都在转发前统一认证；成功后该头会立即删除，不会发往目标服务器。凭据摘要使用 SHA-256 后以 `crypto/subtle.ConstantTimeCompare` 比较。`-v` 仅记录请求方法与目标地址或 407 状态；不会记录密码、认证头、请求体、Cookie 或 Authorization。

## 验证

先确保 SOCKS5 正在运行，再执行：

```bat
curl.exe --proxy http://127.0.0.1:8080 http://example.com/
curl.exe --ssl-revoke-best-effort --proxy http://127.0.0.1:8080 https://ipinfo.io/ip
curl.exe -v --ssl-revoke-best-effort --proxy http://127.0.0.1:8080 https://www.google.com/
curl.exe --proxy https://YOUR_USER:YOUR_PASSWORD@HOST:8443 https://ipinfo.io/ip
```

第三条会使用 HTTP CONNECT；配合 `proxy.exe -v`，日志应显示对应的 `CONNECT`。如网络链路保持不变，第二条可用于人工确认出口 IP；程序不会假设或写死任何出口 IP。

也可执行单元测试：

```bat
go test ./...
```

其中 SOCKS5 测试会验证 `api.openai.com` 以域名形式发送给上游，而不是由本地 DNS 预解析。

认证失败时服务会返回 `407 Proxy Authentication Required` 和 `Proxy-Authenticate: Basic realm="Private Proxy"`。认证代理可使用：

```bat
curl.exe --ssl-revoke-best-effort --proxy http://YOUR_USER:YOUR_PASSWORD@HOST:8080 https://ipinfo.io/ip
```

## Linux VPS 部署

在 Windows PowerShell 交叉编译 Linux amd64：

```powershell
$env:GOOS="linux"; $env:GOARCH="amd64"
go build -trimpath -ldflags="-s -w" -o proxy-linux-amd64 .
Remove-Item Env:GOOS,Env:GOARCH
```

上传与启动（使用占位符，不要把真实密码写入仓库）：

```bat
scp proxy-linux-amd64 root@8.134.197.47:/usr/local/bin/http-socks-proxy
```

```bash
chmod +x /usr/local/bin/http-socks-proxy
/usr/local/bin/http-socks-proxy -listen 0.0.0.0:8080 -socks 127.0.0.1:1080 -user YOUR_USER -password "YOUR_PASSWORD"
```

部署后确认仅 SOCKS5 监听回环地址：

```bash
ss -lntp | grep -E '1080|8080'
```

安全提醒：普通 HTTP Proxy 模式下，Basic Proxy Authentication 不加密客户端到 VPS 的认证流量。公网部署应使用 HTTPS Proxy 模式并提供可信 PEM 证书及私钥，在云安全组限制来源 IP，绝不开放 1080。TLS 不会解密或拦截 CONNECT 后的流量。

## 给 Codex 或其他程序使用

CMD：

```bat
set HTTP_PROXY=http://127.0.0.1:8080
set HTTPS_PROXY=http://127.0.0.1:8080
```

PowerShell：

```powershell
$env:HTTP_PROXY="http://127.0.0.1:8080"
$env:HTTPS_PROXY="http://127.0.0.1:8080"
```

VPS 认证代理：

```powershell
$env:HTTP_PROXY="http://YOUR_USER:YOUR_PASSWORD@8.134.197.47:8080"
$env:HTTPS_PROXY="http://YOUR_USER:YOUR_PASSWORD@8.134.197.47:8080"
```

从同一终端启动目标程序即可。这些设置仅对当前终端及其子进程生效，不会改动系统环境变量。
