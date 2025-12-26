'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { BASED_TOKEN_ADDRESS, BASED_STAKING_ADDRESS, BASED_TOKEN_ABI, BASED_STAKING_ABI, LOCK_PERIODS } from '@/lib/contracts';
import { Input } from './ui/input';
import { toast } from 'sonner';
import type { Address } from 'viem';

export type StakeFormProps = {
  maxLockDays: number;
  onSuccess?: () => void;
};

export function StakeForm({ maxLockDays, onSuccess }: StakeFormProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState<30 | 60 | 90>(30);

  const { data: balance } = useReadContract({
    address: BASED_TOKEN_ADDRESS,
    abi: BASED_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: BASED_TOKEN_ADDRESS,
    abi: BASED_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address as Address, BASED_STAKING_ADDRESS] : undefined,
  });

  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: stake, data: stakeHash, isPending: isStaking } = useWriteContract();

  const { isLoading: isApprovingConfirm } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isStakingConfirm, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({ hash: stakeHash });

  const needsApproval = (): boolean => {
    if (!amount || !allowance) return false;
    try {
      const amountWei = parseUnits(amount, 18);
      return (allowance as bigint) < amountWei;
    } catch {
      return false;
    }
  };

  const handleApprove = async (): Promise<void> => {
    if (!amount) return;

    try {
      const amountWei = parseUnits(amount, 18);
      approve({
        address: BASED_TOKEN_ADDRESS,
        abi: BASED_TOKEN_ABI,
        functionName: 'approve',
        args: [BASED_STAKING_ADDRESS, amountWei],
      });
      toast.success('Approval submitted');
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Approval failed');
    }
  };

  const handleStake = async (): Promise<void> => {
    if (!amount) return;

    try {
      const amountWei = parseUnits(amount, 18);
      const lockSeconds = lockPeriod === 30 
        ? LOCK_PERIODS.THIRTY_DAYS 
        : lockPeriod === 60 
        ? LOCK_PERIODS.SIXTY_DAYS 
        : LOCK_PERIODS.NINETY_DAYS;

      stake({
        address: BASED_STAKING_ADDRESS,
        abi: BASED_STAKING_ABI,
        functionName: 'stake',
        args: [amountWei, BigInt(lockSeconds)],
      });

      toast.success('Stake submitted');
      setTimeout(() => onSuccess?.(), 1000);
    } catch (error) {
      console.error('Stake error:', error);
      toast.error('Stake failed');
    }
  };

  const isLockPeriodDisabled = (days: 30 | 60 | 90): boolean => {
    return days > maxLockDays;
  };

  const formatBalance = (): string => {
    if (!balance) return '0';
    try {
      return formatUnits(balance as bigint, 18);
    } catch {
      return '0';
    }
  };

  return (
    <div className="flex flex-col gap-4 border-2 border-black p-4">
      <div className="font-mono text-xl uppercase">Stake $BASED</div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <span>Amount</span>
          <span className="opacity-60">Balance: {formatBalance()}</span>
        </div>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          className="border-2 border-black bg-white font-mono text-2xl"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-mono text-xs">Lock Period</div>
        <div className="grid grid-cols-3 gap-2">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setLockPeriod(days as 30 | 60 | 90)}
              disabled={isLockPeriodDisabled(days as 30 | 60 | 90)}
              className={`border-2 border-black p-2 font-mono text-sm uppercase transition-none active:translate-x-[2px] active:translate-y-[2px] ${
                lockPeriod === days
                  ? 'bg-black text-white'
                  : isLockPeriodDisabled(days as 30 | 60 | 90)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-black'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {needsApproval() ? (
        <button
          onClick={handleApprove}
          disabled={isApproving || isApprovingConfirm}
          className="border-2 border-black bg-[#0052FF] p-4 font-mono text-lg uppercase text-white transition-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
        >
          {isApproving || isApprovingConfirm ? 'Approving...' : 'Approve $BASED'}
        </button>
      ) : (
        <button
          onClick={handleStake}
          disabled={!amount || isStaking || isStakingConfirm}
          className="border-2 border-black bg-[#0052FF] p-4 font-mono text-lg uppercase text-white transition-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
        >
          {isStaking || isStakingConfirm ? 'Staking...' : 'Stake Now'}
        </button>
      )}
    </div>
  );
}
