import { useState, useRef, useEffect } from 'react'
import { Terminal, Filter, ArrowDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { cn } from '../lib/utils'
import type { LogEntry } from '../lib/types'

interface LogViewerProps {
  logs: LogEntry[]
}

const LOG_COLORS: Record<string, string> = {
  action: 'text-blue-400',
  critic: 'text-red-400',
  curriculum: 'text-purple-400',
  skill: 'text-yellow-400',
  error: 'text-red-500 font-bold',
  info: 'text-ember-text-muted'
}

const LOG_LABELS: Record<string, string> = {
  action: 'ACTION',
  critic: 'CRITIC',
  curriculum: 'CURRICULUM',
  skill: 'SKILL',
  error: 'ERROR',
  info: 'INFO'
}

export function LogViewer({ logs }: LogViewerProps) {
  const [filter, setFilter] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredLogs = filter
    ? logs.filter(log => log.type === filter)
    : logs

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      // Scroll within container only, not the page
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const filters = ['action', 'critic', 'curriculum', 'skill', 'error', 'info']

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <CardTitle>
            <Terminal className="w-4 h-4 inline mr-2" />
            Live Logs
          </CardTitle>

          {/* Filters */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-ember-text-muted" />
            <button
              onClick={() => setFilter(null)}
              className={cn(
                'px-2 py-0.5 text-xs font-mono rounded',
                filter === null
                  ? 'bg-ember-primary text-ember-primary-foreground'
                  : 'text-ember-text-muted hover:text-ember-text'
              )}
            >
              All
            </button>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-2 py-0.5 text-xs font-mono rounded capitalize',
                  filter === f
                    ? 'bg-ember-primary text-ember-primary-foreground'
                    : 'text-ember-text-muted hover:text-ember-text'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-scroll toggle */}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 text-xs font-mono rounded border',
            autoScroll
              ? 'border-ember-primary text-ember-primary'
              : 'border-ember-card-border text-ember-text-muted'
          )}
        >
          <ArrowDown className="w-3 h-3" />
          Auto
        </button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="h-full overflow-y-auto bg-ember-background rounded-lg p-3 font-mono text-xs"
        >
          {filteredLogs.length === 0 ? (
            <p className="text-ember-text-muted">No logs yet...</p>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="py-1 border-b border-ember-card-border/30 last:border-0">
                <span className="text-ember-text-muted mr-2">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn('mr-2', LOG_COLORS[log.type])}>
                  [{LOG_LABELS[log.type]}]
                </span>
                <span className="text-ember-text">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
