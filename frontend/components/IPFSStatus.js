import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Database, CheckCircle, AlertCircle, Info } from 'lucide-react'
import filebaseService from '../services/filebaseService'

const IPFSStatus = () => {
  const [status, setStatus] = useState(null)
  const [records, setRecords] = useState([])

  useEffect(() => {
    // 获取服务状态
    const serviceStatus = filebaseService.getServiceStatus()
    setStatus(serviceStatus)

    // 获取所有记录
    const allRecords = filebaseService.getAllPatientRecords()
    setRecords(allRecords)
  }, [])

  if (!status) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <Cloud className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">IPFS 存储状态</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 服务模式 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">服务模式</span>
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

        {/* 存储桶 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">存储桶</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {status.bucketName}
          </span>
        </div>

        {/* 记录数量 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">记录数量</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {status.recordCount} 条
          </span>
        </div>

        {/* 连接状态 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">连接状态</span>
          </div>
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

      {/* 配置提示 */}
      {!status.initialized && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                需要配置 Filebase 凭据
              </h4>
              <p className="text-sm text-yellow-700 mb-2">
                要启用真实的 IPFS 存储，请在 .env.local 文件中配置以下环境变量：
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

      {/* 记录列表 */}
      {records.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            IPFS 记录 ({records.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {records.map((record, index) => (
              <div
                key={record.patientId}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    患者 ID: {record.patientId.substring(0, 8)}...
                  </div>
                  <div className="text-xs text-gray-500">
                    CID: {record.cid.substring(0, 20)}...
                  </div>
                </div>
                {record.ipfsUrl && (
                  <a
                    href={record.ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    查看
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default IPFSStatus