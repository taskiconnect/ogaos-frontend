'use client'

// src/components/dashboard/RevenueChart.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listSales } from '@/lib/api/finance'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'
import type { Sale } from '@/lib/api/types'

type Period = '3m' | '6m' | '1y'
const PERIODS: { key: Period; label: string; months: number }[] = [
  { key: '3m', label: '3M', months: 3  },
  { key: '6m', label: '6M', months: 6  },
  { key: '1y', label: '1Y', months: 12 },
]
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildChartData(sales: Sale[], months: number) {
  const now    = new Date()
  const result = []
  for (let i = months - 1; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    result.push({ month: MONTH_NAMES[d.getMonth()], key, revenue: 0, expenses: 0 })
  }
  for (const s of sales) {
    const d   = new Date(s.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const bucket = result.find(r => r.key === key)
    if (bucket) bucket.revenue += Math.round(s.amount_paid / 100)
  }
  return result
}

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG')}`
}

export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>('6m')
  const months = PERIODS.find(p => p.key === period)!.months

  const { data, isLoading } = useQuery({
    queryKey:  ['sales', 'chart', period],
    queryFn:   () => listSales({ date_from: `${new Date().getFullYear()}-01-01`, limit: 500 }),
    staleTime: 1000 * 60 * 10,
  })

  const chartData    = buildChartData(data?.data ?? [], months)
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-sm">Revenue vs Expenses</h3>
          {!isLoading && (
            <p className="text-xs text-gray-500 mt-0.5">{fmt(totalRevenue)} collected</p>
          )}
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                period === p.key
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:text-white hover:bg-white/8',
              )}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : totalRevenue === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <TrendingUp className="w-8 h-8 text-gray-700 mb-2" />
          <p className="text-sm text-gray-500">No sales data yet</p>
          <p className="text-xs text-gray-600 mt-0.5">Revenue will appear here once you record sales</p>
        </div>
      ) : (
        <div className="flex-1 min-h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3f9af5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3f9af5" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmt(v)}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  background:   '#0f0f14',
                  border:       '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  fontSize:     12,
                }}
                labelStyle={{ color: '#fff', fontWeight: 600 }}
                formatter={(v: number | string | undefined) => [fmt(Number(v ?? 0)), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3f9af5"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3f9af5]" /> Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Expenses
        </span>
      </div>
    </div>
  )
}