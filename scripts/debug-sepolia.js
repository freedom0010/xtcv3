const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 调试Sepolia网络上的合约问题...");

  const contractAddress = "0xe2952d5cEcb1CdFC44789C8178777B343e590202";
  
  // 获取合约实例
  const [deployer] = await ethers.getSigners();
  console.log("测试账户:", deployer.address);

  // 连接到已部署的合约
  const DiabetesAnalytics = await ethers.getContractFactory("DiabetesAnalytics");
  const contract = DiabetesAnalytics.attach(contractAddress);

  console.log("✅ 已连接到合约:", contractAddress);

  // 1. 检查合约基本信息
  console.log("\n📊 检查合约状态...");
  try {
    const stats = await contract.getStats();
    console.log("当前统计:", {
      totalPatients: stats[0].toString(),
      totalSubmissions: stats[1].toString(),
      totalRequests: stats[2].toString()
    });

    const owner = await contract.owner();
    console.log("合约所有者:", owner);
    console.log("当前账户:", deployer.address);
    console.log("是否为所有者:", owner.toLowerCase() === deployer.address.toLowerCase());

  } catch (error) {
    console.error("❌ 获取基本信息失败:", error.message);
  }

  // 2. 测试简单的数据提交（使用更小的数据）
  console.log("\n🩺 测试简单数据提交...");
  try {
    const mockEncryptedData = "0x1234567890abcdef1234567890abcdef"; // 16字节
    const mockProof = "0xabcdef1234567890abcdef1234567890"; // 16字节
    const mockIpfsCid = "QmTest123";
    const loincCode = "2345-7";

    console.log("准备提交数据:");
    console.log("- 加密数据长度:", mockEncryptedData.length);
    console.log("- 证明长度:", mockProof.length);
    console.log("- IPFS CID:", mockIpfsCid);

    // 先估算gas
    try {
      const gasEstimate = await contract.submitPatientData.estimateGas(
        mockEncryptedData,
        mockProof,
        mockIpfsCid,
        loincCode
      );
      console.log("预估Gas:", gasEstimate.toString());
    } catch (gasError) {
      console.error("❌ Gas估算失败:", gasError.message);
      
      // 尝试调用静态方法来获取更详细的错误信息
      try {
        await contract.submitPatientData.staticCall(
          mockEncryptedData,
          mockProof,
          mockIpfsCid,
          loincCode
        );
      } catch (staticError) {
        console.error("❌ 静态调用失败:", staticError.message);
        
        // 检查具体的revert原因
        if (staticError.message.includes("IPFS CID cannot be empty")) {
          console.log("💡 问题: IPFS CID为空");
        } else if (staticError.message.includes("Encrypted data cannot be empty")) {
          console.log("💡 问题: 加密数据为空");
        } else {
          console.log("💡 其他问题:", staticError.message);
        }
      }
      return;
    }

    // 如果gas估算成功，尝试实际提交
    const submitTx = await contract.submitPatientData(
      mockEncryptedData,
      mockProof,
      mockIpfsCid,
      loincCode,
      {
        gasLimit: 500000 // 增加gas限制
      }
    );
    
    console.log("交易哈希:", submitTx.hash);
    const receipt = await submitTx.wait();
    console.log("✅ 数据提交成功！Gas使用:", receipt.gasUsed.toString());

  } catch (error) {
    console.error("❌ 数据提交失败:", error.message);
    
    // 尝试解析具体错误
    if (error.receipt) {
      console.log("交易状态:", error.receipt.status);
      console.log("Gas使用:", error.receipt.gasUsed.toString());
    }
  }

  // 3. 测试分析请求（只有在有数据时）
  console.log("\n🔬 检查分析请求条件...");
  try {
    const totalSubmissions = await contract.totalSubmissions();
    console.log("总提交数:", totalSubmissions.toString());
    
    if (totalSubmissions > 0) {
      console.log("尝试分析请求...");
      const analysisFee = await contract.analysisFeeBasis();
      
      const analysisTx = await contract.requestAnalysis(0, { 
        value: analysisFee,
        gasLimit: 300000
      });
      
      const analysisReceipt = await analysisTx.wait();
      console.log("✅ 分析请求成功！");
    } else {
      console.log("⚠️ 没有数据可供分析，跳过分析请求测试");
    }

  } catch (error) {
    console.error("❌ 分析请求失败:", error.message);
  }

  console.log("\n🎯 调试完成！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 调试失败:", error);
    process.exit(1);
  });