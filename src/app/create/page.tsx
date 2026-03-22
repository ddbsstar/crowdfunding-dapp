'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'

export default function CreateCampaign() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageURI: '',
    goal: '',
    minContribution: '0.01',
    maxContribution: '1',
    durationInDays: '30',
    useWhitelist: false,
    merkleRoot: '',
  })
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }

    setLoading(true)
    // In production, this would call the contract
    // For demo, simulate success
    setTimeout(() => {
      setLoading(false)
      alert('Campaign created successfully! (Demo mode - contract not deployed)')
      router.push('/')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold text-white">FundFlow</h1>
          </a>
          
          {account ? (
            <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white">
              {`${account.slice(0, 6)}...${account.slice(-4)}`}
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

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">Create New Campaign</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Campaign Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Enter your campaign title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none h-32"
                  placeholder="Describe your project..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Image URL (IPFS)</label>
                <input
                  type="url"
                  value={form.imageURI}
                  onChange={(e) => setForm({ ...form, imageURI: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="ipfs://..."
                />
              </div>
            </div>
          </div>

          {/* Funding Goals */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Funding Goals</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Goal (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="10"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={form.durationInDays}
                  onChange={(e) => setForm({ ...form, durationInDays: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Min Contribution (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={form.minContribution}
                  onChange={(e) => setForm({ ...form, minContribution: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Max Contribution (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.maxContribution}
                  onChange={(e) => setForm({ ...form, maxContribution: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Whitelist */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Whitelist (Optional)</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <input
                type="checkbox"
                id="useWhitelist"
                checked={form.useWhitelist}
                onChange={(e) => setForm({ ...form, useWhitelist: e.target.checked })}
                className="w-5 h-5 accent-cyan-500"
              />
              <label htmlFor="useWhitelist" className="text-gray-400">
                Enable whitelist for exclusive contributions
              </label>
            </div>
            
            {form.useWhitelist && (
              <div>
                <label className="block text-gray-400 mb-2">Merkle Root</label>
                <input
                  type="text"
                  value={form.merkleRoot}
                  onChange={(e) => setForm({ ...form, merkleRoot: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none font-mono text-sm"
                  placeholder="0x..."
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
        </form>
      </div>
    </div>
  )
}
