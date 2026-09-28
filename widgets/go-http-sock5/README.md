# HTTP/HTTPS → SOCKS5 本地代理

这是一个轻量级 Windows 命令行程序：只监听本机 HTTP 代理端口，并将所有目标 TCP 连接通过 SOCKS5 上游建立。它不会解析本地域名后再连接；SOCKS5 请求直接携带目标域名，因此具备 `socks5h` 的 DNS 行为。

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
```

默认监听 `127.0.0.1:8080`，上游为 `127.0.0.1:1080`。默认不会监听局域网地址；只有显式传入 `-listen` 才会改变。启动时 SOCKS5 不可用只会显示警告，程序仍会继续监听。按 `Ctrl+C` 可优雅停止；已经建立的 CONNECT 隧道会在关闭过程中断开，避免无限等待。

`-v` 仅记录请求方法与目标地址，例如 `CONNECT api.openai.com:443`；不会记录头、请求体、Cookie 或 Authorization。

## 验证

先确保 SOCKS5 正在运行，再执行：

```bat
curl.exe --proxy http://127.0.0.1:8080 http://example.com/
curl.exe --ssl-revoke-best-effort --proxy http://127.0.0.1:8080 https://ipinfo.io/ip
curl.exe -v --ssl-revoke-best-effort --proxy http://127.0.0.1:8080 https://www.google.com/
```

第三条会使用 HTTP CONNECT；配合 `proxy.exe -v`，日志应显示对应的 `CONNECT`。如网络链路保持不变，第二条可用于人工确认出口 IP；程序不会假设或写死任何出口 IP。

也可执行单元测试：

```bat
go test ./...
```

其中 SOCKS5 测试会验证 `api.openai.com` 以域名形式发送给上游，而不是由本地 DNS 预解析。

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

从同一终端启动目标程序即可。这些设置仅对当前终端及其子进程生效，不会改动系统环境变量。
