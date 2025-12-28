import { Brain, CheckCircle, XCircle, Sparkles, User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import type { Task, Skill } from '../lib/types'

// Bot colors for attribution display
const BOT_COLORS: Record<string, string> = {
  minerva: '#f59e0b',
  steve: '#22c55e',
  scout: '#3b82f6',
  legacy: '#a8a29e',
  bot: '#a8a29e',
}

interface LearningProgressProps {
  currentTask: Task | null
  completedTasks: string[]
  failedTasks: string[]
  skills: Skill[]
}

export function LearningProgress({ currentTask, completedTasks, failedTasks, skills }: LearningProgressProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Current Task & Stats */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Brain className="w-4 h-4 inline mr-2" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Row */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-mono text-sm text-ember-text">
                {completedTasks.length} completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="font-mono text-sm text-ember-text">
                {failedTasks.length} failed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ember-primary" />
              <span className="font-mono text-sm text-ember-text">
                {skills.length} skills
              </span>
            </div>
          </div>

          {/* Current Task */}
          <div className="p-3 bg-ember-background rounded-lg border border-ember-card-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-ember-text-muted uppercase">Current Task</span>
              {currentTask && (
                <Badge variant="warning">Attempt {currentTask.attempts}/4</Badge>
              )}
            </div>
            <p className="font-mono text-ember-text">
              {currentTask?.name || 'No active task'}
            </p>
          </div>

          {/* Recent Completed */}
          <div>
            <span className="text-xs font-mono text-ember-text-muted uppercase mb-2 block">
              Recent Completed
            </span>
            <div className="flex flex-wrap gap-2">
              {completedTasks.slice(-5).map((task, i) => (
                <Badge key={i} variant="success">{task}</Badge>
              ))}
              {completedTasks.length === 0 && (
                <span className="text-sm text-ember-text-muted">None yet</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Library */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sparkles className="w-4 h-4 inline mr-2" />
            Skills Library
          </CardTitle>
          <span className="text-sm text-ember-text-muted font-mono">
            {skills.length} learned
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {skills.length === 0 ? (
              <p className="text-ember-text-muted text-sm font-mono">No skills learned yet</p>
            ) : (
              skills.map((skill, i) => (
                <div
                  key={i}
                  className="p-2 bg-ember-background rounded border border-ember-card-border hover:border-ember-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-ember-primary">{skill.name}</span>
                    {skill.createdBy && (
                      <div
                        className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${BOT_COLORS[skill.createdBy] || BOT_COLORS.legacy}20`,
                          color: BOT_COLORS[skill.createdBy] || BOT_COLORS.legacy
                        }}
                        title={`Created by ${skill.createdByName || skill.createdBy}`}
                      >
                        <User className="w-3 h-3" />
                        <span className="font-mono">{skill.createdByName || skill.createdBy}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-ember-text-muted mt-1 line-clamp-2">
                    {skill.description}
                  </p>
                  {(skill.successCount !== undefined || skill.failCount !== undefined) && (
                    <div className="flex gap-2 mt-1 text-xs font-mono">
                      {skill.successCount !== undefined && skill.successCount > 0 && (
                        <span className="text-green-400">{skill.successCount} success</span>
                      )}
                      {skill.failCount !== undefined && skill.failCount > 0 && (
                        <span className="text-red-400">{skill.failCount} fail</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
