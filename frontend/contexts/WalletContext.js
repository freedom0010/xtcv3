import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  // Sepolia 测试网配置
  const SEPOLIA_CHAIN_ID = '0xaa36a7' // 11155111 in hex
  const SEPOLIA_CONFIG = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SEP',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  }

  // 检查是否已连接
  useEffect(() => {
    checkConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('disconnect', handleDisconnect)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const network = await provider.getNetwork()
          
          setProvider(provider)
          setSigner(signer)
          setAccount(accounts[0].address)
          setChainId(network.chainId.toString())
        }
      }
    } catch (error) {
      console.error('检查连接失败:', error)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('请安装 MetaMask 钱包')
      return false
    }

    setIsConnecting(true)
    setError(null)

    try {
      // 请求连接账户
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAccount(address)
      setChainId(network.chainId.toString())

      // 检查是否在 Sepolia 网络
      if (network.chainId.toString() !== '11155111') {
        await switchToSepolia()
      }

      return true
    } catch (error) {
      console.error('连接钱包失败:', error)
      setError(error.message)
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      })
    } catch (switchError) {
      // 如果网络不存在，尝试添加
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          })
        } catch (addError) {
          console.error('添加 Sepolia 网络失败:', addError)
          throw addError
        }
      } else {
        throw switchError
      }
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setError(null)
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16).toString())
    window.location.reload()
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  const getBalance = async (address = account) => {
    if (!provider || !address) return '0'
    
    try {
      const balance = await provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('获取余额失败:', error)
      return '0'
    }
  }

  const isSepoliaNetwork = () => {
    return chainId === '11155111'
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    getBalance,
    isSepoliaNetwork,
    formatAddress,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}