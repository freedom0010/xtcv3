import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Heart, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import Layout from '../components/Layout'
import DiabetesSurvey from '../components/DiabetesSurvey'
import { useWallet } from '../contexts/WalletContext'
import { useContract } from '../contexts/ContractContext'
import { useToast } from '../contexts/ToastContext'
import filebaseService from '../services/filebaseService'

export default function SurveyPage() {
  const { t } = useTranslation('common')
  const { account, connectWallet, isSepoliaNetwork } = useWallet()
  const { submitPatientData, loading, fhevmReady, ipfsReady } = useContract()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSurveySubmit = async (surveyData) => {
    if (!account) {
      await connectWallet()
      return
    }

    if (!isSepoliaNetwork()) {
      showToast(t('survey.messages.switchToSepolia'), 'error')
      return
    }

    setIsSubmitting(true)
    
    try {
      showToast(t('survey.messages.submittingData'), 'info')
      
      // 1. First upload to IPFS
      const ipfsResult = await filebaseService.submitPatientRecord(account, {
        ...surveyData,
        dataType: 'diabetes-survey',
        submittedAt: new Date().toISOString()
      })
      
      if (!ipfsResult.success) {
        throw new Error(`${t('survey.messages.ipfsUploadFailed')}: ${ipfsResult.error}`)
      }
      
      showToast(`${t('survey.messages.dataUploadedToIPFS')}: ${ipfsResult.cid.substring(0, 10)}...`, 'success')
      
      // 2. Then submit to blockchain (including IPFS CID)
      const result = await submitPatientData(
        surveyData.bloodSugar || 100, // Use blood sugar value as numeric value
        new Date().toISOString(),
        JSON.stringify({
          dataType: 'diabetes-survey',
          ipfsCid: ipfsResult.cid,
          patientId: ipfsResult.patientId,
          submittedAt: new Date().toISOString(),
          ipfsUrl: ipfsResult.ipfsUrl
        })
      )
      
      if (result) {
        showToast(t('survey.messages.surveySubmitSuccess'), 'success')
      }
    } catch (error) {
      console.error('Submission failed:', error)
      showToast(t('survey.messages.submitFailed'), 'error')
    } finally {
      setIsSubmitting(false)
    }
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
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{t('survey.connectWalletTitle')}</h1>
            <p className="text-xl text-gray-600 mb-8">{t('survey.connectWalletSubtitle')}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectWallet}
              className="btn-primary"
            >
              {t('survey.connectWallet')}
            </motion.button>
          </motion.div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('survey.diabetesTitle')}</h1>
          <p className="text-xl text-gray-600">{t('survey.subtitle')}</p>
        </motion.div>

        {/* Status Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('survey.systemStatus')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              {fhevmReady ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-gray-700">
                {t('survey.fhevmEncryption')}: {fhevmReady ? t('survey.connected') : t('survey.simulationMode')}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {ipfsReady ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-gray-700">
                {t('survey.ipfsStorage')}: {ipfsReady ? t('survey.connected') : t('survey.simulationMode')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Survey Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DiabetesSurvey 
            onSubmit={handleSurveySubmit}
            isSubmitting={isSubmitting || loading}
          />
        </motion.div>
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