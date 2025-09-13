// 浏览器兼容的加密函数
const generateHash = (data) => {
  // 简单的哈希函数，用于演示
  let hash = 0
  const str = typeof data === 'string' ? data : JSON.stringify(data)
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash).toString(16)
}

class IPFSService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    this.uploadUrl = process.env.NEXT_PUBLIC_IPFS_UPLOAD_URL || 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
    this.apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
    this.secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY
    
    // 患者记录映射 (patientId -> CID)
    this.patientRecords = new Map()
    this.loadPatientRecords()
  }

  // 从localStorage加载患者记录映射
  loadPatientRecords() {
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('patientRecords')
        if (saved) {
          const records = JSON.parse(saved)
          this.patientRecords = new Map(Object.entries(records))
        }
      }
    } catch (error) {
      console.error('加载患者记录失败:', error)
    }
  }

  // 保存患者记录映射到localStorage
  savePatientRecords() {
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        const records = Object.fromEntries(this.patientRecords)
        localStorage.setItem('patientRecords', JSON.stringify(records))
      }
    } catch (error) {
      console.error('保存患者记录失败:', error)
    }
  }

  // 生成患者ID (基于钱包地址和基本信息)
  generatePatientId(walletAddress, basicInfo) {
    const identifier = `${walletAddress}_${basicInfo.name}_${basicInfo.idNumber}`
    return generateHash(identifier)
  }

  // 加密数据 (简化版本，使用Base64编码)
  encryptData(data, secretKey = 'diabetes-survey-key') {
    try {
      const jsonString = JSON.stringify(data)
      const encrypted = btoa(unescape(encodeURIComponent(jsonString)))
      return encrypted
    } catch (error) {
      console.error('数据加密失败:', error)
      throw new Error('数据加密失败')
    }
  }

  // 解密数据 (简化版本，使用Base64解码)
  decryptData(encryptedData, secretKey = 'diabetes-survey-key') {
    try {
      const decrypted = decodeURIComponent(escape(atob(encryptedData)))
      return JSON.parse(decrypted)
    } catch (error) {
      console.error('数据解密失败:', error)
      throw new Error('数据解密失败')
    }
  }

  // 上传到IPFS (使用Pinata服务)
  async uploadToIPFS(data) {
    try {
      // 如果没有配置Pinata，使用模拟模式
      if (!this.apiKey || !this.secretKey) {
        console.warn('未配置IPFS服务，使用模拟模式')
        return this.simulateIPFSUpload(data)
      }

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        },
        body: JSON.stringify({
          pinataContent: data,
          pinataMetadata: {
            name: `diabetes-record-${Date.now()}`,
            keyvalues: {
              type: 'diabetes-survey',
              timestamp: new Date().toISOString()
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error(`IPFS上传失败: ${response.statusText}`)
      }

      const result = await response.json()
      return result.IpfsHash
    } catch (error) {
      console.error('IPFS上传错误:', error)
      // 降级到模拟模式
      return this.simulateIPFSUpload(data)
    }
  }

  // 模拟IPFS上传
  simulateIPFSUpload(data) {
    const hash = generateHash(data).padEnd(44, '0').substring(0, 44)
    const cid = `Qm${hash}`
    console.log('🔄 模拟IPFS上传:', cid)
    return cid
  }

  // 从IPFS获取数据
  async getFromIPFS(cid) {
    try {
      const response = await fetch(`${this.baseUrl}${cid}`)
      if (!response.ok) {
        throw new Error(`获取IPFS数据失败: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('IPFS获取错误:', error)
      throw error
    }
  }

  // 提交患者记录
  async submitPatientRecord(walletAddress, surveyData) {
    try {
      // 生成患者ID
      const patientId = this.generatePatientId(walletAddress, {
        name: surveyData.name,
        idNumber: surveyData.idNumber
      })

      // 准备上传数据
      const recordData = {
        patientId,
        walletAddress,
        surveyData,
        timestamp: new Date().toISOString(),
        version: 1
      }

      // 加密数据
      const encryptedData = this.encryptData(recordData)

      // 上传到IPFS
      const cid = await this.uploadToIPFS({
        encryptedData,
        patientId,
        timestamp: recordData.timestamp
      })

      // 检查是否有旧记录
      const oldCid = this.patientRecords.get(patientId)
      if (oldCid) {
        console.log(`🔄 覆盖患者 ${patientId} 的旧记录 ${oldCid} -> ${cid}`)
      }

      // 更新患者记录映射
      this.patientRecords.set(patientId, cid)
      this.savePatientRecords()

      return {
        success: true,
        patientId,
        cid,
        oldCid,
        message: oldCid ? '记录已更新' : '记录已创建'
      }
    } catch (error) {
      console.error('提交患者记录失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取患者记录
  async getPatientRecord(patientId) {
    try {
      const cid = this.patientRecords.get(patientId)
      if (!cid) {
        throw new Error('未找到患者记录')
      }

      const ipfsData = await this.getFromIPFS(cid)
      const decryptedData = this.decryptData(ipfsData.encryptedData)
      
      return {
        success: true,
        data: decryptedData,
        cid
      }
    } catch (error) {
      console.error('获取患者记录失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取所有患者记录列表
  getAllPatientRecords() {
    return Array.from(this.patientRecords.entries()).map(([patientId, cid]) => ({
      patientId,
      cid
    }))
  }

  // 删除患者记录
  deletePatientRecord(patientId) {
    const deleted = this.patientRecords.delete(patientId)
    if (deleted) {
      this.savePatientRecords()
    }
    return deleted
  }
}

// 创建单例实例
const ipfsService = new IPFSService()

export default ipfsService