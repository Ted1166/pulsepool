// src/config/rpc.ts
export const mantleConfig = {
  rpcUrls: {
    default: {
      http: [
        'https://rpc.sepolia.mantle.xyz',
        'https://mantle-sepolia.publicnode.com', // Backup RPC
      ],
    },
  },
  // Add retry logic
  pollingInterval: 12_000, // 12 seconds instead of default 4
};