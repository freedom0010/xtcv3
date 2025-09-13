const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始在本地网络部署 DiabetesAnalytics 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 部署合约
  console.log("\n📦 正在部署合约...");
  const DiabetesAnalytics = await ethers.getContractFactory("DiabetesAnalytics");
  const contract = await DiabetesAnalytics.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ DiabetesAnalytics 合约已部署到:", contractAddress);

  // 验证部署
  console.log("\n📊 验证合约部署...");
  const stats = await contract.getStats();
  console.log("初始统计:", {
    totalPatients: stats[0].toString(),
    totalSubmissions: stats[1].toString(),
    totalRequests: stats[2].toString()
  });

  // 测试基本功能
  console.log("\n🧪 测试基本功能...");
  
  // 测试提交患者数据
  const mockEncryptedData = "0x1234567890abcdef";
  const mockProof = "0xabcdef1234567890";
  const mockIpfsCid = "QmTestCid123456789";
  const loincCode = "2345-7";

  console.log("提交测试数据...");
  const submitTx = await contract.submitPatientData(
    mockEncryptedData,
    mockProof,
    mockIpfsCid,
    loincCode
  );
  await submitTx.wait();
  console.log("✅ 数据提交成功");

  // 检查更新后的统计
  const updatedStats = await contract.getStats();
  console.log("更新后统计:", {
    totalPatients: updatedStats[0].toString(),
    totalSubmissions: updatedStats[1].toString(),
    totalRequests: updatedStats[2].toString()
  });

  // 测试分析请求
  console.log("\n请求分析...");
  const analysisFee = await contract.analysisFeeBasis();
  const analysisTx = await contract.requestAnalysis(0, { value: analysisFee });
  await analysisTx.wait();
  console.log("✅ 分析请求成功");

  // 检查分析请求
  const analysisRequest = await contract.getAnalysisRequest(1);
  console.log("分析请求详情:", {
    researcher: analysisRequest[0],
    timestamp: new Date(Number(analysisRequest[1]) * 1000).toLocaleString(),
    completed: analysisRequest[2],
    resultCid: analysisRequest[3],
    fee: ethers.formatEther(analysisRequest[4])
  });

  // 保存合约地址到环境变量文件
  const fs = require('fs');
  const envContent = `
# 本地部署的合约地址
LOCAL_CONTRACT_ADDRESS=${contractAddress}
NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}
`;
  
  fs.appendFileSync('.env.local', envContent);
  console.log("✅ 合约地址已保存到 .env.local");

  console.log("\n🎉 本地部署和测试完成！");
  console.log("合约地址:", contractAddress);
  console.log("网络: Hardhat 本地网络");
  console.log("\n📝 下一步:");
  console.log("1. 在前端应用中使用此合约地址");
  console.log("2. 确保前端连接到本地网络 (localhost:8545)");
  console.log("3. 或者配置真实的 Sepolia 网络进行部署");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });