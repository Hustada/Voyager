import { Cpu, MapPin, Clock } from 'lucide-react'
import { cn } from '../lib/utils'
import type { BotStatus } from '../lib/types'

interface HeaderProps {
  status: BotStatus
  uptime: number
}

export function Header({ status, uptime }: HeaderProps) {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <header className="border-b border-ember-card-border bg-ember-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-8 h-8 text-ember-primary" />
              <div>
                <h1 className="font-mono text-xl font-bold tracking-wider text-ember-text">
                  VOYAGER
                </h1>
                <p className="text-xs text-ember-text-muted font-mono">AI Minecraft Agent</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-ember-card rounded-lg border border-ember-card-border">
              <div className={cn(
                'w-2 h-2 rounded-full',
                status.connected ? 'status-online' : 'status-offline'
              )} />
              <span className="text-sm font-mono text-ember-text-muted">
                {status.connected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Right Side Info */}
          <div className="flex items-center gap-6">
            {/* Position */}
            <div className="flex items-center gap-2 text-ember-text-muted">
              <MapPin className="w-4 h-4 text-ember-primary" />
              <span className="font-mono text-sm">
                {status.position.x.toFixed(0)}, {status.position.y.toFixed(0)}, {status.position.z.toFixed(0)}
              </span>
            </div>

            {/* Biome */}
            <div className="px-2 py-1 bg-ember-card rounded border border-ember-card-border">
              <span className="font-mono text-xs text-ember-text-muted uppercase">
                {status.biome.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Uptime */}
            <div className="flex items-center gap-2 text-ember-text-muted">
              <Clock className="w-4 h-4 text-ember-primary" />
              <span className="font-mono text-sm">{formatUptime(uptime)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
