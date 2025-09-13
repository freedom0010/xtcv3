import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Download, Database, CheckCircle, AlertCircle, Cloud } from 'lucide-react'
import filebaseService from '../services/filebaseService'

export default function IPFSTest() {
  const [status, setStatus] = useState(null)
  const [testData, setTestData] = useState('')
  const [uploadResult, setUploadResult] = useState(null)
  const [downloadResult, setDownloadResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 获取服务状态
    const serviceStatus = filebaseService.getServiceStatus()
    setStatus(serviceStatus)
  }, [])

  const handleTestUpload = async () => {
    if (!testData.trim()) {
      alert('请输入测试数据')
      return
    }

    setLoading(true)
    setUploadResult(null)

    try {
      const data = {
        message: testData,
        timestamp: new Date().toISOString(),
        type: 'test-upload'
      }

      const cid = await filebaseService.uploadToIPFS(data)
      
      setUploadResult({
        success: true,
        cid,
        ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`,
        data
      })
    } catch (error) {
      setUploadResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestDownload = async () => {
    if (!uploadResult?.cid) {
      alert('请先上传数据')
      return
    }

    setLoading(true)
    setDownloadResult(null)

    try {
      const data = await filebaseService.getFromIPFS(uploadResult.cid)
      setDownloadResult({
        success: true,
        data
      })
    } catch (error) {
      setDownloadResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Filebase IPFS 测试
          </h1>
          <p className="text-gray-600">
            测试真实的 IPFS 数据上传和下载功能
          </p>
        </motion.div>

        {/* 服务状态 */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">服务状态</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">模式</span>
                </div>
                <div className="flex items-center gap-2">
                  {status.initialized ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-semibold text-gray-800">
                    {status.mode}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">存储桶</div>
                <div className="text-sm font-semibold text-gray-800">
                  {status.bucketName}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">记录数</div>
                <div className="text-sm font-semibold text-gray-800">
                  {status.recordCount}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">连接</div>
                <div className="flex items-center gap-2">
                  {status.hasS3Client ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-semibold text-gray-800">
                    {status.hasS3Client ? '已连接' : '未连接'}
                  </span>
                </div>
              </div>
            </div>

            {!status.initialized && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">
                      配置 Filebase 凭据
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      在 .env.local 文件中添加：
                    </p>
                    <div className="bg-yellow-100 rounded p-2 text-xs font-mono text-yellow-800">
                      NEXT_PUBLIC_FILEBASE_ACCESS_KEY=your_access_key<br/>
                      NEXT_PUBLIC_FILEBASE_SECRET_KEY=your_secret_key<br/>
                      NEXT_PUBLIC_FILEBASE_BUCKET=diabetes-analytics
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 测试上传 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">测试上传</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试数据
              </label>
              <textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="输入要上传到 IPFS 的测试数据..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <button
              onClick={handleTestUpload}
              disabled={loading || !testData.trim()}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  上传到 IPFS
                </>
              )}
            </button>

            {uploadResult && (
              <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {uploadResult.success ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">上传成功！</span>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <div><strong>CID:</strong> {uploadResult.cid}</div>
                      <div>
                        <strong>IPFS URL:</strong> 
                        <a 
                          href={uploadResult.ipfsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:underline"
                        >
                          {uploadResult.ipfsUrl}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">上传失败</span>
                    </div>
                    <div className="text-sm text-red-700">
                      {uploadResult.error}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* 测试下载 */}
        {uploadResult?.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">测试下载</h3>
            </div>

            <button
              onClick={handleTestDownload}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  下载中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  从 IPFS 下载
                </>
              )}
            </button>

            {downloadResult && (
              <div className={`p-4 rounded-lg ${downloadResult.success ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                {downloadResult.success ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">下载成功！</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      <strong>下载的数据:</strong>
                      <pre className="mt-2 bg-blue-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(downloadResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">下载失败</span>
                    </div>
                    <div className="text-sm text-red-700">
                      {downloadResult.error}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}