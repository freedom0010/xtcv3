#!/bin/bash

# 智能合约部署脚本

echo "🚀 开始部署糖尿病分析智能合约到 Sepolia 测试网..."

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请复制 .env.example 到 .env 并配置必要的环境变量"
    exit 1
fi

# 加载环境变量
source .env

# 检查必要的环境变量
if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "❌ 错误: SEPOLIA_RPC_URL 未配置"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ 错误: PRIVATE_KEY 未配置"
    exit 1
fi

echo "📋 环境检查通过"

# 编译合约
echo "🔨 编译智能合约..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ 合约编译失败"
    exit 1
fi

echo "✅ 合约编译成功"

# 部署合约
echo "🚀 部署合约到 Sepolia 测试网..."
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ 合约部署失败"
    exit 1
fi

echo "✅ 合约部署成功!"
echo ""
echo "📝 下一步操作:"
echo "1. 复制合约地址到 frontend/.env.local 中的 NEXT_PUBLIC_CONTRACT_ADDRESS"
echo "2. 在 Sepolia Etherscan 上验证合约"
echo "3. 启动前端应用进行测试"
echo ""
echo "🔗 Sepolia Etherscan: https://sepolia.etherscan.io/"