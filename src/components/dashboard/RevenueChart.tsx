'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'
import type { MonthlyRevenue } from '@/lib/hooks/useDashboard'

function fmt(naira: number) {
  if (naira >= 1_000_000) return `₦${(naira/1_000_000).toFixed(1)}M`
  if (naira >= 1_000)     return `₦${(naira/1_000).toFixed(0)}k`
  return `₦${naira.toLocaleString('en-NG')}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="font-semibold text-white mb-2">{label}</p>
      <div className="space-y-1">
        <p className="text-blue-400 text-xs">Revenue: <span className="font-bold">{fmt(payload[0]?.value ?? 0)}</span></p>
        {(payload[1]?.value ?? 0) > 0 && (
          <p className="text-red-400 text-xs">Expenses: <span className="font-bold">{fmt(payload[1]?.value ?? 0)}</span></p>
        )}
      </div>
    </div>
  )
}

const PERIODS = [
  { key: '3m',  label: '3M', slice: 9 },
  { key: '6m',  label: '6M', slice: 6 },
  { key: '12m', label: '1Y', slice: 0 },
] as const

interface Props {
  data:      MonthlyRevenue[]
  isLoading: boolean
}

export default function RevenueChart({ data, isLoading }: Props) {
  const [period, setPeriod] = useState<'3m' | '6m' | '12m'>('12m')
  const slice     = PERIODS.find(p => p.key === period)!.slice
  const chartData = (data ?? []).slice(slice)

  const totalRevenue  = chartData.reduce((s, d) => s + d.revenue,  0)
  const totalExpenses = chartData.reduce((s, d) => s + d.expenses, 0)

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-6 h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-white text-sm">Revenue vs Expenses</h3>
          </div>
          {isLoading ? (
            <div className="h-7 w-32 rounded-lg bg-white/5 animate-pulse mt-1" />
          ) : (
            <>
              <p className="text-2xl font-bold text-white">{fmt(totalRevenue)}</p>
              {totalExpenses > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Expenses: <span className="text-red-400">{fmt(totalExpenses)}</span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Period toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/8">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                period === p.key ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-300')}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && <div className="h-[200px] rounded-xl bg-white/5 animate-pulse" />}

      {/* Empty state */}
      {!isLoading && totalRevenue === 0 && (
        <div className="h-[200px] flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-white mb-1">No sales data yet</p>
          <p className="text-xs text-gray-500">Revenue will appear here once you record sales</p>
        </div>
      )}

      {/* Chart */}
      {!isLoading && totalRevenue > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3f9af5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3f9af5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1e6 ? `₦${(v/1e6).toFixed(0)}M` : v >= 1000 ? `₦${(v/1000).toFixed(0)}k` : `₦${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue"  stroke="#3f9af5" strokeWidth={2} fill="url(#gradRevenue)"  dot={false} />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#gradExpenses)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      {!isLoading && (
        <div className="flex items-center gap-5 mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-4 h-0.5 bg-blue-400 rounded inline-block" /> Revenue
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-4 h-0.5 bg-red-400 rounded inline-block" /> Expenses
          </div>
        </div>
      )}
    </div>
  )
}
