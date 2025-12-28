import { cn } from '../../lib/utils'

interface ProgressProps {
  value: number
  max: number
  className?: string
  variant?: 'health' | 'hunger' | 'default'
}

export function Progress({ value, max, className, variant = 'default' }: ProgressProps) {
  const percentage = Math.min(100, (value / max) * 100)

  const variantColors = {
    health: 'bg-gradient-to-r from-red-600 to-red-400',
    hunger: 'bg-gradient-to-r from-amber-600 to-amber-400',
    default: 'bg-gradient-to-r from-ember-primary to-amber-400'
  }

  return (
    <div className={cn('h-3 bg-ember-card-border rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', variantColors[variant])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
