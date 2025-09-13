import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { 
  Activity, 
  Shield, 
  BarChart3, 
  Users, 
  Lock, 
  Zap,
  ArrowRight,
  Heart,
  Database,
  Globe
} from 'lucide-react'
import Layout from '../components/Layout'
import { useWallet } from '../contexts/WalletContext'

export default function Home() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { account, connectWallet } = useWallet()
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalSubmissions: 0,
    totalAnalyses: 0
  })

  const features = [
    {
      icon: Shield,
      title: t('privacy.features.encryption'),
      description: t('privacy.description'),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: t('analytics.title'),
      description: "Support mean calculation, distribution statistics, trend analysis and other statistical methods",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Database,
      title: t('privacy.features.decentralization'),
      description: "Original data stored on IPFS network, only encrypted results and access credentials on-chain",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Deployed on Sepolia testnet, research institutions worldwide can participate in data analysis",
      color: "from-orange-500 to-red-500"
    }
  ]

  const handleRoleSelection = async (role) => {
    if (!account) {
      await connectWallet()
    }
    
    if (role === 'patient') {
      router.push('/patient')
    } else {
      router.push('/researcher')
    }
  }

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-gradient">{t('title').split(' ')[0]}</span>
                <br />
                <span className="text-gray-800">{t('title').split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t('subtitle')}
              </p>
            </motion.div>

            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="medical-card cursor-pointer group"
                onClick={() => handleRoleSelection('patient')}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('patient.title')}</h3>
                  <p className="text-gray-600 mb-6">
                    {t('patient.subtitle')}
                  </p>
                  <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-purple-600 transition-colors">
                    {t('survey.title')} <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="medical-card cursor-pointer group"
                onClick={() => handleRoleSelection('researcher')}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('researcher.title')}</h3>
                  <p className="text-gray-600 mb-6">
                    {t('researcher.subtitle')}
                  </p>
                  <div className="flex items-center justify-center text-green-600 font-semibold group-hover:text-teal-600 transition-colors">
                    {t('analytics.title')} <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Core Technical Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Combining the latest blockchain and cryptographic technologies to provide unprecedented privacy protection for medical data analysis
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="card text-center group hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Technology Architecture
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Using industry-leading Web3 technology stack to ensure system security, scalability and decentralization
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: "FHEVM", desc: "Fully Homomorphic Encryption VM" },
                { name: "IPFS", desc: "Decentralized Storage" },
                { name: "Sepolia", desc: "Ethereum Testnet" },
                { name: "Next.js", desc: "Modern Frontend Framework" }
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-2xl font-bold text-blue-600 mb-2">{tech.name}</div>
                  <div className="text-gray-600 text-sm">{tech.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Join Us to Advance Medical Research
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Whether you are a patient or researcher, you can contribute to diabetes research while protecting privacy
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !account ? connectWallet() : null}
                className="bg-white text-blue-600 font-bold py-4 px-8 rounded-full text-lg hover:shadow-xl transition-all duration-300"
              >
                {account ? t('wallet.connected') : t('buttons.connectWallet')}
              </motion.button>
            </motion.div>
          </div>
        </section>
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