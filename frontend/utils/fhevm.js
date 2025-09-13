// FHEVM 客户端工具 - 纯前端版本（避免Node.js依赖）

class FHEVMClient {
  constructor() {
    this.instance = null;
    this.publicKey = null;
    this.initialized = false;
    this.isSimulationMode = true; // 默认使用模拟模式
  }

  async initialize(provider) {
    try {
      // 检查是否在浏览器环境
      if (typeof window === 'undefined') {
        this.isSimulationMode = true;
        this.initialized = true;
        console.log('🔄 服务器端使用FHEVM模拟模式');
        return false;
      }

      // 暂时使用模拟模式，避免fhevmjs的Node.js依赖问题
      console.log('🔄 使用FHEVM模拟模式（避免依赖冲突）');
      this.isSimulationMode = true;
      this.initialized = true;
      
      // 模拟公钥
      this.publicKey = '0x' + '00'.repeat(32);
      
      return true;
    } catch (error) {
      console.warn('⚠️ FHEVM 初始化失败，启用模拟模式:', error.message);
      this.isSimulationMode = true;
      this.initialized = true;
      return false;
    }
  }

  async encryptUint32(value) {
    if (!this.initialized) {
      await this.initialize();
    }

    // 使用模拟加密
    return this.mockEncryptUint32(value);
  }

  async encryptBloodGlucose(glucoseValue) {
    // 验证血糖值范围 (20-600 mg/dL)
    const glucose = parseFloat(glucoseValue);
    if (glucose < 20 || glucose > 600) {
      throw new Error('血糖值必须在 20-600 mg/dL 范围内');
    }

    // 将浮点数转换为整数 (乘以10保留一位小数)
    const intValue = Math.round(glucose * 10);
    
    return await this.encryptUint32(intValue);
  }

  // 高级模拟加密函数
  mockEncryptUint32(value) {
    const numValue = parseInt(value);
    if (numValue < 0 || numValue > 4294967295) {
      throw new Error('值超出 uint32 范围');
    }

    // 生成更真实的模拟加密数据
    const mockData = new Uint8Array(32);
    
    // 使用时间戳和值创建伪随机种子
    const seed = Date.now() + numValue;
    
    // 填充模拟加密数据
    for (let i = 0; i < mockData.length; i++) {
      // 使用简单的线性同余生成器创建伪随机数
      const pseudoRandom = (seed * (i + 1) * 1103515245 + 12345) % 256;
      mockData[i] = pseudoRandom;
    }
    
    // 在前4个字节中嵌入原始值的信息（用于演示）
    const valueBytes = new Uint8Array(4);
    valueBytes[0] = (numValue >> 24) & 0xFF;
    valueBytes[1] = (numValue >> 16) & 0xFF;
    valueBytes[2] = (numValue >> 8) & 0xFF;
    valueBytes[3] = numValue & 0xFF;
    
    // 将值信息混合到加密数据中
    for (let i = 0; i < 4; i++) {
      mockData[i] = mockData[i] ^ valueBytes[i];
    }
    
    // 生成模拟证明
    const proofData = new Uint8Array(64);
    for (let i = 0; i < proofData.length; i++) {
      proofData[i] = ((seed * (i + 5) * 1664525 + 1013904223) % 256);
    }
    
    return {
      data: '0x' + Array.from(mockData).map(b => b.toString(16).padStart(2, '0')).join(''),
      proof: '0x' + Array.from(proofData).map(b => b.toString(16).padStart(2, '0')).join(''),
      isSimulated: true,
      originalValue: numValue, // 仅用于调试，实际加密中不会包含
      timestamp: Date.now()
    };
  }

  // 模拟解密函数（仅用于演示，实际FHE不支持客户端解密）
  mockDecryptUint32(encryptedData) {
    if (!encryptedData.isSimulated || !encryptedData.originalValue) {
      throw new Error('只能解密模拟数据');
    }
    return encryptedData.originalValue;
  }

  getPublicKey() {
    return this.publicKey || '0x' + '00'.repeat(32);
  }

  isInitialized() {
    return this.initialized;
  }

  getMode() {
    return 'simulation';
  }

  getStatus() {
    return {
      initialized: this.initialized,
      mode: this.getMode(),
      hasInstance: false, // 当前版本不使用真实实例
      hasPublicKey: !!this.publicKey,
      note: '当前使用模拟模式以避免依赖冲突'
    };
  }

  // 批量加密多个值
  async encryptBatch(values) {
    const results = [];
    for (const value of values) {
      results.push(await this.encryptUint32(value));
    }
    return results;
  }

  // 验证加密数据格式
  validateEncryptedData(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'object') {
      return false;
    }
    
    if (!encryptedData.data || !encryptedData.proof) {
      return false;
    }
    
    // 验证十六进制格式
    const hexRegex = /^0x[0-9a-fA-F]+$/;
    return hexRegex.test(encryptedData.data) && hexRegex.test(encryptedData.proof);
  }
}

// 创建全局实例
const fhevmClient = new FHEVMClient();

// 导出函数
export const initializeFHEVM = async (provider) => {
  return await fhevmClient.initialize(provider);
};

export const encryptGlucoseValue = async (value) => {
  return await fhevmClient.encryptBloodGlucose(value);
};

export const getFHEVMStatus = () => {
  return fhevmClient.getStatus();
};

export const validateEncryptedData = (data) => {
  return fhevmClient.validateEncryptedData(data);
};

// 模拟加密函数 (用于开发测试)
export const mockEncryptGlucose = (value) => {
  const glucose = parseFloat(value);
  if (glucose < 20 || glucose > 600) {
    throw new Error('血糖值必须在 20-600 mg/dL 范围内');
  }

  // 将浮点数转换为整数 (乘以10保留一位小数)
  const intValue = Math.round(glucose * 10);
  return fhevmClient.mockEncryptUint32(intValue);
};

// 批量处理函数
export const encryptGlucoseBatch = async (values) => {
  const intValues = values.map(v => Math.round(parseFloat(v) * 10));
  return await fhevmClient.encryptBatch(intValues);
};

// 工具函数
export const generateMockPatientData = (patientId, glucoseReadings) => {
  return {
    patientId,
    readings: glucoseReadings.map((glucose, index) => ({
      id: `reading_${index + 1}`,
      timestamp: Date.now() - (glucoseReadings.length - index - 1) * 3600000, // 每小时一个读数
      originalValue: glucose,
      encryptedValue: mockEncryptGlucose(glucose)
    })),
    createdAt: Date.now(),
    dataType: 'glucose-monitoring'
  };
};

export { FHEVMClient, fhevmClient };