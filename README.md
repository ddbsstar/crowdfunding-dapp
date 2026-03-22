# 🌟 FundFlow - 去中心化众筹平台

[English](./README.md) | 中文

一个基于以太坊的去中心化众筹平台，具备里程碑式资金释放、NFT 奖励和 DAO 治理功能。

## 📋 项目简介

这是一个完整的 Web3 众筹 DApp，可用于求职简历项目展示。

### 核心技术栈

- **智能合约**: Solidity 0.8.19
- **合约库**: OpenZeppelin Contracts
- **开发框架**: Hardhat
- **前端**: Next.js + React + Tailwind CSS
- **Web3 库**: Ethers.js

### 功能特性

#### 核心功能
- ✅ 创建众筹活动（自定义目标、期限、贡献限额）
- ✅ 里程碑式资金释放（分阶段释放资金）
- ✅ 白名单支持（Merkle 树验证）
- ✅ NFT 奖励（根据贡献等级铸造）

#### 安全特性
- ✅ 重入攻击保护（ReentrancyGuard）
- ✅ 访问控制（Ownable）
- ✅ Merkle 证明验证
- ✅ 贡献限额检查
- ✅ 平台手续费（默认 2.5%）

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/ddbsstar/crowdfunding-dapp.git
cd crowdfunding-dapp

# 安装智能合约依赖
npm install

# 安装前端依赖 (在 src 目录)
cd src
npm install
```

### 本地开发

#### 1. 编译智能合约

```bash
npx hardhat compile
```

#### 2. 运行测试

```bash
npx hardhat test
```

测试覆盖：
- ✅ 活动创建
- ✅ 里程碑管理
- ✅ 众筹投资
- ✅ 里程碑资金释放
- ✅ 退款机制
- ✅ 活动取消
- ✅ 管理功能
- ✅ 视图函数

**28 个测试全部通过**

#### 3. 部署到本地测试网络

```bash
npx hardhat node
```

在另一个终端：

```bash
npx hardhat run scripts/deploy.js --network localhost
```

#### 4. 启动前端

```bash
cd src
npm run dev
```

访问 http://localhost:3000

### 部署到测试网

1. 配置 `.env` 文件：

```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key
```

2. 部署到 Sepolia：

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. 验证合约：

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 📁 项目结构

```
crowdfunding-dapp/
├── contracts/           # 智能合约
│   └── Crowdfunding.sol
├── test/               # 测试用例
│   └── Crowdfunding.test.js
├── scripts/            # 部署脚本
│   └── deploy.js
├── src/                # 前端代码
│   ├── app/           # Next.js App
│   ├── components/    # React 组件
│   ├── hooks/         # 自定义 Hooks
│   └── config/        # 配置文件
├── hardhat.config.js  # Hardhat 配置
└── README.md
```

## 🎯 合约架构

```
CrowdfundingPlatform
├── 活动管理
│   ├── createCampaign()    # 创建众筹
│   ├── addMilestones()     # 添加里程碑
│   ├── cancelCampaign()    # 取消活动
│   └── getCampaign()      # 获取活动信息
│
├── 资金管理
│   ├── fund()             # 投资
│   ├── releaseMilestone() # 释放里程碑资金
│   └── claimRefund()      # 索取退款
│
├── 视图函数
│   ├── getMilestones()    # 获取里程碑
│   ├── getContributors()  # 获取投资者
│   └── contributions()    # 获取投资记录
│
└── 管理函数
    ├── setPlatformFee()   # 设置手续费
    └── setFeeRecipient()  # 设置收款账户
```

## 💰 费用结构

| 等级 | 最低投资额 | NFT 奖励 |
|------|-----------|----------|
| Bronze | 0.1 ETH | 🏅 |
| Silver | 0.5 ETH | 🥈 |
| Gold | 2 ETH | 🥇 |
| Platinum | 5 ETH | 💎 |

## 🔧 Gas 费用估算

- 创建活动: ~500,000 gas
- 投资: ~150,000 gas
- 里程碑释放: ~100,000 gas
- 退款: ~80,000 gas

## 🛡️ 安全考虑

1. **重入保护**: 所有状态修改函数使用 `nonReentrant` 修饰符
2. **访问控制**: 创建者函数已正确认证
3. **输入验证**: 全面的 require 语句
4. **安全数学**: Solidity 0.8+ 内置溢出保护
5. **Merkle 证明**: 加密白名单验证

## 📝 许可证

MIT License
