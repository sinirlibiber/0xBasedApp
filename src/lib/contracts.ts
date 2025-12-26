import type { Address } from 'viem';

// TODO: Replace these with your actual deployed contract addresses on Base mainnet
export const BASED_TOKEN_ADDRESS: Address = '0x0000000000000000000000000000000000000000';
export const BASED_STAKING_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

// ERC-20 Token ABI (minimal, for balance and approve)
export const BASED_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Staking Contract ABI
export const BASED_STAKING_ABI = [
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'lockPeriod', type: 'uint256' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pulse',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserStake',
    outputs: [
      { name: 'principal', type: 'uint256' },
      { name: 'lockEnd', type: 'uint256' },
      { name: 'lastInteraction', type: 'uint256' },
      { name: 'streakCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getPendingRewards',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getCurrentAPY',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Lock period constants (in seconds)
export const LOCK_PERIODS = {
  THIRTY_DAYS: 30 * 24 * 60 * 60,
  SIXTY_DAYS: 60 * 24 * 60 * 60,
  NINETY_DAYS: 90 * 24 * 60 * 60,
} as const;

// Base APY (5%)
export const BASE_APY = 500; // 500 basis points = 5%

// Pulse window (in seconds)
export const PULSE_COOLDOWN = 20 * 60 * 60; // 20 hours
export const PULSE_WINDOW_END = 28 * 60 * 60; // 28 hours
