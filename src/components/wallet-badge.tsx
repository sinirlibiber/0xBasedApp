'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { getBuilderScore, type BuilderScore } from '@/lib/talent-protocol';
import { Badge } from './ui/badge';

export function WalletBadge() {
  const { address, status } = useAccount();
  const [farcasterUsername, setFarcasterUsername] = useState<string | null>(null);
  const [builderScore, setBuilderScore] = useState<BuilderScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      try {
        await sdk.actions.ready();
        const context = await sdk.context;
        if (!cancelled) {
          setFarcasterUsername(context?.user?.username ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setFarcasterUsername(null);
        }
      }
    }

    loadContext();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBuilderScore() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const score = await getBuilderScore(address);
        if (!cancelled) {
          setBuilderScore(score);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setBuilderScore({ score: 0, normalized: 0, tier: 'NOVICE' });
          setLoading(false);
        }
      }
    }

    loadBuilderScore();
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (status === 'connecting' || status === 'reconnecting' || loading) {
    return (
      <div className="flex items-center gap-2 border-2 border-black p-2">
        <div className="h-2 w-2 bg-black animate-pulse" />
        <span className="font-mono text-xs uppercase">Connecting...</span>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="border-2 border-black p-2">
        <span className="font-mono text-xs uppercase">No Wallet</span>
      </div>
    );
  }

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'ELITE':
        return 'bg-black text-white';
      case 'VERIFIED':
        return 'bg-white text-black border-2 border-black';
      case 'NOVICE':
      default:
        return 'border-2 border-black bg-white text-black';
    }
  };

  return (
    <div className="flex items-center gap-2 border-2 border-black p-2">
      <div className="flex flex-col gap-1">
        <div className="font-mono text-xs uppercase">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </div>
        {farcasterUsername && (
          <div className="font-mono text-xs opacity-60">
            @{farcasterUsername}
          </div>
        )}
      </div>
      {builderScore && (
        <Badge className={`${getTierColor(builderScore.tier)} font-mono text-xs uppercase border-0`}>
          {builderScore.tier} {builderScore.score}
        </Badge>
      )}
    </div>
  );
}
