import { Heart, Drumstick, Sun, Sword } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Progress } from './ui/Progress'
import type { BotStatus } from '../lib/types'

interface StatusCardsProps {
  status: BotStatus
}

export function StatusCards({ status }: StatusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Health */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Heart className="w-4 h-4 inline mr-2" />
            Health
          </CardTitle>
          <span className="font-mono text-lg text-ember-text">
            {status.health.toFixed(0)}/20
          </span>
        </CardHeader>
        <CardContent>
          <Progress value={status.health} max={20} variant="health" />
        </CardContent>
      </Card>

      {/* Hunger */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Drumstick className="w-4 h-4 inline mr-2" />
            Hunger
          </CardTitle>
          <span className="font-mono text-lg text-ember-text">
            {status.hunger.toFixed(0)}/20
          </span>
        </CardHeader>
        <CardContent>
          <Progress value={status.hunger} max={20} variant="hunger" />
        </CardContent>
      </Card>

      {/* Time of Day */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sun className="w-4 h-4 inline mr-2" />
            Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="font-mono text-lg text-ember-text capitalize">
            {status.timeOfDay}
          </span>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sword className="w-4 h-4 inline mr-2" />
            Main Hand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="font-mono text-sm text-ember-text">
            {status.equipment[4] || 'Empty'}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
