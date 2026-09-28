@echo off
setlocal
go mod tidy
if errorlevel 1 exit /b %errorlevel%
go build -trimpath -ldflags="-s -w" -o proxy.exe .
