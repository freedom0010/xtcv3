import '../styles/globals.css'
import { useState, useEffect } from 'react'
import { WalletProvider } from '../contexts/WalletContext'
import { ContractProvider } from '../contexts/ContractContext'
import { ToastProvider } from '../contexts/ToastContext'
import { appWithTranslation } from 'next-i18next'
import Head from 'next/head'

function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <Head>
        <title>Anonymous Diabetes Analytics DApp</title>
        <meta name="description" content="Privacy-preserving diabetes data analysis platform based on FHEVM" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ToastProvider>
        <WalletProvider>
          <ContractProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
              <Component {...pageProps} />
            </div>
          </ContractProvider>
        </WalletProvider>
      </ToastProvider>
    </>
  )
}

export default appWithTranslation(App)