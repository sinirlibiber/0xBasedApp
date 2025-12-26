'use client'
import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { WalletBadge } from '@/components/wallet-badge';
import { StreakDisplay } from '@/components/streak-display';
import { PulseButton } from '@/components/pulse-button';
import { StakeForm } from '@/components/stake-form';
import { useStakeData } from '@/hooks/use-stake-data';
import { getTierMaxLockPeriod, type BuilderScore, getBuilderScore } from '@/lib/talent-protocol';
import { Toaster } from '@/components/ui/sonner';
import { formatUnits } from 'viem';
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";

export default function BasedStakePage() {
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth(isInFarcaster)
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (document.readyState !== 'complete') {
            await new Promise<void>(resolve => {
              if (document.readyState === 'complete') {
                resolve()
              } else {
                window.addEventListener('load', () => resolve(), { once: true })
              }

            })
          }

    

          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully - app fully loaded')
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error)
          
          setTimeout(async () => {
            try {
              await sdk.actions.ready()
              console.log('Farcaster SDK initialized on retry')
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError)
            }

          }, 1000)
        }

      }

    

      initializeFarcaster()
    }, [])
  const { address, status } = useAccount();
  const { data: stakeData, refetch } = useStakeData();
  const [builderScore, setBuilderScore] = useState<BuilderScore | null>(null);
  const [yieldTicker, setYieldTicker] = useState('0.000000');

  useEffect(() => {
    sdk.actions.ready({ disableNativeGestures: false });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBuilderScore() {
      if (!address) return;

      try {
        const score = await getBuilderScore(address);
        if (!cancelled) {
          setBuilderScore(score);
        }
      } catch (error) {
        if (!cancelled) {
          setBuilderScore({ score: 0, normalized: 0, tier: 'NOVICE' });
        }
      }
    }

    loadBuilderScore();
    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    if (!stakeData?.hasStake) return;

    const interval = setInterval(() => {
      try {
        const pendingRewardsFormatted = formatUnits(stakeData.pendingRewards, 18);
        const currentValue = parseFloat(pendingRewardsFormatted);
        const incrementPerSecond = (stakeData.currentAPY / 100 / 365 / 24 / 60 / 60) * parseFloat(formatUnits(stakeData.principal, 18));
        const newValue = currentValue + incrementPerSecond;
        setYieldTicker(newValue.toFixed(6));
      } catch {
        setYieldTicker('0.000000');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stakeData]);

  const handlePulseSuccess = (): void => {
    refetch();
  };

  const handleStakeSuccess = (): void => {
    refetch();
  };

  if (status === 'disconnected') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-4">
        <div className="text-center">
          <h1 className="font-mono text-4xl uppercase">0xBasedApp</h1>
          <p className="mt-2 font-mono text-sm opacity-60">The Pulse of the Chain</p>
        </div>
        <div className="border-2 border-black p-4">
          <ConnectWallet />
        </div>
        <Toaster />
      </div>
    );
  }

  if (status === 'connecting' || status === 'reconnecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="font-mono uppercase">Connecting...</div>
        <Toaster />
      </div>
    );
  }

  if (!stakeData?.hasStake) {
    return (
      <div className="flex min-h-screen flex-col bg-white p-4 pt-16">
        <div className="fixed left-0 right-0 top-0 border-b-2 border-black bg-white p-2">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xl uppercase">0xBasedApp</div>
            <WalletBadge />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <div className="text-center">
            <h2 className="font-mono text-3xl uppercase">Start Your Pulse</h2>
            <p className="mt-2 font-mono text-sm opacity-60">
              Stake $BASED and maintain your daily pulse for maximum APY
            </p>
          </div>

          <StakeForm
            maxLockDays={builderScore ? getTierMaxLockPeriod(builderScore.tier) : 30}
            onSuccess={handleStakeSuccess}
          />

          <div className="border-2 border-black p-4">
            <div className="font-mono text-sm uppercase mb-2">How it Works</div>
            <ul className="space-y-2 font-mono text-xs opacity-80">
              <li>• Stake $BASED for 30/60/90 days</li>
              <li>• Tap Pulse every 20-28 hours</li>
              <li>• Maintain your streak for APY boosts</li>
              <li>• Higher Builder Score = Higher APY</li>
              <li>• Break streak = Lose multipliers</li>
            </ul>
          </div>
        </div>

        <Toaster />
      </div>
    );
  }

  const timeUntilNextPulse = Math.max(0, stakeData.lastInteraction + (20 * 60 * 60) - Math.floor(Date.now() / 1000));

  return (
    <div className="flex min-h-screen flex-col bg-white pb-32 pt-16">
      <div className="fixed left-0 right-0 top-0 z-10 border-b-2 border-black bg-white p-2">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xl uppercase">0xBasedApp</div>
          <WalletBadge />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <StreakDisplay
          streakCount={stakeData.streakCount}
          timeRemaining={timeUntilNextPulse}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="font-mono text-xs uppercase opacity-60">Current Yield</div>
          <div className="font-mono text-6xl">{yieldTicker}</div>
          <div className="font-mono text-sm opacity-60">$BASED</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-black p-4 text-center">
            <div className="font-mono text-xs uppercase opacity-60">Staked</div>
            <div className="font-mono text-2xl">{parseFloat(formatUnits(stakeData.principal, 18)).toFixed(2)}</div>
          </div>
          <div className="border-2 border-black p-4 text-center">
            <div className="font-mono text-xs uppercase opacity-60">APY</div>
            <div className="font-mono text-2xl">{(stakeData.currentAPY / 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <PulseButton
        lastInteraction={stakeData.lastInteraction}
        onSuccess={handlePulseSuccess}
      />

      <Toaster />
    </div>
  );
}
