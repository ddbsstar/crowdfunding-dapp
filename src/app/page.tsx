'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useCrowdfunding, Campaign, CAMPAIGN_STATES } from '@/hooks/useCrowdfunding'

// Demo campaigns for display when no contract deployed
const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    creator: '0x1234...5678',
    title: 'DeFi Portfolio Tracker',
    description: 'A decentralized portfolio tracking platform with real-time analytics and cross-chain support.',
    imageURI: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    goal: ethers.parseEther('10'),
    minContribution: ethers.parseEther('0.01'),
    maxContribution: ethers.parseEther('2'),
    deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    amountRaised: ethers.parseEther('6.5'),
    contributorCount: 128,
    state: 1,
    milestoneCount: 3,
    currentMilestone: 1,
  },
  {
    id: 2,
    creator: '0xabcd...efgh',
    title: 'NFT Gaming Marketplace',
    description: 'Trade in-game NFTs across multiple games with unified wallet and instant liquidity.',
    imageURI: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400',
    goal: ethers.parseEther('25'),
    minContribution: ethers.parseEther('0.1'),
    maxContribution: ethers.parseEther('5'),
    deadline: Math.floor(Date.now() / 1000) + 45 * 24 * 60 * 60,
    amountRaised: ethers.parseEther('3.2'),
    contributorCount: 45,
    state: 1,
    milestoneCount: 4,
    currentMilestone: 0,
  },
  {
    id: 3,
    creator: '0x9876...5432',
    title: 'DAO Governance Tools',
    description: 'Simplified DAO management with proposal voting, treasury, and member tracking.',
    imageURI: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
    goal: ethers.parseEther('5'),
    minContribution: ethers.parseEther('0.05'),
    maxContribution: ethers.parseEther('1'),
    deadline: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
    amountRaised: ethers.parseEther('5.2'),
    contributorCount: 89,
    state: 2,
    milestoneCount: 2,
    currentMilestone: 2,
  },
]

function formatEth(value: bigint): string {
  return ethers.formatEther(value)
}

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatDeadline(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function calculateProgress(raised: bigint, goal: bigint): number {
  if (goal === 0n) return 0
  return Math.min(100, Number((raised * 100n) / goal))
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS)
  const [account, setAccount] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    checkWallet()
  }, [])

  const checkWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum)
      try {
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0].address)
        }
      } catch (err) {
        console.error('Error checking wallet:', err)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const accounts = await provider.listAccounts()
        setAccount(accounts[0].address)
      } catch (err) {
        console.error('Error connecting wallet:', err)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'active') return c.state === 1
    if (filter === 'completed') return c.state === 2
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              FundFlow
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="/create" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition">
              + Create Campaign
            </a>
            {account ? (
              <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                {formatAddress(account)}
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-4">
          Fund Ideas, <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Build the Future</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Decentralized crowdfunding with milestone-based funding, NFT rewards, and community governance.
        </p>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{campaigns.length}</div>
            <div className="text-gray-500">Campaigns</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">262</div>
            <div className="text-gray-500">Contributors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-400">14.9 ETH</div>
            <div className="text-gray-500">Raised</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === f 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <a 
              key={campaign.id} 
              href={`/campaign/${campaign.id}`}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition group"
            >
              <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 relative overflow-hidden">
                {campaign.imageURI && (
                  <img 
                    src={campaign.imageURI} 
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    campaign.state === 1 ? 'bg-green-500/20 text-green-400' :
                    campaign.state === 2 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {CAMPAIGN_STATES[campaign.state]}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">
                  {campaign.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>
                
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cyan-400">{formatEth(campaign.amountRaised)} ETH</span>
                    <span className="text-gray-500">of {formatEth(campaign.goal)} ETH</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${calculateProgress(campaign.amountRaised, campaign.goal)}%` }}
                    />
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>👥 {campaign.contributorCount} contributors</span>
                  <span>📅 {formatDeadline(campaign.deadline)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
