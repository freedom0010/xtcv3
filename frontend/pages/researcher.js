import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Play, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Users,
  Database,
  Zap,
  Download,
  Eye
} from 'lucide-react'
import Layout from '../components/Layout'
import AnalyticsChart from '../components/AnalyticsChart'
import { useWallet } from '../contexts/WalletContext'
import { useContract } from '../contexts/ContractContext'
import { useToast } from '../contexts/ToastContext'

export default function ResearcherPage() {
  const { t } = useTranslation('common')
  const { account, connectWallet, isSepoliaNetwork } = useWallet()
  const { 
    requestAnalysis, 
    isAuthorizedResearcher, 
    getAnalysisFee, 
    stats, 
    loading 
  } = useContract()
  const { showToast } = useToast()

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [analysisFee, setAnalysisFee] = useState('0')
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null)
  const [selectedFactors, setSelectedFactors] = useState([])
  const [showFactorSelection, setShowFactorSelection] = useState(false)

  // Analysis types with internationalization
  const analysisTypes = [
    {
      id: 0,
      name: t('researcher.analysisTypes.descriptive.name'),
      description: t('researcher.analysisTypes.descriptive.description'),
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      estimatedTime: t('researcher.analysisTypes.descriptive.estimatedTime'),
      factors: [
        t('researcher.factors.age'),
        t('researcher.factors.gender'),
        t('researcher.factors.bloodSugar'),
        t('researcher.factors.bmi'),
        t('researcher.factors.diabetesType')
      ]
    },
    {
      id: 1,
      name: t('researcher.analysisTypes.univariate.name'),
      description: t('researcher.analysisTypes.univariate.description'),
      icon: PieChart,
      color: 'from-purple-500 to-pink-500',
      estimatedTime: t('researcher.analysisTypes.univariate.estimatedTime'),
      factors: [
        t('researcher.factors.ageGroup'),
        t('researcher.factors.gender'),
        t('researcher.factors.diabetesType'),
        t('researcher.factors.bmiGroup'),
        t('researcher.factors.medication'),
        t('researcher.factors.exercise')
      ]
    },
    {
      id: 2,
      name: t('researcher.analysisTypes.logistic.name'),
      description: t('researcher.analysisTypes.logistic.description'),
      icon: TrendingUp,
      color: 'from-green-500 to-teal-500',
      estimatedTime: t('researcher.analysisTypes.logistic.estimatedTime'),
      factors: [
        t('researcher.factors.age'),
        t('researcher.factors.gender'),
        t('researcher.factors.bmi'),
        t('researcher.factors.diabetesType'),
        t('researcher.factors.medicationCompliance'),
        t('researcher.factors.dietControl'),
        t('researcher.factors.exerciseFrequency')
      ]
    },
    {
      id: 3,
      name: t('researcher.analysisTypes.linear.name'),
      description: t('researcher.analysisTypes.linear.description'),
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      estimatedTime: t('researcher.analysisTypes.linear.estimatedTime'),
      factors: [
        t('researcher.factors.ageBloodSugar'),
        t('researcher.factors.bmiBloodSugar'),
        t('researcher.factors.durationBloodSugar'),
        t('researcher.factors.hba1cBloodSugar'),
        t('researcher.factors.dosageBloodSugar')
      ]
    },
    {
      id: 4,
      name: t('researcher.analysisTypes.stratified.name'),
      description: t('researcher.analysisTypes.stratified.description'),
      icon: PieChart,
      color: 'from-indigo-500 to-purple-500',
      estimatedTime: t('researcher.analysisTypes.stratified.estimatedTime'),
      factors: [
        t('researcher.factors.byGender'),
        t('researcher.factors.byAgeGroup'),
        t('researcher.factors.byDiabetesType'),
        t('researcher.factors.byBMI'),
        t('researcher.factors.byMedicationPlan')
      ]
    },
    {
      id: 5,
      name: t('researcher.analysisTypes.correlation.name'),
      description: t('researcher.analysisTypes.correlation.description'),
      icon: TrendingUp,
      color: 'from-teal-500 to-green-500',
      estimatedTime: t('researcher.analysisTypes.correlation.estimatedTime'),
      factors: [
        t('researcher.factors.ageCorrelation'),
        t('researcher.factors.bmiCorrelation'),
        t('researcher.factors.durationCorrelation'),
        t('researcher.factors.lifestyleCorrelation'),
        t('researcher.factors.medicationCorrelation')
      ]
    }
  ]

  // Save analysis history to localStorage
  const saveAnalysisHistory = (newHistory) => {
    setAnalysisHistory(newHistory)
    localStorage.setItem('analysisHistory', JSON.stringify(newHistory))
  }

  // Clear analysis history
  const clearAnalysisHistory = () => {
    setAnalysisHistory([])
    localStorage.removeItem('analysisHistory')
    showToast(t('researcher.messages.historyCleared'), 'success')
  }

  const checkAuthorization = useCallback(async () => {
    try {
      const authorized = await isAuthorizedResearcher()
      setIsAuthorized(authorized)
      if (!authorized) {
        // In test environment, temporarily allow all users to perform analysis
        setIsAuthorized(true)
        showToast(t('researcher.messages.testModeAuth'), 'info')
      }
    } catch (error) {
      console.error('Authorization check failed:', error)
      // If check fails, default to authorized in test environment
      setIsAuthorized(true)
      showToast(t('researcher.messages.testModeAuth'), 'info')
    }
  }, [isAuthorizedResearcher, showToast, t])

  const loadAnalysisFee = useCallback(async () => {
    try {
      const fee = await getAnalysisFee()
      setAnalysisFee(fee)
    } catch (error) {
      console.error('Failed to get analysis fee:', error)
      // Set default fee for testing
      setAnalysisFee('0.001')
    }
  }, [getAnalysisFee])

  const loadAnalysisHistory = async () => {
    // Load analysis history from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedHistory = localStorage.getItem('analysisHistory')
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory)
          setAnalysisHistory(parsedHistory)
        } else {
          // If no saved history, set to empty array
          setAnalysisHistory([])
        }
      }
    } catch (error) {
      console.error('Failed to load analysis history:', error)
      setAnalysisHistory([])
    }
  }

  useEffect(() => {
    if (account) {
      checkAuthorization()
      loadAnalysisFee()
      loadAnalysisHistory()
    }
  }, [account, checkAuthorization, loadAnalysisFee])

  const handleSelectAnalysisType = (analysisType) => {
    console.log('Selected analysis type:', analysisType)
    console.log('Current authorization status:', isAuthorized)
    console.log('Current running status:', isRunningAnalysis)
    setSelectedAnalysisType(analysisType)
    setSelectedFactors([])
    setShowFactorSelection(true)
  }

  // Generate mock analysis results
  const generateMockResults = (analysisType, factors) => {
    const baseResults = {
      analysisDate: new Date().toISOString(),
      factors: factors
    }

    switch (analysisType) {
      case 0: // Descriptive statistics
        return {
          ...baseResults,
          statistics: {
            mean: (Math.random() * 3 + 6).toFixed(2),
            std: (Math.random() * 2 + 1).toFixed(2),
            median: (Math.random() * 3 + 6).toFixed(2),
            min: (Math.random() * 2 + 4).toFixed(2),
            max: (Math.random() * 4 + 10).toFixed(2),
            q1: (Math.random() * 2 + 5).toFixed(2),
            q3: (Math.random() * 3 + 8).toFixed(2)
          }
        }
      case 1: // Univariate analysis
        return {
          ...baseResults,
          pValue: (Math.random() * 0.05).toFixed(4),
          significant: Math.random() > 0.5,
          effectSize: (Math.random() * 0.8 + 0.2).toFixed(3),
          groups: factors.map(factor => ({
            factor,
            mean: (Math.random() * 3 + 6).toFixed(2),
            count: Math.floor(Math.random() * 100) + 20
          }))
        }
      case 2: // Logistic regression
        return {
          ...baseResults,
          oddsRatios: factors.map(factor => ({
            factor,
            or: (Math.random() * 3 + 0.5).toFixed(3),
            ci: `[${(Math.random() * 2 + 0.3).toFixed(2)}, ${(Math.random() * 4 + 1.5).toFixed(2)}]`,
            pValue: (Math.random() * 0.1).toFixed(4)
          })),
          modelFit: {
            auc: (Math.random() * 0.3 + 0.7).toFixed(3),
            accuracy: (Math.random() * 0.2 + 0.75).toFixed(3)
          }
        }
      case 3: // Linear regression
        return {
          ...baseResults,
          coefficients: factors.map(factor => ({
            factor,
            beta: (Math.random() * 2 - 1).toFixed(3),
            se: (Math.random() * 0.5 + 0.1).toFixed(3),
            tValue: (Math.random() * 4 - 2).toFixed(3),
            pValue: (Math.random() * 0.1).toFixed(4)
          })),
          modelFit: {
            rSquared: (Math.random() * 0.6 + 0.2).toFixed(3),
            adjustedR2: (Math.random() * 0.5 + 0.15).toFixed(3),
            fStatistic: (Math.random() * 50 + 10).toFixed(2)
          }
        }
      case 4: // Stratified analysis
        return {
          ...baseResults,
          strata: factors.map(factor => ({
            stratum: factor,
            groups: [
              { name: t('researcher.results.group1'), mean: (Math.random() * 3 + 6).toFixed(2), n: Math.floor(Math.random() * 50) + 20 },
              { name: t('researcher.results.group2'), mean: (Math.random() * 3 + 6).toFixed(2), n: Math.floor(Math.random() * 50) + 20 }
            ],
            pValue: (Math.random() * 0.1).toFixed(4),
            effectSize: (Math.random() * 1.2 + 0.2).toFixed(3)
          }))
        }
      case 5: // Correlation analysis
        return {
          ...baseResults,
          correlations: factors.map(factor => ({
            factor,
            correlation: (Math.random() * 1.6 - 0.8).toFixed(3),
            pValue: (Math.random() * 0.1).toFixed(4),
            significance: Math.random() > 0.3 ? t('researcher.results.significant') : t('researcher.results.notSignificant')
          })),
          matrix: 'correlation_matrix.csv'
        }
      default:
        return baseResults
    }
  }

  const handleFactorToggle = (factor) => {
    setSelectedFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    )
  }

  const handleRunAnalysis = async () => {
    if (!account) {
      await connectWallet()
      return
    }

    if (!isSepoliaNetwork()) {
      showToast(t('researcher.messages.switchToSepolia'), 'error')
      return
    }

    if (!isAuthorized) {
      showToast(t('researcher.messages.noPermission'), 'error')
      return
    }

    if (!selectedAnalysisType) {
      showToast(t('researcher.messages.selectAnalysisType'), 'error')
      return
    }

    if (selectedFactors.length === 0) {
      showToast(t('researcher.messages.selectFactors'), 'error')
      return
    }

    if (parseInt(stats.totalSubmissions) === 0) {
      showToast(t('researcher.messages.noPatientData'), 'warning')
      return
    }

    setIsRunningAnalysis(true)
    showToast(t('researcher.messages.preparingAnalysis'), 'info')
    
    try {
      console.log('Starting analysis request:', {
        analysisType: selectedAnalysisType.id,
        factors: selectedFactors,
        fee: analysisFee
      })
      
      const result = await requestAnalysis(selectedAnalysisType.id)
      
      if (result) {
        showToast(t('researcher.messages.analysisStarted', { name: selectedAnalysisType.name }), 'success')
        
        // Save current analysis information
        const currentAnalysisType = selectedAnalysisType
        const currentFactors = [...selectedFactors]
        const currentFee = analysisFee
        
        // Simulate analysis completion
        setTimeout(() => {
          const newAnalysis = {
            id: Date.now(),
            type: currentAnalysisType.id,
            typeName: currentAnalysisType.name,
            selectedFactors: currentFactors,
            timestamp: Date.now(),
            completed: true,
            resultCid: `QmResult${Math.random().toString(36).substring(2, 15)}`,
            fee: currentFee,
            results: generateMockResults(currentAnalysisType.id, currentFactors)
          }
          const updatedHistory = [newAnalysis, ...analysisHistory]
          saveAnalysisHistory(updatedHistory)
          showToast(t('researcher.messages.analysisCompleted'), 'success')
          setIsRunningAnalysis(false)
          setShowFactorSelection(false)
          setSelectedAnalysisType(null)
          setSelectedFactors([])
        }, Math.random() * 3000 + 2000) // 2-5 seconds
      }
    } catch (error) {
      console.error('Analysis request failed:', error)
      showToast(t('researcher.messages.analysisFailed'), 'error')
      setIsRunningAnalysis(false)
    }
  }

  const handleViewResults = (analysis) => {
    setSelectedAnalysis(analysis)
  }

  const handleDownloadResults = (analysis) => {
    const dataStr = JSON.stringify(analysis.results, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `analysis_${analysis.type}_${new Date(analysis.timestamp).toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    showToast(t('researcher.messages.resultsDownloaded'), 'success')
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔬 {t('researcher.title')}
            </h1>
            <p className="text-xl text-gray-600 text-center mb-12">
              {t('researcher.subtitle')}
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('researcher.stats.totalSubmissions')}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSubmissions || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('researcher.stats.totalAnalyses')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalAnalyses || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('researcher.stats.analysisHistory')}</p>
                  <p className="text-2xl font-bold text-purple-600">{analysisHistory.length}</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('researcher.stats.analysisFee')}</p>
                  <p className="text-2xl font-bold text-orange-600">{analysisFee} ETH</p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </motion.div>

          {/* Analysis Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('researcher.selectAnalysisType')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 cursor-pointer transition-all duration-200 ${
                      selectedAnalysisType?.id === type.id ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:shadow-xl'
                    }`}
                    onClick={() => handleSelectAnalysisType(type)}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {type.estimatedTime}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Factor Selection Modal */}
          {showFactorSelection && selectedAnalysisType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t('researcher.selectFactors')} - {selectedAnalysisType.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{selectedAnalysisType.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    {selectedAnalysisType.factors.map((factor, index) => (
                      <label key={index} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFactors.includes(factor)}
                          onChange={() => handleFactorToggle(factor)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{factor}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      {t('researcher.selectedFactorsCount', { count: selectedFactors.length })}
                    </p>
                    <div className="space-x-3">
                      <button
                        onClick={() => setShowFactorSelection(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={handleRunAnalysis}
                        disabled={selectedFactors.length === 0 || isRunningAnalysis}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {isRunningAnalysis ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{t('researcher.running')}</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span>{t('researcher.runAnalysis')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Analysis History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('researcher.analysisHistory')}</h2>
              {analysisHistory.length > 0 && (
                <button
                  onClick={clearAnalysisHistory}
                  className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  {t('researcher.clearHistory')}
                </button>
              )}
            </div>
            
            {analysisHistory.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('researcher.noAnalysisHistory')}</h3>
                <p className="text-gray-600">{t('researcher.noAnalysisHistoryDesc')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analysisHistory.map((analysis) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <h3 className="text-lg font-semibold text-gray-900">{analysis.typeName}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {t('researcher.completed')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {t('researcher.analysisDate')}: {new Date(analysis.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {t('researcher.selectedFactors')}: {analysis.selectedFactors.join(', ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t('researcher.analysisFee')}: {analysis.fee} ETH
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewResults(analysis)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('researcher.viewResults')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadResults(analysis)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={t('researcher.downloadResults')}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Results Modal */}
          {selectedAnalysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {t('researcher.analysisResults')} - {selectedAnalysis.typeName}
                    </h3>
                    <button
                      onClick={() => setSelectedAnalysis(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('researcher.analysisInfo')}</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p><strong>{t('researcher.analysisType')}:</strong> {selectedAnalysis.typeName}</p>
                        <p><strong>{t('researcher.analysisDate')}:</strong> {new Date(selectedAnalysis.timestamp).toLocaleString()}</p>
                        <p><strong>{t('researcher.selectedFactors')}:</strong> {selectedAnalysis.selectedFactors.join(', ')}</p>
                        <p><strong>{t('researcher.resultCid')}:</strong> {selectedAnalysis.resultCid}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('researcher.analysisResults')}</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedAnalysis.results, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => handleDownloadResults(selectedAnalysis)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>{t('researcher.downloadResults')}</span>
                    </button>
                    <button
                      onClick={() => setSelectedAnalysis(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {t('common.close')}
                    </button>
                  </div>
                </div>
              </motion.div>
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