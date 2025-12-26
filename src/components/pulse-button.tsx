'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BASED_STAKING_ADDRESS, BASED_STAKING_ABI, PULSE_COOLDOWN, PULSE_WINDOW_END } from '@/lib/contracts';
import { toast } from 'sonner';

export type PulseState = 'COOLDOWN' | 'ACTIVE' | 'DECAYED';

export type PulseButtonProps = {
  lastInteraction: number;
  onSuccess?: () => void;
};

export function PulseButton({ lastInteraction, onSuccess }: PulseButtonProps) {
  const { address } = useAccount();
  const [pulseState, setPulseState] = useState<PulseState>('COOLDOWN');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const calculateState = (): void => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - lastInteraction;

      if (elapsed < PULSE_COOLDOWN) {
        setPulseState('COOLDOWN');
        setTimeRemaining(PULSE_COOLDOWN - elapsed);
      } else if (elapsed >= PULSE_COOLDOWN && elapsed <= PULSE_WINDOW_END) {
        setPulseState('ACTIVE');
        setTimeRemaining(PULSE_WINDOW_END - elapsed);
      } else {
        setPulseState('DECAYED');
        setTimeRemaining(0);
      }
    };

    calculateState();
    const interval = setInterval(calculateState, 1000);

    return () => clearInterval(interval);
  }, [lastInteraction]);

  useEffect(() => {
    if (isSuccess) {
      setIsFlashing(true);
      
      // Haptic feedback
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15]);
      }

      toast.success('Streak Extended!');
      
      setTimeout(() => {
        setIsFlashing(false);
        onSuccess?.();
      }, 50);
    }
  }, [isSuccess, onSuccess]);

  const handlePulse = async (): Promise<void> => {
    if (!address || pulseState !== 'ACTIVE') return;

    try {
      writeContract({
        address: BASED_STAKING_ADDRESS,
        abi: BASED_STAKING_ABI,
        functionName: 'pulse',
      });
    } catch (error) {
      console.error('Pulse error:', error);
      toast.error('Pulse failed');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getButtonText = (): string => {
    if (isPending || isConfirming) return 'PULSING...';
    if (pulseState === 'COOLDOWN') return `SYNCING ${formatTime(timeRemaining)}`;
    if (pulseState === 'ACTIVE') return 'TAP PULSE';
    return 'DECAYED - STAKE AGAIN';
  };

  const isDisabled = pulseState !== 'ACTIVE' || isPending || isConfirming;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4">
      <button
        onClick={handlePulse}
        disabled={isDisabled}
        className={`w-full border-2 py-8 font-mono text-2xl uppercase transition-none active:translate-x-[2px] active:translate-y-[2px] ${
          isFlashing
            ? 'bg-[#0052FF] text-white border-[#0052FF]'
            : isDisabled
            ? 'border-black bg-white text-black cursor-not-allowed'
            : 'border-black bg-[#0052FF] text-white'
        } ${!isDisabled && pulseState === 'ACTIVE' ? 'animate-pulse-subtle' : ''}`}
        style={{
          animation: !isDisabled && pulseState === 'ACTIVE' ? 'jitter 0.3s infinite' : 'none',
        }}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
