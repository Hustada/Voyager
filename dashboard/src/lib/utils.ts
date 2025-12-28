import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPosition(pos: { x: number; y: number; z: number }): string {
  return `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`
}

export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString()
}
