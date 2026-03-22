'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useParams } from 'next/navigation'
import { Campaign, CAMPAIGN_STATES } from '@/hooks/useCrowdfunding'
import { FUND_TIERS } from '@/config/contracts'

// Demo campaign data
const DEMO_CAMPAIGN: Campaign = {
  id: 1,
  creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0dE12',
  title: 'DeFi Portfolio Tracker',
  description: 'A decentralized portfolio tracking platform with real-time analytics and cross-chain support. Track all your DeFi investments in one place with advanced analytics, profit/loss calculations, and automated rebalancing suggestions.',
  imageURI: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
  goal: ethers.parseEther('10'),
  minContribution: ethers.parseEther('0.01'),
  maxContribution: ethers.parseEther('2'),
  deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  amountRaised: ethers.parseEther('6.5'),
  contributorCount: 128,
  state: 1,
  milestoneCount: 3,
  currentMilestone: 1,
}

const DEMO_MILESTONES = [
  { amount: ethers.parseEther('2'), description: 'Core platform development - wallet integration and basic tracking', released: true },
  { amount: ethers.parseEther('2'), description: 'Advanced analytics and cross-chain support', released: false },
  { amount: ethers.parseEther('2.5'), description: 'Mobile app and notifications', released: false },
]

function formatEth(value: bigint): string {
  return ethers.formatEther(value)
}

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatDeadline(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function calculateProgress(raised: bigint, goal: bigint): number {
  if (goal === 0n) return 0
  return Math.min(100, Number((raised * 100n) / goal))
}

function getDaysRemaining(deadline: number): number {
  const now = Math.floor(Date.now() / 1000)
  const remaining = deadline - now
  return Math.max(0, Math.floor(remaining / (24 * 60 * 60)))
}

export default function CampaignDetail() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(DEMO_CAMPAIGN)
  const [milestones, setMilestones] = useState(DEMO_MILESTONES)
  const [account, setAccount] = useState<string | null>(null)
  const [contributionAmount, setContributionAmount] = useState('0.1')
  const [loading, setLoading] = useState(false)

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

  const handleFund = async () => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }
    
    const amount = parseFloat(contributionAmount)
    const min = parseFloat(formatEth(campaign!.minContribution))
    const max = parseFloat(formatEth(campaign!.maxContribution))
    
    if (amount < min || amount > max) {
      alert(`Contribution must be between ${min} and ${max} ETH`)
      return
    }

    setLoading(true)
    // In production, this would call the contract
    setTimeout(() => {
      setLoading(false)
      alert('Thank you for your contribution! (Demo mode)')
    }, 2000)
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const progress = calculateProgress(campaign.amountRaised, campaign.goal)
  const daysLeft = getDaysRemaining(campaign.deadline)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold text-white">FundFlow</h1>
          </a>
          
          {account ? (
            <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white">
              {formatAddress(account)}
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white hover:bg-white/20 transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden">
              {campaign.imageURI && (
                <img 
                  src={campaign.imageURI} 
                  alt={campaign.title}
                  className="w-full h-80 object-cover"
                />
              )}
            </div>

            {/* Campaign Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  campaign.state === 1 ? 'bg-green-500/20 text-green-400' :
                  campaign.state === 2 ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {CAMPAIGN_STATES[campaign.state]}
                </span>
                <span className="text-gray-400 text-sm">
                  {campaign.contributorCount} contributors
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">{campaign.title}</h1>
              <p className="text-gray-300 leading-relaxed">{campaign.description}</p>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span>👤</span>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Created by</div>
                    <div className="text-white font-mono">{formatAddress(campaign.creator)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Milestones</h2>
              
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border ${
                      milestone.released 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          milestone.released 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/20 text-gray-400'
                        }`}>
                          {milestone.released ? '✓' : index + 1}
                        </span>
                        <span className="text-white font-semibold">
                          Milestone {index + 1}
                        </span>
                      </div>
                      <span className="text-cyan-400 font-bold">
                        {formatEth(milestone.amount)} ETH
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{milestone.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fund Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-6">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-cyan-400 font-bold">{formatEth(campaign.amountRaised)} ETH</span>
                  <span className="text-gray-400">of {formatEth(campaign.goal)} ETH</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-400">{progress}% funded</span>
                  <span className="text-orange-400">{daysLeft} days left</span>
                </div>
              </div>

              {/* Fund Input */}
              {campaign.state === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Amount (ETH)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={formatEth(campaign.minContribution)}
                      max={formatEth(campaign.maxContribution)}
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <div className="text-gray-500 text-xs mt-1">
                      Min: {formatEth(campaign.minContribution)} ETH / Max: {formatEth(campaign.maxContribution)} ETH
                    </div>
                  </div>

                  <button
                    onClick={handleFund}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Fund This Project'}
                  </button>
                </div>
              )}

              {campaign.state === 2 && (
                <div className="text-center py-4">
                  <div className="text-green-400 font-bold mb-2">🎉 Campaign Funded!</div>
                  <p className="text-gray-400 text-sm">This project reached its goal.</p>
                </div>
              )}

              {campaign.state === 3 && (
                <div className="text-center py-4">
                  <div className="text-red-400 font-bold mb-2">❌ Campaign Failed</div>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition">
                    Claim Refund
                  </button>
                </div>
              )}

              {/* Tier Info */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-semibold mb-3">Contribution Tiers</h3>
                <div className="space-y-2 text-sm">
                  {FUND_TIERS.map((tier, index) => (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-amber-700' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`} />
                        <span className="text-gray-300">{tier}</span>
                      </div>
                      <span className="text-gray-500">
                        {index === 0 ? '≥ 0.1 ETH' :
                         index === 1 ? '≥ 0.5 ETH' :
                         index === 2 ? '≥ 2 ETH' : '≥ 5 ETH'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
