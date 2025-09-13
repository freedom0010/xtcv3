#!/bin/bash

# 糖尿病匿名统计分析平台启动脚本

echo "🚀 启动糖尿病匿名统计分析平台..."

# 检查 Node.js 版本
echo "📋 检查环境..."
node_version=$(node -v)
echo "Node.js 版本: $node_version"

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在，请复制 .env.example 并配置"
    cp .env.example .env
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  警告: frontend/.env.local 文件不存在，请复制 .env.local.example 并配置"
    cd frontend
    cp .env.local.example .env.local
    cd ..
fi

# 编译智能合约
echo "🔨 编译智能合约..."
npm run compile

# 启动前端开发服务器
echo "🌐 启动前端服务器..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ 启动完成!"
echo ""
echo "📱 前端地址: http://localhost:3000"
echo "🔗 请确保已配置 Sepolia 测试网和合约地址"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
wait $FRONTEND_PID