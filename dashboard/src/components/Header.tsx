import { useState } from 'react'
import { Cpu, MapPin, Clock, Copy, Check, Navigation } from 'lucide-react'
import { cn } from '../lib/utils'
import type { BotStatus } from '../lib/types'

interface HeaderProps {
  status: BotStatus
  uptime: number
}

const SURFACE_Y = 64 // Approximate sea level / surface
const TELEPORT_OFFSET = 5 // Blocks away from bot to teleport

type CopyType = 'toBot' | 'botToMe' | null

export function Header({ status, uptime }: HeaderProps) {
  const [copied, setCopied] = useState<CopyType>(null)

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleTeleportToBot = async () => {
    const { x, y, z } = status.position

    // Calculate safe Y position - if underground, go to surface
    // Add some height so player spawns safely
    const safeY = y < SURFACE_Y ? SURFACE_Y + 5 : y + 2

    // Teleport slightly offset from bot so we can see it
    const tpX = Math.round(x) + TELEPORT_OFFSET
    const tpY = Math.round(safeY)
    const tpZ = Math.round(z) + TELEPORT_OFFSET

    const command = `/tp @p ${tpX} ${tpY} ${tpZ}`

    await navigator.clipboard.writeText(command)
    setCopied('toBot')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSummonBot = async () => {
    // Teleport bot to nearest player
    const command = `/tp bot @p`

    await navigator.clipboard.writeText(command)
    setCopied('botToMe')
    setTimeout(() => setCopied(null), 2000)
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
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-ember-card rounded-lg border border-ember-card-border"
              title={
                status.activityStatus === 'inactive'
                  ? 'Process running but no bot activity detected. Bot may have disconnected from server.'
                  : status.activityStatus === 'active'
                  ? 'Bot is actively working in Minecraft'
                  : 'Bot is not running'
              }
            >
              <div className={cn(
                'w-2 h-2 rounded-full',
                status.activityStatus === 'active' && 'status-online',
                status.activityStatus === 'inactive' && 'status-warning',
                status.activityStatus === 'offline' && 'status-offline'
              )} />
              <span className={cn(
                'text-sm font-mono',
                status.activityStatus === 'active' && 'text-green-400',
                status.activityStatus === 'inactive' && 'text-yellow-400',
                status.activityStatus === 'offline' && 'text-ember-text-muted'
              )}>
                {status.activityStatus === 'active' && 'Active'}
                {status.activityStatus === 'inactive' && 'Inactive'}
                {status.activityStatus === 'offline' && 'Offline'}
              </span>
            </div>
          </div>

          {/* Right Side Info */}
          <div className="flex items-center gap-6">
            {/* Position & Teleport Controls */}
            <div className="flex items-center gap-1">
              {/* Go to bot */}
              <button
                onClick={handleTeleportToBot}
                className="flex items-center gap-2 text-ember-text-muted hover:text-ember-text px-3 py-1.5 rounded-lg hover:bg-ember-card-border/50 transition-colors group"
                title="Copy command to teleport YOU to the bot"
              >
                <MapPin className="w-4 h-4 text-ember-primary" />
                <span className="font-mono text-sm">
                  {status.position.x.toFixed(0)}, {status.position.y.toFixed(0)}, {status.position.z.toFixed(0)}
                </span>
                {copied === 'toBot' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
              </button>

              {/* Summon bot to player */}
              <button
                onClick={handleSummonBot}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  copied === 'botToMe'
                    ? "bg-green-900/50 text-green-400"
                    : "text-ember-text-muted hover:text-ember-primary hover:bg-ember-card-border/50"
                )}
                title="Copy command to summon BOT to you"
              >
                {copied === 'botToMe' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>
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

      {/* Toast notification for copied */}
      {copied && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-green-900/90 text-green-100 rounded-lg font-mono text-sm shadow-lg animate-fade-in">
          {copied === 'toBot'
            ? 'Teleport command copied! Paste in Minecraft to go to bot.'
            : 'Summon command copied! Paste in Minecraft to bring bot to you.'}
        </div>
      )}
    </header>
  )
}
