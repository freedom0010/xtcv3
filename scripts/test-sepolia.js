const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 开始测试Sepolia网络上的DiabetesAnalytics合约...");

  const contractAddress = "0xe2952d5cEcb1CdFC44789C8178777B343e590202";
  
  // 获取合约实例
  const [deployer] = await ethers.getSigners();
  console.log("测试账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 连接到已部署的合约
  const DiabetesAnalytics = await ethers.getContractFactory("DiabetesAnalytics");
  const contract = DiabetesAnalytics.attach(contractAddress);

  console.log("✅ 已连接到合约:", contractAddress);

  // 1. 检查合约基本信息
  console.log("\n📊 检查合约状态...");
  const stats = await contract.getStats();
  console.log("当前统计:", {
    totalPatients: stats[0].toString(),
    totalSubmissions: stats[1].toString(),
    totalRequests: stats[2].toString()
  });

  const analysisFee = await contract.analysisFeeBasis();
  console.log("分析费用:", ethers.formatEther(analysisFee), "ETH");

  const isAuthorized = await contract.authorizedResearchers(deployer.address);
  console.log("部署者是否为授权研究员:", isAuthorized);

  // 2. 测试提交患者数据
  console.log("\n🩺 测试提交患者数据...");
  const mockEncryptedData = "0x" + "1234567890abcdef".repeat(8); // 64字节的模拟加密数据
  const mockProof = "0x" + "abcdef1234567890".repeat(8); // 64字节的模拟证明
  const mockIpfsCid = `QmTestSepolia${Date.now()}`;
  const loincCode = "2345-7";

  try {
    console.log("提交数据到区块链...");
    const submitTx = await contract.submitPatientData(
      mockEncryptedData,
      mockProof,
      mockIpfsCid,
      loincCode,
      {
        gasLimit: 300000 // 设置gas限制
      }
    );
    
    console.log("交易哈希:", submitTx.hash);
    console.log("等待交易确认...");
    const receipt = await submitTx.wait();
    console.log("✅ 数据提交成功！Gas使用:", receipt.gasUsed.toString());

    // 检查事件
    const events = receipt.logs;
    if (events.length > 0) {
      console.log("触发的事件数量:", events.length);
    }

  } catch (error) {
    console.error("❌ 数据提交失败:", error.message);
  }

  // 3. 检查更新后的统计
  console.log("\n📈 检查更新后的统计...");
  const updatedStats = await contract.getStats();
  console.log("更新后统计:", {
    totalPatients: updatedStats[0].toString(),
    totalSubmissions: updatedStats[1].toString(),
    totalRequests: updatedStats[2].toString()
  });

  // 4. 测试分析请求
  if (isAuthorized) {
    console.log("\n🔬 测试分析请求...");
    try {
      const analysisTx = await contract.requestAnalysis(0, { 
        value: analysisFee,
        gasLimit: 200000
      });
      
      console.log("分析请求交易哈希:", analysisTx.hash);
      console.log("等待交易确认...");
      const analysisReceipt = await analysisTx.wait();
      console.log("✅ 分析请求成功！Gas使用:", analysisReceipt.gasUsed.toString());

      // 检查分析请求详情
      const analysisRequest = await contract.getAnalysisRequest(1);
      console.log("分析请求详情:", {
        researcher: analysisRequest[0],
        timestamp: new Date(Number(analysisRequest[1]) * 1000).toLocaleString(),
        completed: analysisRequest[2],
        resultCid: analysisRequest[3],
        fee: ethers.formatEther(analysisRequest[4])
      });

    } catch (error) {
      console.error("❌ 分析请求失败:", error.message);
    }
  }

  // 5. 获取患者提交记录
  console.log("\n📋 检查患者提交记录...");
  const submissionCount = await contract.getPatientSubmissionCount(deployer.address);
  console.log("患者提交数量:", submissionCount.toString());

  if (submissionCount > 0) {
    const patientCids = await contract.getPatientCids(deployer.address);
    console.log("患者IPFS CIDs:", patientCids);
  }

  console.log("\n🎉 Sepolia网络测试完成！");
  console.log("🔗 在Etherscan上查看合约:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("🌐 前端应用现在可以连接到Sepolia网络进行测试");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });