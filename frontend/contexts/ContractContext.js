import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './WalletContext'
import { useToast } from './ToastContext'
import { initializeFHEVM, encryptGlucoseValue, mockEncryptGlucose } from '../utils/fhevm'
import { initializeIPFS, uploadToIPFS, mockUploadToIPFS } from '../utils/ipfs'

const ContractContext = createContext()

export const useContract = () => {
  const context = useContext(ContractContext)
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider')
  }
  return context
}

// 合约 ABI (简化版本，实际使用时需要完整的 ABI)
const CONTRACT_ABI = [
  "function submitPatientData(bytes calldata encryptedGlucose, bytes calldata inputProof, string calldata ipfsCid, string calldata loincCode) external",
  "function requestAnalysis(uint8 analysisType) external payable",
  "function getPatientSubmissionCount(address patient) external view returns (uint256)",
  "function getPatientCids(address patient) external view returns (string[] memory)",
  "function getAnalysisRequest(uint256 requestId) external view returns (address, uint256, bool, string memory, uint256)",
  "function getStats() external view returns (uint256, uint256, uint256)",
  "function authorizedResearchers(address) external view returns (bool)",
  "function analysisFeeBasis() external view returns (uint256)",
  "event DataSubmitted(address indexed patient, string ipfsCid, uint256 timestamp)",
  "event AnalysisRequested(address indexed researcher, uint256 requestId)",
  "event AnalysisCompleted(uint256 indexed requestId, string resultCid)"
]

export const ContractProvider = ({ children }) => {
  const { signer, provider, account, isSepoliaNetwork } = useWallet()
  const { showToast } = useToast()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fhevmReady, setFhevmReady] = useState(false)
  const [ipfsReady, setIpfsReady] = useState(false)
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalSubmissions: 0,
    totalRequests: 0
  })

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

  useEffect(() => {
    if (signer && CONTRACT_ADDRESS && isSepoliaNetwork()) {
      try {
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        setContract(contractInstance)
        loadStats()
        initializeServices()
      } catch (error) {
        console.error('初始化合约失败:', error)
        showToast('合约初始化失败', 'error')
      }
    } else {
      setContract(null)
    }
  }, [signer, CONTRACT_ADDRESS, isSepoliaNetwork])

  const initializeServices = async () => {
    // 初始化 FHEVM
    try {
      const fhevmSuccess = await initializeFHEVM(provider)
      setFhevmReady(fhevmSuccess)
      if (!fhevmSuccess) {
        console.warn('FHEVM 初始化失败，将使用模拟加密')
      }
    } catch (error) {
      console.error('FHEVM 初始化错误:', error)
      setFhevmReady(false)
    }

    // 初始化 IPFS
    try {
      const ipfsSuccess = await initializeIPFS()
      setIpfsReady(ipfsSuccess)
      if (!ipfsSuccess) {
        console.warn('IPFS 初始化失败，将使用模拟上传')
      }
    } catch (error) {
      console.error('IPFS 初始化错误:', error)
      setIpfsReady(false)
    }
  }

  const loadStats = async () => {
    if (!contract) return

    try {
      const stats = await contract.getStats()
      setStats({
        totalPatients: stats[0].toString(),
        totalSubmissions: stats[1].toString(),
        totalRequests: stats[2].toString()
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 患者提交数据
  const submitPatientData = async (glucoseValue, timestamp, notes = '', loincCode = "2345-7") => {
    if (!contract || !account) {
      showToast('请先连接钱包', 'error')
      return false
    }

    setLoading(true)
    try {
      showToast('正在加密数据...', 'info')
      
      // 1. 加密血糖数据
      let encryptedData
      if (fhevmReady) {
        try {
          encryptedData = await encryptGlucoseValue(glucoseValue)
        } catch (error) {
          console.warn('FHEVM 加密失败，使用模拟加密:', error)
          encryptedData = mockEncryptGlucose(glucoseValue)
        }
      } else {
        encryptedData = mockEncryptGlucose(glucoseValue)
      }

      showToast('正在上传到 IPFS...', 'info')
      
      // 2. 准备上传到 IPFS 的数据
      const patientData = {
        bloodGlucose: glucoseValue,
        timestamp: timestamp,
        notes: notes,
        patient: account,
        loincCode: loincCode,
        encryptedGlucose: encryptedData.data,
        encryptionProof: encryptedData.proof
      }

      // 3. 上传到 IPFS
      let ipfsCid
      if (ipfsReady) {
        try {
          ipfsCid = await uploadToIPFS(patientData)
        } catch (error) {
          console.warn('IPFS 上传失败，使用模拟上传:', error)
          ipfsCid = await mockUploadToIPFS(patientData)
        }
      } else {
        ipfsCid = await mockUploadToIPFS(patientData)
      }

      showToast('正在提交到区块链...', 'info')

      // 4. 提交到区块链
      const tx = await contract.submitPatientData(
        encryptedData.data,
        encryptedData.proof,
        ipfsCid,
        loincCode
      )

      const receipt = await tx.wait()

      showToast('数据提交成功！', 'success')
      await loadStats()
      return receipt
    } catch (error) {
      console.error('提交数据失败:', error)
      showToast(`提交失败: ${error.message}`, 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 研究员请求分析
  const requestAnalysis = async (analysisType) => {
    if (!contract || !account) {
      showToast('请先连接钱包', 'error')
      return false
    }

    setLoading(true)
    try {
      const fee = await contract.analysisFeeBasis()
      
      const tx = await contract.requestAnalysis(analysisType, {
        value: fee
      })

      showToast('正在请求分析...', 'info')
      const receipt = await tx.wait()

      showToast('分析请求已提交！', 'success')
      await loadStats()
      return receipt
    } catch (error) {
      console.error('请求分析失败:', error)
      showToast(`请求失败: ${error.message}`, 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 获取患者提交记录
  const getPatientSubmissions = async (patientAddress = account) => {
    if (!contract || !patientAddress) return []

    try {
      const count = await contract.getPatientSubmissionCount(patientAddress)
      const cids = await contract.getPatientCids(patientAddress)
      
      return cids.map((cid, index) => ({
        id: index,
        cid,
        timestamp: Date.now() - (index * 86400000) // 模拟时间戳
      }))
    } catch (error) {
      console.error('获取提交记录失败:', error)
      return []
    }
  }

  // 检查是否为授权研究员
  const isAuthorizedResearcher = async (address = account) => {
    if (!contract || !address) return false

    try {
      return await contract.authorizedResearchers(address)
    } catch (error) {
      console.error('检查研究员权限失败:', error)
      return false
    }
  }

  // 获取分析费用
  const getAnalysisFee = async () => {
    if (!contract) return '0'

    try {
      const fee = await contract.analysisFeeBasis()
      return ethers.formatEther(fee)
    } catch (error) {
      console.error('获取分析费用失败:', error)
      return '0'
    }
  }

  // 获取分析请求详情
  const getAnalysisRequest = async (requestId) => {
    if (!contract) return null

    try {
      const request = await contract.getAnalysisRequest(requestId)
      return {
        researcher: request[0],
        timestamp: request[1].toString(),
        completed: request[2],
        resultCid: request[3],
        fee: ethers.formatEther(request[4])
      }
    } catch (error) {
      console.error('获取分析请求失败:', error)
      return null
    }
  }

  // 监听合约事件
  const listenToEvents = (callback) => {
    if (!contract) return

    const dataSubmittedFilter = contract.filters.DataSubmitted()
    const analysisRequestedFilter = contract.filters.AnalysisRequested()
    const analysisCompletedFilter = contract.filters.AnalysisCompleted()

    contract.on(dataSubmittedFilter, (patient, ipfsCid, timestamp, event) => {
      callback('DataSubmitted', { patient, ipfsCid, timestamp, event })
    })

    contract.on(analysisRequestedFilter, (researcher, requestId, event) => {
      callback('AnalysisRequested', { researcher, requestId, event })
    })

    contract.on(analysisCompletedFilter, (requestId, resultCid, event) => {
      callback('AnalysisCompleted', { requestId, resultCid, event })
    })

    return () => {
      contract.removeAllListeners()
    }
  }

  const value = {
    contract,
    loading,
    stats,
    fhevmReady,
    ipfsReady,
    submitPatientData,
    requestAnalysis,
    getPatientSubmissions,
    isAuthorizedResearcher,
    getAnalysisFee,
    getAnalysisRequest,
    listenToEvents,
    loadStats,
  }

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
}