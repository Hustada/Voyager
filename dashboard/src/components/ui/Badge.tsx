import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'error' | 'warning'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-ember-card-border text-ember-text',
    success: 'bg-green-900/50 text-green-400 border-green-700',
    error: 'bg-red-900/50 text-red-400 border-red-700',
    warning: 'bg-amber-900/50 text-amber-400 border-amber-700'
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
