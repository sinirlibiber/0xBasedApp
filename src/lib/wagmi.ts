import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, injected, walletConnect } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';

const chainId = process.env.NEXT_PUBLIC_SDK_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_SDK_CHAIN_ID)
  : base.id;
  
export const activeChain = chainId === baseSepolia.id ? baseSepolia : base;
  
export const config = createConfig({
  chains: [activeChain],
  connectors: [
    coinbaseWallet({
      appName: '0xBasedApp',
      preference: 'all',
    }),
    walletConnect({
      projectId: '9a2c496a30d21c9db69d1bc71a7d1ff3',
      metadata: {
        name: '0xBasedApp - BasedStake',
        description: 'Multi-tier staking protocol on Base blockchain',
        url: 'https://0xbasedapp.vercel.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      showQrModal: true,
    }),
    metaMask({
      dappMetadata: {
        name: '0xBasedApp',
      },
    }),
    injected({ target: 'phantom' }),  
    injected({ target: 'rabby' }),  
    injected({ target: 'trust' }),  
  ],
  transports: {  
    [activeChain.id]: http(),
  }
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5_000,
    },
  },
});
