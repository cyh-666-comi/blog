@echo off
title Blog Starter

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo Download: https://nodejs.org
    pause
    exit /b 1
)

echo ==========================================
echo  Blog System Starter
echo ==========================================
echo.
echo Node.js:
node -v
echo.

REM Check dependencies
if not exist "%~dp0server\node_modules" (
    echo Installing backend dependencies...
    cd /d "%~dp0server"
    call npm install
)
if not exist "%~dp0client\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%~dp0client"
    call npm install
)

echo [1/2] Starting backend on port 3000...
start "Blog-Backend" /D "%~dp0server" cmd /k "node src\index.js"

echo [2/2] Starting frontend on port 5173...
start "Blog-Frontend" /D "%~dp0client" cmd /k "npx vite --host"

echo.
echo ==========================================
echo  All services started!
echo.
echo  Blog:      http://localhost:5173
echo  Admin:     http://localhost:5173/admin/login
echo  API:       http://localhost:3000
echo.
echo  Account:   admin / admin123
echo ==========================================
echo.
echo You can close this window now.
pause
