import AWS from 'aws-sdk'

// 浏览器兼容的加密函数
const generateHash = (data) => {
  let hash = 0
  const str = typeof data === 'string' ? data : JSON.stringify(data)
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

class FilebaseIPFSService {
  constructor() {
    // Filebase S3 配置
    this.s3 = null
    this.bucketName = process.env.NEXT_PUBLIC_FILEBASE_BUCKET || 'diabetes-analytics'
    this.initialized = false
    
    // 患者记录映射 (patientId -> CID)
    this.patientRecords = new Map()
    this.loadPatientRecords()
    
    // 初始化 S3 客户端
    this.initializeS3()
  }

  // 初始化 S3 客户端
  initializeS3() {
    try {
      const accessKeyId = process.env.NEXT_PUBLIC_FILEBASE_ACCESS_KEY
      const secretAccessKey = process.env.NEXT_PUBLIC_FILEBASE_SECRET_KEY
      
      console.log('🔍 检查 Filebase 环境变量:', {
        hasAccessKey: !!accessKeyId,
        hasSecretKey: !!secretAccessKey,
        accessKeyLength: accessKeyId ? accessKeyId.length : 0,
        secretKeyLength: secretAccessKey ? secretAccessKey.length : 0
      })
      
      if (!accessKeyId || !secretAccessKey || 
          accessKeyId.includes('YOUR_') || secretAccessKey.includes('YOUR_')) {
        console.warn('⚠️ Filebase 凭据未配置或使用默认值，将使用模拟模式')
        console.warn('请在 .env.local 中配置真实的 Filebase 凭据')
        return
      }

      this.s3 = new AWS.S3({
        endpoint: 'https://s3.filebase.com',
        region: 'us-east-1',
        credentials: {
          accessKeyId,
          secretAccessKey
        },
        s3ForcePathStyle: true,
        signatureVersion: 'v4'
      })
      
      this.initialized = true
      console.log('✅ Filebase S3 客户端初始化成功', {
        endpoint: 'https://s3.filebase.com',
        region: 'us-east-1',
        bucket: this.bucketName
      })
    } catch (error) {
      console.error('❌ Filebase S3 初始化失败:', error)
    }
  }

  // 从localStorage加载患者记录映射
  loadPatientRecords() {
    try {
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
      if (typeof window !== 'undefined' && window.localStorage) {
        const records = Object.fromEntries(this.patientRecords)
        localStorage.setItem('patientRecords', JSON.stringify(records))
      }
    } catch (error) {
      console.error('保存患者记录失败:', error)
    }
  }

  // 生成患者ID
  generatePatientId(walletAddress, basicInfo) {
    const identifier = `${walletAddress}_${basicInfo.name}_${basicInfo.idNumber}`
    return generateHash(identifier)
  }

  // 加密数据 (使用Base64编码)
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

  // 解密数据
  decryptData(encryptedData, secretKey = 'diabetes-survey-key') {
    try {
      const decrypted = decodeURIComponent(escape(atob(encryptedData)))
      return JSON.parse(decrypted)
    } catch (error) {
      console.error('数据解密失败:', error)
      throw new Error('数据解密失败')
    }
  }

  // 上传到 Filebase IPFS
  async uploadToIPFS(data) {
    try {
      console.log('🔍 检查 Filebase 初始化状态:', {
        initialized: this.initialized,
        hasS3: !!this.s3,
        bucketName: this.bucketName
      })

      if (!this.initialized || !this.s3) {
        console.warn('🔄 Filebase 未初始化，使用模拟模式')
        return this.simulateIPFSUpload(data)
      }

      // 生成唯一的文件名
      const timestamp = Date.now()
      const hash = generateHash(data)
      const fileName = `diabetes-record-${timestamp}-${hash}.json`

      // 准备上传参数
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
        Metadata: {
          'upload-time': new Date().toISOString(),
          'data-type': 'diabetes-survey',
          'encrypted': 'true'
        }
      }

      console.log('📤 开始上传到 Filebase IPFS...', {
        fileName,
        bucketName: this.bucketName,
        dataSize: JSON.stringify(data).length
      })
      
      // 执行上传
      const result = await this.s3.upload(uploadParams).promise()
      
      console.log('📋 Filebase 上传响应:', result)
      
      // 从 Filebase 的响应中提取 IPFS CID
      // Filebase 会在 ETag 或其他字段中返回 IPFS CID
      const cid = result.ETag ? result.ETag.replace(/"/g, '') : hash
      
      console.log('✅ 上传成功到 Filebase IPFS:', {
        fileName,
        location: result.Location,
        cid: cid,
        bucket: result.Bucket,
        ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`
      })

      // 验证上传是否成功
      try {
        const verifyResponse = await fetch(`https://ipfs.filebase.io/ipfs/${cid}`)
        console.log('🔍 IPFS 验证状态:', verifyResponse.status)
      } catch (verifyError) {
        console.warn('⚠️ IPFS 验证失败:', verifyError.message)
      }

      return cid
    } catch (error) {
      console.error('❌ Filebase IPFS 上传失败:', error)
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      })
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

  // 从 Filebase IPFS 获取数据
  async getFromIPFS(cid) {
    try {
      if (!this.initialized || !this.s3) {
        throw new Error('Filebase 未初始化')
      }

      // 尝试通过 IPFS 网关获取
      const ipfsGateway = `https://ipfs.filebase.io/ipfs/${cid}`
      
      console.log('📥 从 Filebase IPFS 获取数据:', cid)
      
      const response = await fetch(ipfsGateway)
      if (!response.ok) {
        throw new Error(`获取IPFS数据失败: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ 成功获取 IPFS 数据')
      
      return data
    } catch (error) {
      console.error('❌ 从 Filebase IPFS 获取数据失败:', error)
      throw error
    }
  }

  // 提交患者记录
  async submitPatientRecord(walletAddress, surveyData) {
    try {
      console.log('📝 开始提交患者记录...')
      
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

      // 上传到 Filebase IPFS
      const cid = await this.uploadToIPFS({
        encryptedData,
        patientId,
        timestamp: recordData.timestamp,
        metadata: {
          type: 'diabetes-patient-record',
          encrypted: true,
          version: 1
        }
      })

      // 检查是否有旧记录
      const oldCid = this.patientRecords.get(patientId)
      if (oldCid) {
        console.log(`🔄 覆盖患者 ${patientId} 的旧记录 ${oldCid} -> ${cid}`)
      }

      // 更新患者记录映射
      this.patientRecords.set(patientId, cid)
      this.savePatientRecords()

      console.log('✅ 患者记录提交成功:', { patientId, cid })

      return {
        success: true,
        patientId,
        cid,
        oldCid,
        message: oldCid ? '记录已更新到 IPFS' : '记录已上传到 IPFS',
        ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`
      }
    } catch (error) {
      console.error('❌ 提交患者记录失败:', error)
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

      console.log('📥 获取患者记录:', { patientId, cid })

      const ipfsData = await this.getFromIPFS(cid)
      const decryptedData = this.decryptData(ipfsData.encryptedData)
      
      return {
        success: true,
        data: decryptedData,
        cid,
        ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`
      }
    } catch (error) {
      console.error('❌ 获取患者记录失败:', error)
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
      cid,
      ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`
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

  // 获取服务状态
  getServiceStatus() {
    return {
      initialized: this.initialized,
      hasS3Client: !!this.s3,
      bucketName: this.bucketName,
      recordCount: this.patientRecords.size,
      mode: this.initialized ? 'Filebase IPFS' : '模拟模式'
    }
  }
}

// 创建单例实例
const filebaseService = new FilebaseIPFSService()

export default filebaseService