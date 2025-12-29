import { useState } from 'react'
import { Play, Square, Wifi, WifiOff, Trash2, User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { cn } from '../lib/utils'
import type { BotProfile } from '../lib/types'

// Default bot profiles in case server hasn't loaded them
const DEFAULT_PROFILES: Record<string, BotProfile> = {
  minerva: {
    name: "Minerva",
    username: "minerva",
    personality: "Enthusiastic mining specialist who loves finding rare ores.",
    specialization: "mining",
    color: "#f59e0b"
  },
  steve: {
    name: "Craftsman Steve",
    username: "steve",
    personality: "Methodical builder who takes pride in efficiency.",
    specialization: "crafting",
    color: "#22c55e"
  },
  scout: {
    name: "Scout",
    username: "scout",
    personality: "Adventurous explorer who loves discovering new areas.",
    specialization: "exploration",
    color: "#3b82f6"
  }
}

interface ConnectionPanelProps {
  connected: boolean
  running: boolean
  botProfiles?: Record<string, BotProfile>
  activeBotId?: string
  onStart: (port: number, apiKey: string, botId: string) => void
  onStop: () => void
  onClear: () => void
}

export function ConnectionPanel({ connected, running, botProfiles, activeBotId, onStart, onStop, onClear }: ConnectionPanelProps) {
  const [port, setPort] = useState(localStorage.getItem('voyager_port') || '62305')
  // API key is stored in localStorage after first use, or loaded from environment
  const [apiKey, setApiKey] = useState(localStorage.getItem('voyager_api_key') || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedBotId, setSelectedBotId] = useState(localStorage.getItem('voyager_bot_id') || 'minerva')

  const profiles = botProfiles && Object.keys(botProfiles).length > 0 ? botProfiles : DEFAULT_PROFILES
  const selectedBot = profiles[selectedBotId] || profiles.minerva

  const handleStart = () => {
    if (apiKey) {
      localStorage.setItem('voyager_port', port)
      localStorage.setItem('voyager_api_key', apiKey)
      localStorage.setItem('voyager_bot_id', selectedBotId)
      onStart(parseInt(port), apiKey, selectedBotId)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {connected ? (
            <Wifi className="w-4 h-4 inline mr-2 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 inline mr-2 text-red-500" />
          )}
          Control Panel
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            running ? 'status-online' : 'status-offline'
          )} />
          <span className="text-sm font-mono text-ember-text-muted">
            {running ? 'Running' : 'Stopped'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bot Selector */}
        <div className="mb-4 p-3 bg-ember-background rounded-lg border border-ember-card-border">
          <label className="block text-xs font-mono text-ember-text-muted mb-2 uppercase">
            Select Bot
          </label>
          <div className="flex gap-2">
            {Object.entries(profiles).map(([id, bot]) => (
              <button
                key={id}
                onClick={() => setSelectedBotId(id)}
                disabled={running}
                className={cn(
                  "flex-1 p-3 rounded-lg border-2 transition-all disabled:opacity-50",
                  selectedBotId === id
                    ? "border-current bg-opacity-20"
                    : "border-ember-card-border hover:border-ember-text-muted"
                )}
                style={{
                  borderColor: selectedBotId === id ? bot.color : undefined,
                  backgroundColor: selectedBotId === id ? `${bot.color}15` : undefined
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" style={{ color: bot.color }} />
                  <span className="font-mono text-sm" style={{ color: bot.color }}>{bot.name}</span>
                </div>
                <div className="text-xs text-ember-text-muted capitalize">{bot.specialization}</div>
              </button>
            ))}
          </div>
          {selectedBot && (
            <p className="mt-2 text-xs text-ember-text-muted italic line-clamp-2">
              "{selectedBot.personality}"
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Port Input */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-mono text-ember-text-muted mb-1 uppercase">
              Minecraft LAN Port
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={port}
              onChange={(e) => setPort(e.target.value.replace(/\D/g, ''))}
              disabled={running}
              className="w-full px-3 py-2 bg-ember-background border border-ember-card-border rounded-lg font-mono text-ember-text focus:border-ember-primary focus:outline-none disabled:opacity-50"
              placeholder="62305"
            />
          </div>

          {/* API Key Input */}
          <div className="flex-[2] min-w-[250px]">
            <label className="block text-xs font-mono text-ember-text-muted mb-1 uppercase">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={running}
                className="w-full px-3 py-2 bg-ember-background border border-ember-card-border rounded-lg font-mono text-ember-text focus:border-ember-primary focus:outline-none disabled:opacity-50 pr-16"
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-ember-text-muted hover:text-ember-text"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Start/Stop Buttons */}
          <div className="flex gap-2">
            {!running ? (
              <button
                onClick={handleStart}
                disabled={!connected || !apiKey || !port}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-ember-card-border disabled:text-ember-text-muted disabled:cursor-not-allowed text-white font-mono rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            ) : (
              <button
                onClick={onStop}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono rounded-lg transition-colors"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            )}
            <button
              onClick={onClear}
              disabled={running}
              title="Clear all learned skills and start fresh"
              className="flex items-center gap-2 px-4 py-2 bg-ember-card hover:bg-ember-card-border border border-ember-card-border disabled:opacity-50 disabled:cursor-not-allowed text-ember-text-muted hover:text-ember-text font-mono rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {!connected && (
          <p className="mt-3 text-sm text-amber-400 font-mono">
            Server not connected. Run: npm run server
          </p>
        )}
        {connected && !running && (!apiKey || !port) && (
          <p className="mt-3 text-sm text-amber-400 font-mono">
            {!port && 'Enter a port number. '}
            {!apiKey && 'Enter your OpenAI API key to start.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
