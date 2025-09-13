# 🩺 Anonymous Diabetes Analytics DApp

Privacy-preserving diabetes data analysis platform based on FHEVM + IPFS + Sepolia

## 📋 Project Overview

This is an innovative decentralized application (DApp) designed for privacy-protected diabetes patient data and statistical analysis. By combining Fully Homomorphic Encryption (FHEVM), distributed storage (IPFS), and Ethereum testnet (Sepolia), it provides a secure, transparent, and tamper-proof solution for medical data analysis.

### 🎯 Core Features

- **🔐 Privacy Protection**: Uses homomorphic encryption technology to protect sensitive patient data
- **📊 Data Analytics**: Provides multiple statistical analysis methods (descriptive statistics, regression analysis, correlation analysis, etc.)
- **🌐 Decentralization**: Distributed architecture based on blockchain and IPFS
- **📱 User-Friendly**: Modern web interface with responsive design
- **🔒 Data Integrity**: Ensures data immutability through blockchain
- **📈 Real-time Visualization**: Dynamic charts displaying analysis results

## 🏗️ Technical Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart         │    │   IPFS          │
│   (Next.js)     │◄──►│   Contract      │◄──►│   Storage       │
│                 │    │   (FHEVM)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Sepolia       │◄─────────────┘
                        │   Testnet       │
                        └─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Smart Contracts**: Solidity, FHEVM (Homomorphic Encryption)
- **Blockchain**: Sepolia Testnet
- **Storage**: IPFS (Filebase)
- **Data Visualization**: Recharts
- **Development Tools**: Hardhat, ESLint, TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/freedom0010/xtcv3.git
cd xtcv3
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration

Create environment variable files:

```bash
# Root directory .env
cp .env.example .env

# Frontend directory .env.local
cd frontend
cp .env.local.example .env.local
```

Configure necessary environment variables:

**Root directory `.env`:**
```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Frontend `frontend/.env.local`:**
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
NEXT_PUBLIC_FILEBASE_GATEWAY=https://ipfs.filebase.io/ipfs/

# Filebase IPFS Configuration (Optional)
FILEBASE_ACCESS_KEY=your_filebase_access_key
FILEBASE_SECRET_KEY=your_filebase_secret_key
```

### 4. Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia testnet
npm run deploy
```

### 5. Start Frontend Application

```bash
# Start development server
npm run dev

# Or start directly in frontend directory
cd frontend
npm run dev
```

Visit http://localhost:3000 to view the application.

## 📖 User Guide

### Patient Data Submission

1. **Connect Wallet**: Click "Connect Wallet" button to connect MetaMask
2. **Fill Survey**: Complete diabetes-related health questionnaire
3. **Data Encryption**: System automatically uses homomorphic encryption to protect your data
4. **On-chain Storage**: Encrypted data stored to IPFS and recorded on blockchain

### Data Analysis Viewing

1. **Select Analysis Type**: 
   - Descriptive Statistical Analysis
   - Univariate Analysis
   - Logistic Regression Analysis
   - Linear Regression Analysis
   - Stratified Analysis
   - Correlation Analysis

2. **View Results**: 
   - Interactive chart displays
   - Statistical indicator explanations
   - Analysis insight recommendations

### Administrator Functions

1. **Data Overview**: View overall data statistics
2. **IPFS Debugging**: Check storage status
3. **Contract Interaction**: Manage smart contracts

## 🔧 Development Guide

### Project Structure

```
xtcv2/
├── contracts/                 # Smart contracts
│   └── DiabetesAnalytics.sol
├── frontend/                  # Frontend application
│   ├── components/           # React components
│   ├── pages/               # Next.js pages
│   ├── services/            # Service layer
│   ├── contexts/            # React Context
│   └── config/              # Configuration files
├── scripts/                  # Deployment scripts
├── artifacts/               # Compilation artifacts
└── README.md
```

### Main Components

- **AnalyticsChart.js**: Data visualization component
- **DiabetesSurvey.js**: Patient questionnaire component
- **Layout.js**: Application layout component
- **ipfsService.js**: IPFS storage service
- **contractService.js**: Smart contract interaction service

### Development Commands

```bash
# Compile smart contracts
npm run compile

# Run tests
npm run test

# Deploy contracts
npm run deploy

# Start frontend development server
npm run dev

# Build frontend production version
npm run build

# Code linting
cd frontend && npm run lint
```

## 🔒 Privacy & Security

### Data Protection Mechanisms

1. **Homomorphic Encryption**: Uses FHEVM to encrypt sensitive data
2. **Anonymization**: Patient identity information is completely anonymous
3. **Decentralized Storage**: IPFS distributed storage prevents single point of failure
4. **Immutability**: Blockchain ensures data integrity

### Security Best Practices

- Store private keys securely, do not share with others
- Regularly backup wallets and important data
- Only use test tokens on test networks
- Verify contract address correctness

## 🌐 Network Configuration

### Sepolia Testnet Configuration

```javascript
// MetaMask network configuration
Network Name: Sepolia Test Network
RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

### Get Test Tokens

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://sepoliafaucet.com/)

## 📊 Data Analysis Features

### Supported Analysis Types

1. **Descriptive Statistics**: Mean, standard deviation, distribution
2. **Univariate Analysis**: Blood glucose level distribution analysis
3. **Regression Analysis**: Influencing factor identification and prediction
4. **Correlation Analysis**: Inter-variable relationship analysis
5. **Stratified Analysis**: Group analysis by population characteristics

### Visualization Charts

- Bar Chart
- Pie Chart
- Line Chart
- Area Chart
- Scatter Plot

## 🤝 Contributing

We welcome community contributions! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

### Code Standards

- Use ESLint for code checking
- Follow React/Next.js best practices
- Write clear comments and documentation
- Ensure tests pass

## 🐛 Troubleshooting

### Common Issues

**Q: Frontend startup error "Cannot find module 'next/babel'"**
```bash
# Solution: Clear cache and reinstall dependencies
cd frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Q: Smart contract deployment failure**
```bash
# Check network configuration and private key settings
# Ensure sufficient test ETH
# Verify RPC URL correctness
```

**Q: IPFS upload failure**
```bash
# Check Filebase configuration
# Verify API key correctness
# Ensure network connection is normal
```

### Getting Help

- Check [Issues](../../issues) page
- Read project documentation
- Contact development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FHEVM](https://github.com/zama-ai/fhevm) - Fully Homomorphic Encryption Virtual Machine
- [IPFS](https://ipfs.io/) - Distributed Storage Network
- [Next.js](https://nextjs.org/) - React Framework
- [Hardhat](https://hardhat.org/) - Ethereum Development Environment
- [Recharts](https://recharts.org/) - Data Visualization Library

## 📞 Contact Us

- Project Homepage: [GitHub Repository](https://github.com/freedom0010/xtcv2)
- Issue Reports: [Issues](https://github.com/freedom0010/xtcv2/issues)
- Email: developer@example.com

---

**⚠️ Disclaimer**: This project is for educational and research purposes only. Please conduct thorough security audits and testing before using in production environments. Medical data processing must comply with relevant laws and regulations.
