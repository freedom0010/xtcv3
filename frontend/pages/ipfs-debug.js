import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import filebaseService from '../services/filebaseService'

export default function IPFSDebug() {
  const [serviceStatus, setServiceStatus] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 获取服务状态
    const status = filebaseService.getServiceStatus()
    setServiceStatus(status)
  }, [])

  const handleTestUpload = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const testData = {
        type: 'test-upload',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Hello IPFS!',
          number: Math.random(),
          array: [1, 2, 3, 4, 5]
        }
      }

      console.log('🧪 开始测试上传...')
      const result = await filebaseService.submitPatientRecord('test-wallet-address', {
        name: '测试患者',
        idNumber: 'TEST123456',
        age: 30,
        testData
      })

      setTestResult(result)
      console.log('🧪 测试结果:', result)
    } catch (error) {
      console.error('🧪 测试失败:', error)
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRecords = () => {
    const records = filebaseService.getAllPatientRecords()
    console.log('📋 所有患者记录:', records)
    alert(`当前有 ${records.length} 条记录，详情请查看控制台`)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">IPFS 服务调试页面</h1>

        {/* 服务状态 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">服务状态</h2>
          {serviceStatus && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>初始化状态:</span>
                <span className={serviceStatus.initialized ? 'text-green-600' : 'text-red-600'}>
                  {serviceStatus.initialized ? '✅ 已初始化' : '❌ 未初始化'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>S3 客户端:</span>
                <span className={serviceStatus.hasS3Client ? 'text-green-600' : 'text-red-600'}>
                  {serviceStatus.hasS3Client ? '✅ 已创建' : '❌ 未创建'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>存储桶:</span>
                <span className="text-blue-600">{serviceStatus.bucketName}</span>
              </div>
              <div className="flex justify-between">
                <span>记录数量:</span>
                <span className="text-blue-600">{serviceStatus.recordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>运行模式:</span>
                <span className={serviceStatus.mode === 'Filebase IPFS' ? 'text-green-600' : 'text-yellow-600'}>
                  {serviceStatus.mode}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 环境变量检查 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">环境变量检查</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>ACCESS_KEY:</span>
              <span className={process.env.NEXT_PUBLIC_FILEBASE_ACCESS_KEY?.includes('YOUR_') ? 'text-red-600' : 'text-green-600'}>
                {process.env.NEXT_PUBLIC_FILEBASE_ACCESS_KEY?.includes('YOUR_') ? '❌ 使用默认值' : '✅ 已配置'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>SECRET_KEY:</span>
              <span className={process.env.NEXT_PUBLIC_FILEBASE_SECRET_KEY?.includes('YOUR_') ? 'text-red-600' : 'text-green-600'}>
                {process.env.NEXT_PUBLIC_FILEBASE_SECRET_KEY?.includes('YOUR_') ? '❌ 使用默认值' : '✅ 已配置'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>BUCKET:</span>
              <span className="text-blue-600">{process.env.NEXT_PUBLIC_FILEBASE_BUCKET}</span>
            </div>
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试功能</h2>
          <div className="space-x-4">
            <button
              onClick={handleTestUpload}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? '测试中...' : '测试上传'}
            </button>
            <button
              onClick={handleViewRecords}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              查看记录
            </button>
          </div>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <div className={`p-4 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {testResult.success ? (
                <div>
                  <p className="font-semibold">✅ 上传成功!</p>
                  <p>患者ID: {testResult.patientId}</p>
                  <p>IPFS CID: {testResult.cid}</p>
                  <p>消息: {testResult.message}</p>
                  {testResult.ipfsUrl && (
                    <p>
                      IPFS URL: 
                      <a href={testResult.ipfsUrl} target="_blank" rel="noopener noreferrer" className="underline ml-1">
                        {testResult.ipfsUrl}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-semibold">❌ 上传失败</p>
                  <p>错误: {testResult.error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">配置说明</h3>
          <div className="text-yellow-700 space-y-2">
            <p>1. 如果显示&ldquo;模拟模式&rdquo;，说明 Filebase 凭据未配置</p>
            <p>2. 要使用真实 IPFS 上传，请：</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>访问 <a href="https://console.filebase.com" target="_blank" className="underline">console.filebase.com</a> 注册账户</li>
              <li>创建 Access Key 和 Secret Key</li>
              <li>在 <code className="bg-yellow-200 px-1 rounded">.env.local</code> 中替换占位符</li>
              <li>重启开发服务器</li>
            </ul>
            <p>3. 模拟模式下也会生成 CID，但数据不会真正上传到 IPFS 网络</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}