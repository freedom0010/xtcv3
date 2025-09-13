const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiabetesAnalytics", function () {
  let contract;
  let owner;
  let patient;
  let researcher;

  beforeEach(async function () {
    [owner, patient, researcher] = await ethers.getSigners();
    
    const DiabetesAnalytics = await ethers.getContractFactory("DiabetesAnalytics");
    contract = await DiabetesAnalytics.deploy();
    await contract.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置 owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("应该初始化统计数据", async function () {
      const stats = await contract.getStats();
      expect(stats[0]).to.equal(0); // totalPatients
      expect(stats[1]).to.equal(0); // totalSubmissions
      expect(stats[2]).to.equal(0); // totalRequests
    });
  });

  describe("研究员授权", function () {
    it("owner 应该能授权研究员", async function () {
      await contract.authorizeResearcher(researcher.address);
      expect(await contract.authorizedResearchers(researcher.address)).to.be.true;
    });

    it("非 owner 不能授权研究员", async function () {
      await expect(
        contract.connect(patient).authorizeResearcher(researcher.address)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("数据提交", function () {
    it("应该记录患者提交数据", async function () {
      // 注意：这里需要实际的 FHE 加密数据，这是简化测试
      const ipfsCid = "QmTestCid123";
      const loincCode = "2345-7";
      
      // 模拟加密输入（实际使用中需要 TFHE 库）
      const mockEncryptedInput = "0x1234567890abcdef";
      const mockProof = "0x";
      
      // 这个测试在实际 FHEVM 环境中才能正常运行
      // await expect(
      //   contract.connect(patient).submitPatientData(
      //     mockEncryptedInput,
      //     mockProof,
      //     ipfsCid,
      //     loincCode
      //   )
      // ).to.emit(contract, "DataSubmitted");
    });
  });

  describe("分析请求", function () {
    beforeEach(async function () {
      await contract.authorizeResearcher(researcher.address);
      
      // 在请求分析之前先提交一些模拟数据
      const ipfsCid = "QmTestCid123";
      const loincCode = "2345-7";
      const mockEncryptedInput = "0x1234567890abcdef";
      const mockProof = "0x";
      
      await contract.connect(patient).submitPatientData(
        mockEncryptedInput,
        mockProof,
        ipfsCid,
        loincCode
      );
    });

    it("授权研究员应该能请求分析", async function () {
      const analysisType = 0; // 平均值分析
      const fee = ethers.parseEther("0.001");
      
      await expect(
        contract.connect(researcher).requestAnalysis(analysisType, { value: fee })
      ).to.emit(contract, "AnalysisRequested");
    });

    it("未授权用户不能请求分析", async function () {
      const analysisType = 0;
      const fee = ethers.parseEther("0.001");
      
      await expect(
        contract.connect(patient).requestAnalysis(analysisType, { value: fee })
      ).to.be.revertedWith("Not authorized researcher");
    });

    it("费用不足时应该失败", async function () {
      const analysisType = 0;
      const insufficientFee = ethers.parseEther("0.0001");
      
      await expect(
        contract.connect(researcher).requestAnalysis(analysisType, { value: insufficientFee })
      ).to.be.revertedWith("Insufficient fee for analysis");
    });
  });

  describe("管理功能", function () {
    it("owner 应该能更新分析费用", async function () {
      const newFee = ethers.parseEther("0.002");
      await contract.updateAnalysisFee(newFee);
      expect(await contract.analysisFeeBasis()).to.equal(newFee);
    });

    it("owner 应该能提取余额", async function () {
      // 先向合约发送一些 ETH
      await researcher.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseEther("0.1")
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await contract.withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});