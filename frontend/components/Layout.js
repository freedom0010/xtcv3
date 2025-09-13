import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { 
  Activity, 
  Wallet, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Heart,
  BarChart3,
  Shield
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Layout({ children }) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { account, connectWallet, disconnectWallet, formatAddress, isSepoliaNetwork } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: t('navigation.home'), href: '/', icon: Home },
    { name: t('navigation.patient'), href: '/patient', icon: Heart },
    { name: t('navigation.researcher'), href: '/researcher', icon: BarChart3 },
  ]

  const handleNavigation = (href) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => handleNavigation('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-800">{t('title')}</h1>
                <p className="text-xs text-gray-500">FHEVM + IPFS</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href
                return (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavigation(item.href)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </motion.button>
                )
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Network Status */}
              {account && (
                <div className={`
                  hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium
                  ${isSepoliaNetwork() 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                  }
                `}>
                  <div className={`w-2 h-2 rounded-full ${isSepoliaNetwork() ? 'bg-green-500' : 'bg-red-500'}`} />
                  {isSepoliaNetwork() ? 'Sepolia' : t('wallet.switchNetwork')}
                </div>
              )}

              {/* Wallet Button */}
              {account ? (
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium">{formatAddress(account)}</span>
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={disconnectWallet}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title={t('buttons.disconnect')}
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectWallet}
                  className="btn-primary"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {t('buttons.connectWallet')}
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <motion.button
                  key={item.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </motion.button>
              )
            })}
            
            {account && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{formatAddress(account)}</span>
                  </div>
                  <div className={`
                    flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                    ${isSepoliaNetwork() 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                    }
                  `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isSepoliaNetwork() ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isSepoliaNetwork() ? 'Sepolia' : t('wallet.switchNetwork')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{t('title')}</h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t('subtitle')}
              </p>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">{t('privacy.title')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>{t('privacy.features.encryption')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>{t('privacy.features.decentralization')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>{t('privacy.features.immutability')}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">{t('navigation.home')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• {t('patient.dataSubmission')}</li>
                <li>• {t('researcher.requestAnalysis')}</li>
                <li>• {t('privacy.description')}</li>
                <li>• {t('analytics.title')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-500">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}