import { Package } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import type { InventoryItem } from '../lib/types'

interface InventoryGridProps {
  items: InventoryItem[]
}

export function InventoryGrid({ items }: InventoryGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Package className="w-4 h-4 inline mr-2" />
          Inventory
        </CardTitle>
        <span className="text-sm text-ember-text-muted font-mono">
          {items.length}/36 slots
        </span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-ember-text-muted text-sm font-mono">Empty</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="aspect-square bg-ember-background border border-ember-card-border rounded-lg p-2 flex flex-col items-center justify-center hover:border-ember-primary/50 transition-colors"
                title={item.name}
              >
                <span className="text-xs font-mono text-ember-text truncate max-w-full">
                  {item.name.replace(/_/g, ' ').slice(0, 8)}
                </span>
                <span className="text-xs font-mono text-ember-primary font-bold">
                  x{item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
