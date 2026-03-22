# 🌟 Crowdfunding Platform

A decentralized crowdfunding platform built on Ethereum with milestone-based funding, NFT rewards, and DAO governance features.

## Features

### Core Functionality
- **Campaign Creation**: Create crowdfunding campaigns with customizable goals, durations, and contribution limits
- **Milestone-based Funding**: Release funds incrementally based on project milestones
- **Whitelist Support**: Optional merkle tree-based whitelist for exclusive campaigns
- **NFT Rewards**: Automatic NFT minting for different contribution tiers

### Security Features
- **Reentrancy Protection**: All sensitive functions protected via ReentrancyGuard
- **Access Control**: Ownable-based access control for campaign management
- **Merkle Verification**: Secure whitelist verification using cryptographic merkle proofs
- **Contribution Limits**: Configurable min/max contribution limits per campaign
- **Platform Fee**: Configurable platform fee (default 2.5%)

### Technical Features
- **Milestone Management**: Multi-stage fund release based on milestone completion
- **Refund Mechanism**: Automatic refund claim for failed campaigns
- **Event Logging**: Comprehensive event emission for off-chain tracking
- **Gas Optimization**: Efficient storage layout and function modifiers

## Technical Stack

- **Smart Contracts**: Solidity 0.8.19
- **Contract Library**: OpenZeppelin Contracts
- **Development Framework**: Hardhat
- **Testing**: Hardhat Test Suite

## Contract Architecture

```
CrowdfundingPlatform
├── Campaign Management
│   ├── createCampaign()
│   ├── addMilestones()
│   ├── cancelCampaign()
│   └── getCampaign()
│
├── Funding
│   ├── fund()
│   ├── releaseMilestone()
│   └── claimRefund()
│
├── View Functions
│   ├── getMilestones()
│   ├── getContributors()
│   └── getCampaign()
│
└── Admin
    ├── setPlatformFee()
    └── setFeeRecipient()
```

## Functions

### Campaign Management

#### createCampaign()
Creates a new crowdfunding campaign with configurable parameters.

**Parameters:**
- `_title`: Campaign title
- `_description`: Detailed campaign description
- `_imageURI`: IPFS URI for campaign image
- `_goal`: Target funding amount in ETH
- `_minContribution`: Minimum contribution per address
- `_maxContribution`: Maximum contribution per address
- `_durationInDays`: Campaign duration (1-365 days)
- `_useWhitelist`: Enable whitelist verification
- `_merkleRoot`: Merkle root for whitelist

#### addMilestones()
Adds funding milestones to a campaign.

**Parameters:**
- `_id`: Campaign ID
- `_amounts`: Array of milestone amounts
- `_descriptions`: Array of milestone descriptions

### Funding

#### fund()
Contribute ETH to a campaign.

**Parameters:**
- `_id`: Campaign ID
- `_merkleProof`: Merkle proof for whitelist verification

**Events Emitted:**
- `Funded(address contributor, uint256 amount, FundTier tier)`

#### releaseMilestone()
Release milestone funds to campaign creator.

**Parameters:**
- `_id`: Campaign ID
- `_milestoneIndex`: Index of milestone to release

#### claimRefund()
Claim refund if campaign fails to reach goal.

**Parameters:**
- `_id`: Campaign ID

## Data Structures

### Campaign State Machine
```
Pending → Active → Completed
               → Failed
               → Cancelled
```

### Fund Tiers
| Tier | Minimum Contribution |
|------|---------------------|
| Bronze | 0.1 ETH |
| Silver | 0.5 ETH |
| Gold | 2 ETH |
| Platinum | 5 ETH |

## Deployment

### Local Development

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment

```bash
# Configure hardhat.config.js with your network settings
# Add Sepolia or other testnet configuration

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

## Contract Verification

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Gas Costs

Typical gas costs:
- Campaign Creation: ~500,000 gas
- Fund: ~150,000 gas
- Milestone Release: ~100,000 gas
- Refund Claim: ~80,000 gas

## Security Considerations

1. **Reentrancy**: All state-modifying functions use `nonReentrant` modifier
2. **Access Control**: Creator-only functions properly authenticated
3. **Input Validation**: Comprehensive require statements for parameter validation
4. **Safe Math**: Solidity 0.8+ built-in overflow protection
5. **Merkle Proof**: Cryptographic whitelist verification

## Events

| Event | Description |
|-------|-------------|
| `CampaignCreated` | Emitted when new campaign is created |
| `Funded` | Emitted on each contribution |
| `MilestoneCreated` | Emitted when milestone is added |
| `MilestoneReleased` | Emitted when milestone funds are released |
| `RefundClaimed` | Emitted when refund is claimed |
| `NFTMinted` | Emitted when reward NFT is minted |

## License

MIT
