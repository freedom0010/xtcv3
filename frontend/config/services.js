// 服务配置文件
export const FHEVM_CONFIG = {
  // Sepolia 测试网配置
  chainId: 11155111,
  
  // FHEVM 网关配置
  gatewayUrl: process.env.NEXT_PUBLIC_FHEVM_GATEWAY_URL || 'https://gateway.sepolia.zama.ai',
  
  // 公钥获取端点
  publicKeyEndpoint: '/fhe-keys',
  
  // 是否启用真实加密 (开发时可设为 false 使用模拟)
  enableRealEncryption: process.env.NEXT_PUBLIC_ENABLE_REAL_ENCRYPTION === 'true',
  
  // 加密参数
  encryptionParams: {
    securityLevel: 128,
    polyModulusDegree: 4096
  }
}

export const IPFS_CONFIG = {
  // 本地 IPFS 节点配置
  local: {
    host: 'localhost',
    port: 5001,
    protocol: 'http'
  },
  
  // Infura IPFS 配置
  infura: {
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    projectId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
    projectSecret: process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET
  },
  
  // Pinata 配置 (备选)
  pinata: {
    apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
    secretApiKey: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
    jwt: process.env.NEXT_PUBLIC_PINATA_JWT
  },
  
  // 公共网关列表
  gateways: [
    'https://ipfs.io/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ],
  
  // 是否启用真实上传 (开发时可设为 false 使用模拟)
  enableRealUpload: process.env.NEXT_PUBLIC_ENABLE_REAL_IPFS === 'true',
  
  // 上传配置
  uploadOptions: {
    pin: true,
    cidVersion: 1,
    timeout: 30000 // 30秒超时
  }
}

export const CONTRACT_CONFIG = {
  // 合约地址
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  
  // 支持的网络
  supportedNetworks: {
    11155111: 'Sepolia Testnet',
    1: 'Ethereum Mainnet'
  },
  
  // 默认 Gas 配置
  gasConfig: {
    gasLimit: 500000,
    maxFeePerGas: '20000000000', // 20 gwei
    maxPriorityFeePerGas: '2000000000' // 2 gwei
  }
}

// 健康检查函数
export const checkServiceHealth = async () => {
  const health = {
    fhevm: false,
    ipfs: false,
    contract: false
  }

  // 检查 FHEVM 网关
  try {
    const response = await fetch(`${FHEVM_CONFIG.gatewayUrl}/health`, {
      method: 'GET',
      timeout: 5000
    })
    health.fhevm = response.ok
  } catch (error) {
    console.warn('FHEVM 健康检查失败:', error)
  }

  // 检查 IPFS 连接
  try {
    const response = await fetch(`${IPFS_CONFIG.infura.protocol}://${IPFS_CONFIG.infura.host}:${IPFS_CONFIG.infura.port}/api/v0/version`, {
      method: 'POST',
      timeout: 5000
    })
    health.ipfs = response.ok
  } catch (error) {
    console.warn('IPFS 健康检查失败:', error)
  }

  // 检查合约地址
  health.contract = !!CONTRACT_CONFIG.address

  return health
}

// 获取推荐的服务配置
export const getRecommendedConfig = async () => {
  const health = await checkServiceHealth()
  
  return {
    fhevm: {
      useReal: health.fhevm && FHEVM_CONFIG.enableRealEncryption,
      fallbackToMock: !health.fhevm || !FHEVM_CONFIG.enableRealEncryption
    },
    ipfs: {
      useReal: health.ipfs && IPFS_CONFIG.enableRealUpload,
      fallbackToMock: !health.ipfs || !IPFS_CONFIG.enableRealUpload
    }
  }
}