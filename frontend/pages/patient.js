import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { 
  Upload, 
  Heart, 
  Calendar, 
  Activity, 
  FileText, 
  CheckCircle,
  Clock,
  Database,
  Shield,
  Plus,
  User
} from 'lucide-react'
import Layout from '../components/Layout'
import DiabetesSurvey from '../components/DiabetesSurvey'
import filebaseService from '../services/filebaseService'
import { useWallet } from '../contexts/WalletContext'
import IPFSStatus from '../components/IPFSStatus'
import { useContract } from '../contexts/ContractContext'
import { useToast } from '../contexts/ToastContext'

export default function PatientPage() {
  const { t } = useTranslation('common')
  const { account, connectWallet, isSepoliaNetwork } = useWallet()
  const { submitPatientData, getPatientSubmissions, loading, fhevmReady, ipfsReady } = useContract()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('survey')
  const [submissions, setSubmissions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipfsRecords, setIpfsRecords] = useState([])

  // 血糖数据表单
  const [glucoseData, setGlucoseData] = useState({
    bloodGlucose: '',
    timestamp: new Date().toISOString().slice(0, 16),
    notes: ''
  })

  const loadSubmissions = useCallback(async () => {
    try {
      const data = await getPatientSubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error('加载提交记录失败:', error)
    }
  }, [getPatientSubmissions])

  useEffect(() => {
    if (account) {
      loadSubmissions()
      loadIpfsRecords()
    }
  }, [account, loadSubmissions])

  const loadIpfsRecords = async () => {
    try {
      const records = filebaseService.getAllPatientRecords()
      setIpfsRecords(records)
      console.log('📋 加载IPFS记录:', records)
    } catch (error) {
      console.error('加载IPFS记录失败:', error)
    }
  }

  const handleGlucoseInputChange = (e) => {
    const { name, value } = e.target
    setGlucoseData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateGlucoseForm = () => {
    const glucose = parseFloat(glucoseData.bloodGlucose)
    
    if (!glucose || glucose < 20 || glucose > 600) {
      showToast('请输入有效的血糖值 (20-600 mg/dL)', 'error')
      return false
    }
    
    if (!glucoseData.timestamp) {
      showToast('请选择测量时间', 'error')
      return false
    }
    
    return true
  }

  const handleGlucoseSubmit = async (e) => {
    e.preventDefault()
    
    if (!account) {
      await connectWallet()
      return
    }

    if (!isSepoliaNetwork()) {
      showToast('请切换到 Sepolia 测试网', 'error')
      return
    }

    if (!validateGlucoseForm()) return

    setIsSubmitting(true)
    
    try {
      showToast('正在提交血糖数据...', 'info')
      
      // 1. 首先上传到 IPFS
      const ipfsResult = await filebaseService.submitPatientRecord(account, {
        bloodGlucose: glucoseData.bloodGlucose,
        timestamp: glucoseData.timestamp,
        notes: glucoseData.notes,
        dataType: 'blood-glucose',
        submittedAt: new Date().toISOString()
      })
      
      if (!ipfsResult.success) {
        throw new Error(`IPFS上传失败: ${ipfsResult.error}`)
      }
      
      showToast(`血糖数据已上传到IPFS: ${ipfsResult.cid.substring(0, 10)}...`, 'success')
      
      // 2. 然后提交到区块链（包含IPFS CID）
      const result = await submitPatientData(
        glucoseData.bloodGlucose,
        glucoseData.timestamp,
        JSON.stringify({
          dataType: 'blood-glucose',
          ipfsCid: ipfsResult.cid,
          patientId: ipfsResult.patientId,
          notes: glucoseData.notes,
          submittedAt: new Date().toISOString(),
          ipfsUrl: ipfsResult.ipfsUrl
        })
      )
      
      if (result) {
        setGlucoseData({
          bloodGlucose: '',
          timestamp: new Date().toISOString().slice(0, 16),
          notes: ''
        })
        await loadSubmissions()
        showToast('血糖数据提交成功！数据已安全存储到IPFS和区块链', 'success')
      }
    } catch (error) {
      console.error('提交失败:', error)
      showToast('提交失败，请重试', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSurveySubmit = async (surveyData) => {
    if (!account) {
      await connectWallet()
      return
    }

    if (!isSepoliaNetwork()) {
      showToast('请切换到 Sepolia 测试网', 'error')
      return
    }

    setIsSubmitting(true)
    
    try {
      showToast('正在提交调查问卷...', 'info')
      
      // 1. 首先上传到 IPFS
      const ipfsResult = await filebaseService.submitPatientRecord(account, {
        ...surveyData,
        dataType: 'comprehensive-survey',
        submittedAt: new Date().toISOString()
      })
      
      if (!ipfsResult.success) {
        throw new Error(`IPFS上传失败: ${ipfsResult.error}`)
      }
      
      showToast(`调查问卷已上传到IPFS: ${ipfsResult.cid.substring(0, 10)}...`, 'success')
      
      // 2. 然后提交到区块链（包含IPFS CID）
      const result = await submitPatientData(
        surveyData.age || 25, // 使用年龄作为数值
        new Date().toISOString(),
        JSON.stringify({
          dataType: 'comprehensive-survey',
          ipfsCid: ipfsResult.cid,
          patientId: ipfsResult.patientId,
          submittedAt: new Date().toISOString(),
          ipfsUrl: ipfsResult.ipfsUrl
        })
      )
      
      if (result) {
        showToast('调查问卷提交成功！数据已安全存储到IPFS和区块链', 'success')
        await loadSubmissions()
        await loadIpfsRecords() // 刷新IPFS记录列表
      }
    } catch (error) {
      console.error('提交失败:', error)
      showToast('提交失败，请重试', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGlucoseLevel = (value) => {
    const glucose = parseFloat(value)
    if (glucose < 70) return { level: '低血糖', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (glucose <= 140) return { level: '正常', color: 'text-green-600', bg: 'bg-green-100' }
    return { level: '高血糖', color: 'text-red-600', bg: 'bg-red-100' }
  }

  if (!account) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{t('patient.title')}</h1>
            <p className="text-xl text-gray-600 mb-8">{t('errors.walletNotConnected')}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectWallet}
              className="btn-primary"
            >
              {t('buttons.connectWallet')}
            </motion.button>
          </motion.div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('patient.title')}</h1>
          <p className="text-xl text-gray-600">{t('patient.subtitle')}</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-200">
            <button
              onClick={() => setActiveTab('survey')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'survey'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span>{t('survey.title')}</span>
            </button>
            <button
              onClick={() => setActiveTab('glucose')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'glucose'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>{t('patient.dataSubmission')}</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'history'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>{t('patient.submissionHistory')}</span>
            </button>
            <button
              onClick={() => setActiveTab('ipfs')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'ipfs'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Database className="w-5 h-5" />
              <span>{t('ipfs.title')}</span>
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* 健康调查问卷 */}
          {activeTab === 'survey' && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <DiabetesSurvey 
                onSubmit={handleSurveySubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}

          {/* 血糖数据上传 */}
          {activeTab === 'glucose' && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="medical-card"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Upload className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">上传血糖数据</h2>
              </div>

              <form onSubmit={handleGlucoseSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    血糖值 (mg/dL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="bloodGlucose"
                      value={glucoseData.bloodGlucose}
                      onChange={handleGlucoseInputChange}
                      placeholder="请输入血糖值 (20-600)"
                      min="20"
                      max="600"
                      step="0.1"
                      className="input-field pr-20"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {glucoseData.bloodGlucose && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGlucoseLevel(glucoseData.bloodGlucose).bg} ${getGlucoseLevel(glucoseData.bloodGlucose).color}`}>
                        {getGlucoseLevel(glucoseData.bloodGlucose).level}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    测量时间
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="timestamp"
                      value={glucoseData.timestamp}
                      onChange={handleGlucoseInputChange}
                      className="input-field pr-12"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注 (可选)
                  </label>
                  <textarea
                    name="notes"
                    value={glucoseData.notes}
                    onChange={handleGlucoseInputChange}
                    placeholder="记录测量时的情况，如餐前/餐后、运动情况等"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-1">隐私保护</h4>
                      <p className="text-sm text-blue-700">
                        您的数据将使用 FHEVM 同态加密技术进行加密，确保在整个分析过程中数据始终保持加密状态，完全保护您的隐私。
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${fhevmReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className={fhevmReady ? 'text-green-700' : 'text-yellow-700'}>
                            FHEVM {fhevmReady ? '已连接' : '模拟模式'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${ipfsReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className={ipfsReady ? 'text-green-700' : 'text-yellow-700'}>
                            IPFS {ipfsReady ? '已连接' : '模拟模式'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting || loading}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`
                    w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200
                    ${isSubmitting || loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isSubmitting || loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>正在提交...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>加密并上传数据</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* 提交记录 */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="medical-card"
            >
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">我的提交记录</h2>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">暂无提交记录</p>
                  <p className="text-gray-400 text-sm mt-2">上传您的第一条健康数据吧！</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {submissions.map((submission, index) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-gray-800">数据已提交</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(submission.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-1">IPFS CID:</div>
                        <div className="font-mono text-xs text-blue-600 break-all">
                          {submission.cid}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">数据安全保障</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 所有数据使用同态加密技术保护</li>
                  <li>• 原始数据存储在去中心化 IPFS 网络</li>
                  <li>• 链上仅保存加密结果和访问凭证</li>
                  <li>• 您始终拥有数据的完全控制权</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* IPFS记录历史 */}
          {activeTab === 'ipfs' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Database className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">IPFS加密记录</h3>
              </div>

              {ipfsRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">暂无IPFS记录</p>
                  <p className="text-gray-400">提交健康调查问卷后，记录将显示在这里</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ipfsRecords.map((record, index) => (
                    <motion.div
                      key={record.patientId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-gray-800">加密记录</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Database className="w-4 h-4" />
                          <span>IPFS存储</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm text-gray-600 mb-1">患者ID:</div>
                          <div className="font-mono text-xs text-blue-600 break-all">
                            {record.patientId}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm text-gray-600 mb-1">IPFS CID:</div>
                          <div className="font-mono text-xs text-green-600 break-all">
                            {record.cid}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Shield className="w-4 h-4" />
                            <span>AES加密</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Database className="w-4 h-4" />
                            <span>去中心化存储</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(record.cid)
                            showToast('CID已复制到剪贴板', 'success')
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          复制CID
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">IPFS存储优势</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 去中心化存储，无单点故障风险</li>
                  <li>• 内容寻址，数据完整性自动验证</li>
                  <li>• 全球分布式网络，高可用性保障</li>
                  <li>• 同一患者记录自动覆盖，避免重复</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}