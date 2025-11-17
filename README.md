# 🚀 PULSEPOOL

> **Where Prediction Markets Meet Crowdfunding**  
> Bet on project milestones. Winners fund the future. Everyone wins.

[![Built with BNB Chain](https://img.shields.io/badge/Built%20on-BNB%20Chain-F0B90B?style=for-the-badge&logo=binance)](https://www.bnbchain.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 **What is PULSEPOOL?**

**PulsePool** is a decentralized platform that revolutionizes project funding by combining prediction markets with crowdfunding. Users bet on whether projects will achieve their milestones - losing bets automatically fund the projects, while winners earn BNB rewards and token allocation rights:
- 🎲 **Prediction Markets** - Bet on whether projects will hit their milestones
- 💰 **Crowdfunding** - Losing bets automatically fund winning projects
- 🏆 **Reputation System** - Top predictors earn rewards & token allocation rights
- ⚡ **Zero Waste** - Every BNB staked either rewards winners or funds projects

### **The Problem We Solve**
Traditional crowdfunding lacks market validation, while prediction markets don't create real-world impact. We merge both: **the wisdom of the crowd validates AND funds breakthrough projects.**

### **How It Works**
1. **Projects Submit** - Entrepreneurs set milestones & funding goals
2. **Community Predicts** - Users bet BNB on milestone achievement
3. **Smart Contracts Decide** - Oracles verify milestone completion
4. **Winners Fund** - Losing bets fund projects; winners get BNB + token rights

---

## ✨ **Key Features**

### 🎯 **For Predictors**
- Earn BNB rewards from accurate predictions
- Gain early token allocation rights in funded projects
- Build on-chain reputation with NFT badges
- Access exclusive prediction markets

### 💼 **For Projects**
- Get funding validated by market sentiment
- No upfront costs - only pay if you succeed
- Built-in community of engaged supporters
- Milestone-based funding reduces risk

### 🏗️ **Smart Contract Architecture**
- **ProjectRegistry.sol** - Project & milestone management
- **PredictionMarket.sol** - Binary outcome prediction markets
- **ReputationNFT.sol** - On-chain reputation tracking
- **Upgradeable** - UUPS proxy pattern for future improvements

---

## 🛠️ **Tech Stack**

### **Smart Contracts**
- Solidity
- Hardhat (development & testing)
- OpenZeppelin (security & upgradeability)
- Chainlink (oracles for milestone verification)

### **Frontend**
- React 18 + TypeScript
- Vite (blazing fast dev server)
- Tailwind CSS (modern styling)
- Wagmi + Viem (Web3 integration)
- RainbowKit (wallet connection)

### **Blockchain**
- Testnet: BSC Testnet

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ (LTS)
- npm or yarn
- MetaMask wallet
- BNB testnet 

### **1. Clone the Repository**
```bash
git clone https://github.com/Ted1166/oraculum.git
cd oraculum
```

### **2. Setup Smart Contracts**
```bash
cd contracts

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your private key & API keys to .env
# NEVER commit .env to git!

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet (when ready)
npm run deploy:mainnet
```


## 🧪 **Testing**

### **Smart Contract Tests**
```bash
cd contracts

# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage

# Test specific file
npx hardhat test test/Oraculum.test.ts
```

### **Frontend Tests** (Coming Soon)
```bash
cd client
npm run test
```

---

## 🌐 **Deployment**

### **Testnet Deployment**
```bash
cd contracts

# Deploy to BSC Testnet
npm run deploy:testnet

# Verify contracts on BscScan
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS>
```

### **Frontend Deployment**
```bash
cd client

# Build production bundle
npm run build

# Deploy to Vercel (recommended)
vercel deploy

# Or deploy to Netlify, AWS, etc.
```

---

## 🔐 **Security**

### **Smart Contract Security**
- ✅ OpenZeppelin audited libraries
- ✅ Reentrancy guards on all state-changing functions
- ✅ Access control with Ownable pattern
- ✅ Pausable for emergency stops
- ✅ Comprehensive test coverage (>90%)

### **Audits**
- [ ] Internal security review - ✅ Complete
- [ ] External audit - 🔄 Pending
- [ ] Bug bounty program - 📅 Planned

## 🤝 **Contributing**

We welcome contributions! Here's how:

### **Development Process**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Contribution Guidelines**
- Follow existing code style
- Write tests for new features
- Update documentation
- Keep commits atomic and descriptive

## 📄 **License**

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 👥 **Team**

### **Core Team**
- **Ted (Adams)**  - Full Stack Developer
- **Felix (Awere)** - Full Stack Developer
- **Peter (Kagwe)** - Full Stack Developer

## 📞 **Contact & Links**

- **Website**: [predictandfund.xyz](https://predictandfund.xyz) *(Coming Soon)*
- **Documentation**: [docs.predictandfund.xyz](https://docs.predictandfund.xyz) *(Coming Soon)*
- **Twitter**: [@PredictAndFund](https://twitter.com/PredictAndFund) *(Coming Soon)*
- **Discord**: [Join our community](https://discord.gg/predictandfund) *(Coming Soon)*
- **Email**: contact@predictandfund.xyz

---

## 💡 **FAQs**

### **Q: How do I get started?**
A: Connect your wallet, browse projects, and place your first prediction!

### **Q: What if a project fails a milestone?**
A: "YES" bettors lose their stake, which automatically funds the project. "NO" bettors win.

### **Q: How are milestones verified?**
A: Through decentralized oracles (Chainlink) and community voting.

### **Q: What are reputation NFTs?**
A: On-chain badges showing your prediction accuracy and earning you benefits.

### **Q: Is this legal?**
A: Yes! We're not a financial instrument - we're a project funding mechanism with gamification.


