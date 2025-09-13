// IPFS 客户端工具 - Next.js 兼容版本

class IPFSClient {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.isSimulationMode = true; // 默认使用模拟模式
  }

  async initialize() {
    try {
      // 在浏览器环境中动态导入 ipfs-http-client
      if (typeof window !== 'undefined') {
        const { create } = await import('ipfs-http-client');
        
        // 尝试连接到本地 IPFS 节点
        this.client = create({
          host: 'localhost',
          port: 5001,
          protocol: 'http'
        });

        // 测试连接
        await this.client.id();
        this.initialized = true;
        this.isSimulationMode = false;
        console.log('✅ IPFS 客户端初始化成功');
        return true;
      } else {
        // 服务器端渲染时使用模拟模式
        this.isSimulationMode = true;
        this.initialized = true;
        console.log('🔄 服务器端使用IPFS模拟模式');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ IPFS 初始化失败，启用模拟模式:', error.message);
      this.isSimulationMode = true;
      this.initialized = true;
      return false;
    }
  }

  async uploadData(patientData) {
    if (!this.initialized) {
      await this.initialize();
    }

    // 如果是模拟模式，返回模拟数据
    if (this.isSimulationMode) {
      return this.mockUploadData(patientData);
    }

    try {
      // 准备上传数据
      const dataToUpload = {
        ...patientData,
        uploadTime: new Date().toISOString(),
        version: '1.0',
        dataType: 'encrypted-glucose-data'
      };

      // 转换为 JSON 字符串
      const jsonData = JSON.stringify(dataToUpload, null, 2);
      
      // 上传到 IPFS
      const result = await this.client.add(jsonData, {
        pin: true, // 固定文件
        cidVersion: 1 // 使用 CIDv1
      });

      console.log('✅ 数据已上传到 IPFS:', result.cid.toString());
      return result.cid.toString();
    } catch (error) {
      console.error('❌ IPFS 上传失败:', error);
      // 如果真实上传失败，回退到模拟模式
      return this.mockUploadData(patientData);
    }
  }

  async retrieveData(cid) {
    if (!this.initialized) {
      await this.initialize();
    }

    // 如果是模拟模式，返回模拟数据
    if (this.isSimulationMode) {
      return this.mockRetrieveData(cid);
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ IPFS 数据检索失败:', error);
      // 如果真实检索失败，回退到模拟数据
      return this.mockRetrieveData(cid);
    }
  }

  // 模拟上传函数
  mockUploadData(data) {
    // 模拟网络延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        // 生成模拟的 CID
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        const mockCid = `Qm${timestamp}${random}`.substring(0, 46);
        
        console.log('🔄 模拟上传到 IPFS:', mockCid);
        
        // 在浏览器中存储模拟数据
        if (typeof window !== 'undefined') {
          const storageKey = `ipfs_mock_${mockCid}`;
          const dataToStore = {
            ...data,
            uploadTime: new Date().toISOString(),
            version: '1.0',
            dataType: 'encrypted-glucose-data',
            isSimulated: true
          };
          localStorage.setItem(storageKey, JSON.stringify(dataToStore));
        }
        
        resolve(mockCid);
      }, 1000);
    });
  }

  // 模拟检索函数
  mockRetrieveData(cid) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 尝试从本地存储获取数据
        if (typeof window !== 'undefined') {
          const storageKey = `ipfs_mock_${cid}`;
          const storedData = localStorage.getItem(storageKey);
          
          if (storedData) {
            console.log('🔄 从本地存储检索模拟数据:', cid);
            resolve(JSON.parse(storedData));
            return;
          }
        }
        
        // 如果没有存储数据，返回默认模拟数据
        const mockData = {
          patientId: 'mock-patient-001',
          encryptedData: 'mock-encrypted-data',
          timestamp: Date.now(),
          dataType: 'blood-sugar',
          uploadTime: new Date().toISOString(),
          version: '1.0',
          isSimulated: true
        };
        
        console.log('🔄 返回默认模拟数据:', cid);
        resolve(mockData);
      }, 500);
    });
  }

  async pinData(cid) {
    if (!this.initialized || this.isSimulationMode) {
      console.log('🔄 模拟固定数据:', cid);
      return true;
    }

    try {
      await this.client.pin.add(cid);
      console.log('✅ 数据已固定:', cid);
      return true;
    } catch (error) {
      console.error('❌ 固定数据失败:', error);
      return false;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  getMode() {
    return this.isSimulationMode ? 'simulation' : 'real';
  }

  getStatus() {
    return {
      initialized: this.initialized,
      mode: this.getMode(),
      hasClient: !!this.client
    };
  }
}

// 创建全局实例
const ipfsClient = new IPFSClient();

// 辅助函数
export const initializeIPFS = async () => {
  return await ipfsClient.initialize();
};

export const uploadToIPFS = async (data) => {
  return await ipfsClient.uploadData(data);
};

export const retrieveFromIPFS = async (cid) => {
  return await ipfsClient.retrieveData(cid);
};

export const getIPFSStatus = () => {
  return ipfsClient.getStatus();
};

// 模拟 IPFS 上传 (用于开发测试)
export const mockUploadToIPFS = async (data) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 生成模拟的 CID
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const mockCid = `Qm${timestamp}${random}`.substring(0, 46);
  
  console.log('🔄 模拟上传到 IPFS:', mockCid);
  console.log('上传数据:', data);
  
  return mockCid;
};

// IPFS 网关 URL 生成器
export const getIPFSUrl = (cid, gateway = 'https://ipfs.io/ipfs/') => {
  return `${gateway}${cid}`;
};

// 验证 CID 格式
export const isValidCID = (cid) => {
  // 简单的 CID 格式验证
  const cidRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafy[a-z2-7]{55}$/;
  return cidRegex.test(cid);
};

export { IPFSClient, ipfsClient };