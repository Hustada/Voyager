import { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from './components/Header'
import { StatusCards } from './components/StatusCards'
import { InventoryGrid } from './components/InventoryGrid'
import { LearningProgress } from './components/LearningProgress'
import { LogViewer } from './components/LogViewer'
import { ConnectionPanel } from './components/ConnectionPanel'
import { CodeViewer } from './components/CodeViewer'
import type { VoyagerState, LogEntry, CodeEntry } from './lib/types'

const INITIAL_STATE: VoyagerState = {
  status: {
    connected: false,
    health: 20,
    hunger: 20,
    position: { x: 0, y: 64, z: 0 },
    biome: 'unknown',
    timeOfDay: 'day',
    equipment: [null, null, null, null, null, null]
  },
  inventory: [],
  currentTask: null,
  completedTasks: [],
  failedTasks: [],
  skills: [],
  logs: [],
  currentCode: null,
  codeHistory: []
}

function App() {
  const [state, setState] = useState<VoyagerState>(INITIAL_STATE)
  const [uptime, setUptime] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [botRunning, setBotRunning] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  // Code block accumulation
  const codeAccumulator = useRef<string[]>([])
  const isInCodeBlock = useRef(false)
  const currentTaskForCode = useRef<string>('')

  // Connect to WebSocket server
  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket('ws://localhost:8765')

    ws.onopen = () => {
      console.log('Connected to control server')
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'status') {
        setBotRunning(data.running)
        setState(prev => ({
          ...prev,
          status: { ...prev.status, connected: data.running }
        }))
      } else if (data.type === 'state') {
        // Restore state from server (on connect/refresh)
        setState(prev => ({
          ...prev,
          completedTasks: data.completedTasks || [],
          failedTasks: data.failedTasks || [],
          skills: (data.skills || []).map((s: { name: string; description: string; code: string }) => ({
            name: s.name,
            description: s.description || 'Learned skill',
            code: s.code || ''
          })),
          currentTask: data.currentTask ? {
            id: Date.now().toString(),
            name: data.currentTask,
            status: 'in_progress' as const,
            attempts: 1,
            timestamp: new Date().toISOString()
          } : null
        }))
      } else if (data.type === 'log') {
        const newLog: LogEntry = {
          id: Date.now().toString() + Math.random(),
          timestamp: data.timestamp || new Date().toISOString(),
          type: data.level as LogEntry['type'],
          message: data.message
        }

        // Parse special messages
        parseLogMessage(data.message, data.level)

        setState(prev => ({
          ...prev,
          logs: [...prev.logs.slice(-500), newLog]
        }))
      }
    }

    ws.onclose = () => {
      console.log('Disconnected from control server')
      setWsConnected(false)
      setBotRunning(false)

      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(connectWs, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }, [])

  // Parse log messages to extract state info
  const parseLogMessage = (message: string, level: string) => {
    // Extract inventory
    if (message.includes('Inventory (')) {
      const match = message.match(/Inventory \(\d+\/36\): (.+)/)
      if (match) {
        try {
          const invStr = match[1].replace(/'/g, '"')
          const inv = JSON.parse(invStr)
          const items = Object.entries(inv).map(([name, count]) => ({
            name,
            count: count as number
          }))
          setState(prev => ({ ...prev, inventory: items }))
        } catch {}
      }
    }

    // Extract position
    if (message.includes('Position: x=')) {
      const match = message.match(/Position: x=([\d.-]+), y=([\d.-]+), z=([\d.-]+)/)
      if (match) {
        setState(prev => ({
          ...prev,
          status: {
            ...prev.status,
            position: {
              x: parseFloat(match[1]),
              y: parseFloat(match[2]),
              z: parseFloat(match[3])
            }
          }
        }))
      }
    }

    // Extract biome
    if (message.includes('Biome: ')) {
      const match = message.match(/Biome: (\w+)/)
      if (match) {
        setState(prev => ({
          ...prev,
          status: { ...prev.status, biome: match[1] }
        }))
      }
    }

    // Extract health/hunger
    if (message.includes('Health: ')) {
      const match = message.match(/Health: ([\d.]+)\/20/)
      if (match) {
        setState(prev => ({
          ...prev,
          status: { ...prev.status, health: parseFloat(match[1]) }
        }))
      }
    }
    if (message.includes('Hunger: ')) {
      const match = message.match(/Hunger: ([\d.]+)\/20/)
      if (match) {
        setState(prev => ({
          ...prev,
          status: { ...prev.status, hunger: parseFloat(match[1]) }
        }))
      }
    }

    // Extract current task
    if (message.includes('Starting task ')) {
      const match = message.match(/Starting task (.+) for at most/)
      if (match) {
        setState(prev => ({
          ...prev,
          currentTask: {
            id: Date.now().toString(),
            name: match[1],
            status: 'in_progress',
            attempts: 1,
            timestamp: new Date().toISOString()
          }
        }))
      }
    }

    // Extract completed tasks
    if (message.includes('Completed task ')) {
      const match = message.match(/Completed task (.+)\./)
      if (match) {
        setState(prev => ({
          ...prev,
          completedTasks: [...new Set([...prev.completedTasks, match[1]])],
          currentTask: null
        }))
      }
    }

    // Extract skills
    if (message.includes('Skill Manager generated description for ')) {
      const match = message.match(/generated description for (\w+):/)
      if (match) {
        setState(prev => ({
          ...prev,
          skills: [...prev.skills.filter(s => s.name !== match[1]), {
            name: match[1],
            description: 'Learned skill',
            code: ''
          }]
        }))
      }
    }

    // Track code blocks
    if (message === 'Code:') {
      isInCodeBlock.current = true
      codeAccumulator.current = []
      return
    }

    if (isInCodeBlock.current) {
      // End of code block markers
      if (message.startsWith('```') && codeAccumulator.current.length > 0) {
        // Finished accumulating code
        const code = codeAccumulator.current
          .filter(line => !line.startsWith('```'))
          .join('\n')
          .trim()

        if (code) {
          const newCodeEntry: CodeEntry = {
            id: Date.now().toString(),
            task: currentTaskForCode.current || 'Unknown task',
            code,
            timestamp: new Date().toISOString()
          }

          setState(prev => ({
            ...prev,
            currentCode: newCodeEntry,
            codeHistory: [...prev.codeHistory, newCodeEntry]
          }))
        }

        isInCodeBlock.current = false
        codeAccumulator.current = []
        return
      }

      // Accumulate code lines
      codeAccumulator.current.push(message)
    }

    // Track task for code association
    if (message.includes('Task: ')) {
      const match = message.match(/Task: (.+)/)
      if (match) {
        currentTaskForCode.current = match[1]
      }
    }

    // Mark code success/failure
    if (message.includes('Completed task ')) {
      setState(prev => {
        if (prev.currentCode) {
          const updatedCode = { ...prev.currentCode, success: true }
          return {
            ...prev,
            currentCode: updatedCode,
            codeHistory: prev.codeHistory.map(c =>
              c.id === updatedCode.id ? updatedCode : c
            )
          }
        }
        return prev
      })
    }

    if (message.includes('Failed to complete task') || message.includes('Task failed')) {
      setState(prev => {
        if (prev.currentCode) {
          const updatedCode = { ...prev.currentCode, success: false }
          return {
            ...prev,
            currentCode: updatedCode,
            codeHistory: prev.codeHistory.map(c =>
              c.id === updatedCode.id ? updatedCode : c
            )
          }
        }
        return prev
      })
    }
  }

  useEffect(() => {
    connectWs()
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [connectWs])

  // Uptime counter
  useEffect(() => {
    if (!botRunning) {
      setUptime(0)
      return
    }
    const interval = setInterval(() => {
      setUptime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [botRunning])

  const handleStart = (port: number, apiKey: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'start', port, apiKey }))
  }

  const handleStop = () => {
    wsRef.current?.send(JSON.stringify({ type: 'stop' }))
  }

  const handleClear = () => {
    if (confirm('Clear all learned skills and progress? This cannot be undone.')) {
      wsRef.current?.send(JSON.stringify({ type: 'clear' }))
      // Reset dashboard state
      setState(prev => ({
        ...INITIAL_STATE,
        logs: prev.logs
      }))
    }
  }

  return (
    <div className="min-h-screen grid-background">
      <Header status={state.status} uptime={uptime} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Connection Panel */}
        <ConnectionPanel
          connected={wsConnected}
          running={botRunning}
          onStart={handleStart}
          onStop={handleStop}
          onClear={handleClear}
        />

        {/* Status Cards Row */}
        <StatusCards status={state.status} />

        {/* Inventory */}
        <InventoryGrid items={state.inventory} />

        {/* Learning Progress */}
        <LearningProgress
          currentTask={state.currentTask}
          completedTasks={state.completedTasks}
          failedTasks={state.failedTasks}
          skills={state.skills}
        />

        {/* Generated Code */}
        <CodeViewer
          currentCode={state.currentCode}
          codeHistory={state.codeHistory}
        />

        {/* Logs */}
        <LogViewer logs={state.logs} />
      </main>

      {/* Footer */}
      <footer className="border-t border-ember-card-border py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-mono text-ember-text-muted">
            Voyager Dashboard - Powered by GPT-4o
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
