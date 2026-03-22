'use client'

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI, CAMPAIGN_STATES } from '@/config/contracts'

export interface Campaign {
  id: number
  creator: string
  title: string
  description: string
  imageURI: string
  goal: bigint
  minContribution: bigint
  maxContribution: bigint
  deadline: number
  amountRaised: bigint
  contributorCount: number
  state: number
  milestoneCount: number
  currentMilestone: number
}

export interface Milestone {
  amount: bigint
  description: string
  released: boolean
}

export function useCrowdfunding() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getContract = useCallback((provider?: ethers.Provider | ethers.Signer) => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  }, [])

  const getCampaignCount = useCallback(async (): Promise<number> => {
    try {
      const contract = getContract()
      const count = await contract.campaignCount()
      return Number(count)
    } catch (err) {
      console.error('Error getting campaign count:', err)
      return 0
    }
  }, [getContract])

  const getCampaign = useCallback(async (id: number): Promise<Campaign | null> => {
    try {
      const contract = getContract()
      const result = await contract.getCampaign(id)
      return {
        id,
        creator: result[0],
        title: result[1],
        description: result[2],
        imageURI: result[3],
        goal: result[4],
        minContribution: result[5],
        maxContribution: result[6],
        deadline: Number(result[7]),
        amountRaised: result[8],
        contributorCount: Number(result[9]),
        state: Number(result[10]),
        milestoneCount: Number(result[11]),
        currentMilestone: Number(result[12]),
      }
    } catch (err) {
      console.error('Error getting campaign:', err)
      return null
    }
  }, [getContract])

  const getMilestones = useCallback(async (id: number): Promise<Milestone[]> => {
    try {
      const contract = getContract()
      const [amounts, descriptions, released] = await contract.getMilestones(id)
      return amounts.map((amount: bigint, i: number) => ({
        amount,
        description: descriptions[i],
        released: released[i],
      }))
    } catch (err) {
      console.error('Error getting milestones:', err)
      return []
    }
  }, [getContract])

  const createCampaign = useCallback(async (
    signer: ethers.Signer,
    title: string,
    description: string,
    imageURI: string,
    goal: string,
    minContribution: string,
    maxContribution: string,
    durationInDays: number,
    useWhitelist: boolean,
    merkleRoot: string
  ): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getContract(signer)
      const tx = await contract.createCampaign(
        title,
        description,
        imageURI,
        ethers.parseEther(goal),
        ethers.parseEther(minContribution),
        ethers.parseEther(maxContribution),
        durationInDays,
        useWhitelist,
        merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
      const receipt = await tx.wait()
      const event = receipt.logs.find((log: any) => log.fragment?.name === 'CampaignCreated')
      return event ? event.args.id.toString() : null
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [getContract])

  const fundCampaign = useCallback(async (
    signer: ethers.Signer,
    id: number,
    amount: string,
    merkleProof: string[] = []
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getContract(signer)
      const tx = await contract.fund(id, merkleProof, {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [getContract])

  const releaseMilestone = useCallback(async (
    signer: ethers.Signer,
    id: number,
    milestoneIndex: number
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getContract(signer)
      const tx = await contract.releaseMilestone(id, milestoneIndex)
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [getContract])

  const claimRefund = useCallback(async (
    signer: ethers.Signer,
    id: number
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getContract(signer)
      const tx = await contract.claimRefund(id)
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [getContract])

  return {
    loading,
    error,
    getCampaignCount,
    getCampaign,
    getMilestones,
    createCampaign,
    fundCampaign,
    releaseMilestone,
    claimRefund,
  }
}

export { CAMPAIGN_STATES }
