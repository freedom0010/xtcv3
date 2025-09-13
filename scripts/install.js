#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始安装 Diabetes Analytics DApp...\n');

// 检查 Node.js 版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ 需要 Node.js 16 或更高版本');
  process.exit(1);
}

console.log(`✅ Node.js 版本: ${nodeVersion}`);

// 安装根目录依赖
console.log('\n📦 安装根目录依赖...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 根目录依赖安装完成');
} catch (error) {
  console.error('❌ 根目录依赖安装失败:', error.message);
  process.exit(1);
}

// 安装前端依赖
console.log('\n📦 安装前端依赖...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ 前端依赖安装完成');
} catch (error) {
  console.error('❌ 前端依赖安装失败:', error.message);
  process.exit(1);
}

// 创建环境变量文件
console.log('\n⚙️  设置环境变量...');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envExamplePath) && !fs.existsSync(envPath)) {
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ 已创建 .env 文件');
    console.log('⚠️  请编辑 .env 文件并填入正确的配置值');
  } catch (error) {
    console.error('❌ 创建 .env 文件失败:', error.message);
  }
} else if (fs.existsSync(envPath)) {
  console.log('✅ .env 文件已存在');
} else {
  console.log('⚠️  未找到 .env.example 文件');
}

// 编译合约
console.log('\n🔨 编译智能合约...');
try {
  execSync('npm run compile', { stdio: 'inherit' });
  console.log('✅ 合约编译完成');
} catch (error) {
  console.error('❌ 合约编译失败:', error.message);
  console.log('⚠️  请检查合约代码或稍后手动编译');
}

// 检查服务可用性
console.log('\n🔍 检查服务可用性...');

// 检查 IPFS
try {
  const { execSync: execSyncQuiet } = require('child_process');
  execSyncQuiet('ipfs version', { stdio: 'pipe' });
  console.log('✅ 本地 IPFS 节点可用');
} catch (error) {
  console.log('⚠️  本地 IPFS 节点不可用，将使用远程网关');
}

// 显示下一步操作
console.log('\n🎉 安装完成！\n');
console.log('📋 下一步操作:');
console.log('1. 编辑 .env 文件，填入正确的配置值');
console.log('2. 如果需要部署合约: npm run deploy');
console.log('3. 启动开发服务器: npm run dev');
console.log('4. 在浏览器中访问: http://localhost:3000\n');

console.log('📚 重要说明:');
console.log('- 确保连接到 Sepolia 测试网');
console.log('- 获取一些测试 ETH 用于交易');
console.log('- FHEVM 和 IPFS 功能在开发模式下使用模拟实现');
console.log('- 生产环境需要配置真实的服务端点\n');

console.log('🔗 有用的链接:');
console.log('- Sepolia 水龙头: https://sepoliafaucet.com/');
console.log('- FHEVM 文档: https://docs.zama.ai/fhevm');
console.log('- IPFS 文档: https://docs.ipfs.tech/\n');

console.log('✨ 祝您开发愉快！');