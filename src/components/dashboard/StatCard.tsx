// src/components/ui/StatCard.tsx
'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ElementType } from 'react'

interface StatCardProps {
  title:     string
  value:     string
  change:    string
  icon:      ElementType
  trend:     'up' | 'down' | 'neutral'
  loading?:  boolean
  className?: string
}

export function StatCard({ title, value, change, icon: Icon, trend, loading, className }: StatCardProps) {
  const isUp      = trend === 'up'
  const isNeutral = trend === 'neutral'

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-dash-border bg-dash-surface backdrop-blur-sm p-6',
      'group hover:bg-dash-hover transition-all duration-300',
      className
    )}>
      <div className={cn(
        'absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-30',
        isUp ? 'bg-emerald-400' : isNeutral ? 'bg-blue-400' : 'bg-red-400'
      )} />

      <div className="relative flex items-start justify-between mb-5">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center',
          isUp      ? 'bg-emerald-500/10 border border-emerald-500/20' :
          isNeutral ? 'bg-blue-500/10    border border-blue-500/20'    :
                      'bg-red-500/10     border border-red-500/20'
        )}>
          <Icon className={cn(
            'w-5 h-5',
            isUp      ? 'text-emerald-500 dark:text-emerald-400' :
            isNeutral ? 'text-blue-500    dark:text-blue-400'    :
                        'text-red-500     dark:text-red-400'
          )} />
        </div>

        <span className={cn(
          'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
          isUp      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
          isNeutral ? 'bg-blue-500/10    text-blue-600    dark:text-blue-400    border border-blue-500/20'    :
                      'bg-red-500/10     text-red-600     dark:text-red-400     border border-red-500/20'
        )}>
          {!isNeutral && (isUp
            ? <TrendingUp   className="w-3 h-3" />
            : <TrendingDown className="w-3 h-3" />
          )}
          {loading
            ? <span className="w-10 h-3 rounded bg-current opacity-20 animate-pulse" />
            : change
          }
        </span>
      </div>

      {loading ? (
        <>
          <div className="h-7 w-32 rounded-lg bg-foreground/10 animate-pulse mb-2" />
          <div className="h-3 w-20 rounded   bg-foreground/10 animate-pulse" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold tracking-tight text-foreground mb-1">{value}</p>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
        </>
      )}
    </div>
  )
}