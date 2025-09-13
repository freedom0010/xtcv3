const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 DiabetesAnalytics 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 部署合约
  const DiabetesAnalytics = await ethers.getContractFactory("DiabetesAnalytics");
  const contract = await DiabetesAnalytics.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ DiabetesAnalytics 合约已部署到:", contractAddress);
  console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

  // 验证部署
  console.log("\n📊 验证合约部署...");
  const stats = await contract.getStats();
  console.log("初始统计:", {
    totalPatients: stats[0].toString(),
    totalSubmissions: stats[1].toString(),
    totalRequests: stats[2].toString()
  });

  // 保存合约地址到环境变量文件
  const fs = require('fs');
  const envContent = `
# 更新后的合约地址
DIABETES_CONTRACT_ADDRESS=${contractAddress}
NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}
`;
  
  fs.appendFileSync('.env.local', envContent);
  console.log("✅ 合约地址已保存到 .env.local");

  console.log("\n🎉 部署完成！");
  console.log("请将以下地址添加到前端配置:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });