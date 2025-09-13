@echo off
chcp 65001 >nul

echo 🚀 启动糖尿病匿名统计分析平台...

REM 检查 Node.js 版本
echo 📋 检查环境...
node -v

REM 检查是否安装了依赖
if not exist "node_modules" (
    echo 📦 安装后端依赖...
    npm install
)

if not exist "frontend\node_modules" (
    echo 📦 安装前端依赖...
    cd frontend
    npm install
    cd ..
)

REM 检查环境变量文件
if not exist ".env" (
    echo ⚠️  警告: .env 文件不存在，请复制 .env.example 并配置
    copy .env.example .env
)

if not exist "frontend\.env.local" (
    echo ⚠️  警告: frontend\.env.local 文件不存在，请复制 .env.local.example 并配置
    cd frontend
    copy .env.local.example .env.local
    cd ..
)

REM 编译智能合约
echo 🔨 编译智能合约...
npm run compile

REM 启动前端开发服务器
echo 🌐 启动前端服务器...
cd frontend
start /B npm run dev
cd ..

echo ✅ 启动完成!
echo.
echo 📱 前端地址: http://localhost:3000
echo 🔗 请确保已配置 Sepolia 测试网和合约地址
echo.
echo 按任意键退出...
pause >nul