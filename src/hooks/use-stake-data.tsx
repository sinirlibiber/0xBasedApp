'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { BASED_STAKING_ADDRESS, BASED_STAKING_ABI, BASE_APY } from '@/lib/contracts';
import { getBuilderScore, calculateAPYBoost } from '@/lib/talent-protocol';
import type { Address } from 'viem';

export type StakeData = {
  principal: bigint;
  lockEnd: number;
  lastInteraction: number;
  streakCount: number;
  pendingRewards: bigint;
  currentAPY: number;
  hasStake: boolean;
  builderScoreBoost: number;
};

export function useStakeData() {
  const { address } = useAccount();
  const [builderScoreBoost, setBuilderScoreBoost] = useState(1.0);

  const { data: stakeInfo, refetch: refetchStake } = useReadContract({
    address: BASED_STAKING_ADDRESS,
    abi: BASED_STAKING_ABI,
    functionName: 'getUserStake',
    args: address ? [address as Address] : undefined,
  });

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: BASED_STAKING_ADDRESS,
    abi: BASED_STAKING_ABI,
    functionName: 'getPendingRewards',
    args: address ? [address as Address] : undefined,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadBuilderScoreBoost() {
      if (!address) return;

      try {
        const score = await getBuilderScore(address);
        const boost = calculateAPYBoost(score);
        if (!cancelled) {
          setBuilderScoreBoost(boost);
        }
      } catch (error) {
        if (!cancelled) {
          setBuilderScoreBoost(1.0);
        }
      }
    }

    loadBuilderScoreBoost();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const refetch = (): void => {
    refetchStake();
    refetchRewards();
  };

  if (!stakeInfo || !address) {
    return {
      data: null,
      refetch,
      loading: false,
    };
  }

  const [principal, lockEnd, lastInteraction, streakCount] = stakeInfo as [bigint, bigint, bigint, bigint];

  const streakMultiplier = 1 + Math.min(Number(streakCount) * 0.01, 0.30);
  const totalAPY = BASE_APY * streakMultiplier * builderScoreBoost;

  const data: StakeData = {
    principal,
    lockEnd: Number(lockEnd),
    lastInteraction: Number(lastInteraction),
    streakCount: Number(streakCount),
    pendingRewards: (pendingRewards as bigint) || BigInt(0),
    currentAPY: totalAPY,
    hasStake: principal > BigInt(0),
    builderScoreBoost,
  };

  return {
    data,
    refetch,
    loading: false,
  };
}
