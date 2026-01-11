import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mantleSepolia } from '@/lib/contracts'

export const config = getDefaultConfig({
  appName: 'Predict & Fund',
  projectId: 'e66cf6763596939b875f4c3a89246440', 
  chains: [mantleSepolia],
  ssr: false,
})