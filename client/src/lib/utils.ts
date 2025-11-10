import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatBNB(value: bigint, decimals: number = 18): string {
  const formatted = Number(value) / Math.pow(10, decimals)
  return formatted.toFixed(4)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatTimeRemaining(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = timestamp - now
  
  if (diff <= 0) return "Ended"
  
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}