import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mantleSepolia } from '@/lib/contracts';
import { http } from 'viem';

const mantleTransport = http('https://rpc.sepolia.mantle.xyz', {
  batch: {
    wait: 100, 
    batchSize: 25, 
  },
  retryCount: 3,
  retryDelay: 1000, 
  timeout: 30_000, 
});

export const config = getDefaultConfig({
  appName: 'Predict & Fund',
  projectId: 'e66cf6763596939b875f4c3a89246440',
  chains: [mantleSepolia],
  ssr: false,
  transports: {
    [mantleSepolia.id]: mantleTransport,
  },
});