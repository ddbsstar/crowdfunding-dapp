# 🌟 Crowdfunding dApp - 众筹去中心化应用

## 项目简介

一个基于以太坊的众筹平台，用户可以：
- 创建众筹项目
- 用ETH资助项目
- 项目达标后自动转账给项目方
- 项目失败后自动退款

## 技术栈

- **智能合约**: Solidity + OpenZeppelin
- **开发框架**: Hardhat
- **前端**: Next.js + ethers.js
- **测试**: Sepolia测试网

## 合约功能

### 核心功能
1. **创建众筹** - 项目方创建众筹，设置目标金额和截止时间
2. **资助** - 任何人可以用ETH资助项目
3. **完成** - 达标后项目方提取资金
4. **退款** - 未达标时资助者自动退款

### 安全特性
- 只有项目方可以完成众筹
- 只有在截止时间过后才能退款
- 只有未达标才能退款
- 自动执行，无需信任第三方

## 面试亮点 💡

### 面试官常问问题

**Q1: 如何防止项目方卷款跑路?**
> - 设置众筹目标，只有达标才能提取资金
> - 资助者的ETH保存在合约中，项目方无法直接接触
> - 未达标时自动退款给资助者

**Q2: 如何处理Gas优化?**
> - 使用storage变量而非memory
> - 合并相关数据结构
> - 使用批量操作减少链上交互

**Q3: 有什么安全风险?**
> - reentrancy攻击 - 使用Checks-Effects-Interactions模式
> - 整数溢出 - 使用SafeMath或Solidity 0.8+
> - 权限控制 - 正确验证调用者身份

**Q4: 为什么用ETH而不是ERC20?**
> - 简化用户体验
> - 减少Gas成本（不需要approve流程）
> - 众筹场景ETH更直接

## 如何运行

### 1. 安装依赖
```bash
npm install
```

### 2. 编译合约
```bash
npx hardhat compile
```

### 3. 部署到测试网
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. 启动前端
```bash
npm run start
```

## 项目结构

```
├── contracts/
│   └── Crowdfunding.sol    # 智能合约
├── scripts/
│   └── deploy.js           # 部署脚本
├── test/
│   └── crowdfunding.js     # 测试用例
└── README.md
```

## 截图

[众筹首页]
[创建项目]
[资助项目]

## 学习资源

- [Solidity文档](https://docs.soliditylang.org/)
- [OpenZeppelin](https://openzeppelin.com/)
- [SpeedRunEthereum](https://speedrunethereum.com/)

## License

MIT
