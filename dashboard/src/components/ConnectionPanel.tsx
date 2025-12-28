import { useState } from 'react'
import { Play, Square, Wifi, WifiOff, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { cn } from '../lib/utils'

interface ConnectionPanelProps {
  connected: boolean
  running: boolean
  onStart: (port: number, apiKey: string) => void
  onStop: () => void
  onClear: () => void
}

export function ConnectionPanel({ connected, running, onStart, onStop, onClear }: ConnectionPanelProps) {
  const [port, setPort] = useState('62305')
  // API key is stored in localStorage after first use, or loaded from environment
  const [apiKey, setApiKey] = useState(localStorage.getItem('voyager_api_key') || '')
  const [showApiKey, setShowApiKey] = useState(false)

  const handleStart = () => {
    if (apiKey) {
      localStorage.setItem('voyager_api_key', apiKey)
      onStart(parseInt(port), apiKey)
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
        <div className="flex flex-wrap items-end gap-4">
          {/* Port Input */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-mono text-ember-text-muted mb-1 uppercase">
              Minecraft LAN Port
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
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
