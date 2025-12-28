import { useState, useMemo } from 'react'
import { Code, ChevronDown, ChevronRight, Copy, Check, Search, Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'

interface CodeEntry {
  id: string
  task: string
  code: string
  timestamp: string
  success?: boolean
}

interface CodeViewerProps {
  currentCode: CodeEntry | null
  codeHistory: CodeEntry[]
}

type FilterType = 'all' | 'success' | 'failed'

const ITEMS_PER_PAGE = 10

export function CodeViewer({ currentCode, codeHistory }: CodeViewerProps) {
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  // Calculate stats
  const stats = useMemo(() => {
    const success = codeHistory.filter(c => c.success === true).length
    const failed = codeHistory.filter(c => c.success === false).length
    return { total: codeHistory.length, success, failed }
  }, [codeHistory])

  // Filter and search history
  const filteredHistory = useMemo(() => {
    return codeHistory
      .filter(entry => {
        // Apply filter
        if (filter === 'success' && entry.success !== true) return false
        if (filter === 'failed' && entry.success !== false) return false

        // Apply search
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return entry.task.toLowerCase().includes(query) ||
                 entry.code.toLowerCase().includes(query)
        }
        return true
      })
      .slice()
      .reverse()
  }, [codeHistory, filter, searchQuery])

  const visibleHistory = filteredHistory.slice(0, visibleCount)
  const hasMore = filteredHistory.length > visibleCount

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Code className="w-4 h-4 inline mr-2 text-ember-primary" />
          Generated Code
        </CardTitle>
        <span className="text-sm font-mono text-ember-text-muted">
          {stats.total} generated
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Code */}
        {currentCode ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono text-ember-primary uppercase tracking-wide">
                Current: {currentCode.task}
              </h3>
              <div className="flex items-center gap-2">
                {currentCode.success !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    currentCode.success
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {currentCode.success ? 'Success' : 'Failed'}
                  </span>
                )}
                <button
                  onClick={() => copyCode(currentCode.code, 'current')}
                  className="p-1 hover:bg-ember-card-border rounded transition-colors"
                  title="Copy code"
                >
                  {copiedId === 'current' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-ember-text-muted" />
                  )}
                </button>
              </div>
            </div>
            <pre className="bg-ember-background border border-ember-card-border rounded-lg p-4 overflow-x-auto text-sm font-mono text-ember-text leading-relaxed max-h-80 overflow-y-auto">
              <code>{currentCode.code}</code>
            </pre>
          </div>
        ) : (
          <div className="text-center py-8 text-ember-text-muted font-mono text-sm">
            No code generated yet
          </div>
        )}

        {/* History Section */}
        {codeHistory.length > 0 && (
          <div className="border-t border-ember-card-border pt-4">
            {/* History Header - Always visible */}
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="w-full flex items-center justify-between p-2 hover:bg-ember-card-border/30 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {historyExpanded ? (
                  <ChevronDown className="w-4 h-4 text-ember-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-ember-text-muted" />
                )}
                <span className="text-sm font-mono text-ember-text-muted uppercase tracking-wide">
                  History
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-ember-text-muted">{stats.total} total</span>
                <span className="text-green-400">{stats.success} success</span>
                <span className="text-red-400">{stats.failed} failed</span>
              </div>
            </button>

            {/* Expanded History */}
            {historyExpanded && (
              <div className="mt-3 space-y-3">
                {/* Search and Filter Bar */}
                <div className="flex flex-wrap gap-2">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ember-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setVisibleCount(ITEMS_PER_PAGE)
                      }}
                      placeholder="Search tasks or code..."
                      className="w-full pl-9 pr-3 py-2 bg-ember-background border border-ember-card-border rounded-lg text-sm font-mono text-ember-text placeholder:text-ember-text-muted focus:border-ember-primary focus:outline-none"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex gap-1">
                    {(['all', 'success', 'failed'] as FilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setFilter(f)
                          setVisibleCount(ITEMS_PER_PAGE)
                        }}
                        className={`px-3 py-2 text-xs font-mono rounded-lg transition-colors ${
                          filter === f
                            ? 'bg-ember-primary text-ember-background'
                            : 'bg-ember-background border border-ember-card-border text-ember-text-muted hover:text-ember-text'
                        }`}
                      >
                        {f === 'all' ? 'All' : f === 'success' ? 'Success' : 'Failed'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results count */}
                {(searchQuery || filter !== 'all') && (
                  <p className="text-xs font-mono text-ember-text-muted">
                    Showing {filteredHistory.length} of {codeHistory.length} entries
                  </p>
                )}

                {/* History List */}
                <div className="space-y-2">
                  {visibleHistory.length === 0 ? (
                    <p className="text-center py-4 text-sm font-mono text-ember-text-muted">
                      No matching entries
                    </p>
                  ) : (
                    visibleHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="border border-ember-card-border rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-ember-card-border/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {expandedItems.has(entry.id) ? (
                              <ChevronDown className="w-4 h-4 text-ember-text-muted flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-ember-text-muted flex-shrink-0" />
                            )}
                            <span className="font-mono text-sm text-ember-text truncate">
                              {entry.task}
                            </span>
                            {entry.success !== undefined && (
                              <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                                entry.success
                                  ? 'bg-green-900/50 text-green-400'
                                  : 'bg-red-900/50 text-red-400'
                              }`}>
                                {entry.success ? 'Success' : 'Failed'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-ember-text-muted flex-shrink-0 ml-2">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </button>
                        {expandedItems.has(entry.id) && (
                          <div className="border-t border-ember-card-border">
                            <div className="flex justify-end p-2 bg-ember-background">
                              <button
                                onClick={() => copyCode(entry.code, entry.id)}
                                className="p-1 hover:bg-ember-card-border rounded transition-colors"
                                title="Copy code"
                              >
                                {copiedId === entry.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-ember-text-muted" />
                                )}
                              </button>
                            </div>
                            <pre className="bg-ember-background p-4 overflow-x-auto text-sm font-mono text-ember-text leading-relaxed max-h-60 overflow-y-auto">
                              <code>{entry.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    className="w-full py-2 text-sm font-mono text-ember-primary hover:text-ember-text border border-ember-card-border rounded-lg hover:bg-ember-card-border/30 transition-colors"
                  >
                    Load more ({filteredHistory.length - visibleCount} remaining)
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
