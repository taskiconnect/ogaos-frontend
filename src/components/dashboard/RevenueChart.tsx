'use client'

// src/components/dashboard/RevenueChart.tsx
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listSales } from '@/lib/api/finance'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { cn } from '@/lib/utils'
import { TrendingUp, ChevronDown, Calendar } from 'lucide-react'
import type { Sale } from '@/lib/api/types'

type Period = '1d' | '3d' | '5d' | '1w' | '2w' | '1m' | '3m' | '6m' | '1y' | '2y'

const PERIODS: { key: Period; label: string; days: number; format: 'hour' | 'day' | 'month' }[] = [
  { key: '1d', label: '1D', days: 1, format: 'hour' },
  { key: '3d', label: '3D', days: 3, format: 'hour' },
  { key: '5d', label: '5D', days: 5, format: 'day' },
  { key: '1w', label: '1W', days: 7, format: 'day' },
  { key: '2w', label: '2W', days: 14, format: 'day' },
  { key: '1m', label: '1M', days: 30, format: 'day' },
  { key: '3m', label: '3M', days: 90, format: 'day' },
  { key: '6m', label: '6M', days: 180, format: 'month' },
  { key: '1y', label: '1Y', days: 365, format: 'month' },
  { key: '2y', label: '2Y', days: 730, format: 'month' },
]

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatHour(date: Date): string {
  return date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return DAY_NAMES[date.getDay()] || date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

function formatMonth(date: Date): string {
  return MONTH_NAMES[date.getMonth()]
}

function buildChartData(sales: Sale[], days: number, format: 'hour' | 'day' | 'month') {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - days + 1)
  startDate.setHours(0, 0, 0, 0)
  
  const result: any[] = []
  
  if (format === 'hour' && days <= 3) {
    // For 1-3 days, show hourly data
    const hours = days * 24
    for (let i = hours - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setHours(now.getHours() - i)
      const hourKey = date.toISOString().slice(0, 13)
      result.push({
        key: hourKey,
        label: formatHour(date),
        date: date,
        revenue: 0,
        expenses: 0,
      })
    }
  } else if (format === 'day' || (format === 'hour' && days > 3)) {
    // For days/weeks, show daily data
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dayKey = date.toISOString().slice(0, 10)
      result.push({
        key: dayKey,
        label: formatDay(date),
        date: date,
        revenue: 0,
        expenses: 0,
      })
    }
  } else {
    // For months/years, show monthly data
    const months = Math.ceil(days / 30)
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      result.push({
        key: monthKey,
        label: formatMonth(date),
        date: date,
        revenue: 0,
        expenses: 0,
      })
    }
  }
  
  // Aggregate sales data
  for (const sale of sales) {
    const saleDate = new Date(sale.created_at)
    let matched = false
    
    for (const bucket of result) {
      if (format === 'hour' && days <= 3) {
        const bucketHour = new Date(bucket.key + ':00:00')
        if (saleDate.getTime() >= bucketHour.getTime() && 
            saleDate.getTime() < bucketHour.getTime() + 3600000) {
          bucket.revenue += Math.round(sale.amount_paid / 100)
          matched = true
          break
        }
      } else if (format === 'day' || (format === 'hour' && days > 3)) {
        const bucketDay = bucket.key
        const saleDay = saleDate.toISOString().slice(0, 10)
        if (bucketDay === saleDay) {
          bucket.revenue += Math.round(sale.amount_paid / 100)
          matched = true
          break
        }
      } else {
        const bucketMonth = bucket.key
        const saleMonth = `${saleDate.getFullYear()}-${saleDate.getMonth()}`
        if (bucketMonth === saleMonth) {
          bucket.revenue += Math.round(sale.amount_paid / 100)
          matched = true
          break
        }
      }
    }
  }
  
  return result
}

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG')}`
}

export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>('1m')
  const [showDropdown, setShowDropdown] = useState(false)
  
  const periodConfig = PERIODS.find(p => p.key === period)!
  const { days, format } = periodConfig
  
  const { data, isLoading } = useQuery({
    queryKey: ['sales', 'chart', period],
    queryFn: async () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const dateFrom = startDate.toISOString().slice(0, 10)
      return listSales({ date_from: dateFrom, limit: 2000 })
    },
    staleTime: 1000 * 60 * 2,
  })
  
  const chartData = useMemo(() => {
    return buildChartData(data?.data ?? [], days, format)
  }, [data, days, format])
  
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0)
  const averageRevenue = chartData.length ? totalRevenue / chartData.length : 0
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 0)
  
  // Get visible periods for dropdown (first 5 and last 5)
  const visiblePeriods = PERIODS
  
  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-white text-sm">Revenue vs Expenses</h3>
          {!isLoading && totalRevenue > 0 && (
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-gray-500">
                Total: <span className="text-emerald-400 font-semibold">{fmt(totalRevenue)}</span>
              </p>
              <p className="text-xs text-gray-500">
                Avg: <span className="text-blue-400">{fmt(averageRevenue)}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Period selector - Desktop */}
        <div className="hidden sm:flex gap-1 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap',
                period === p.key
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:text-white hover:bg-white/8',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        
        {/* Period selector - Mobile dropdown */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white"
          >
            <Calendar className="w-3.5 h-3.5" />
            {periodConfig.label}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showDropdown && 'rotate-180')} />
          </button>
          
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-20 w-32 rounded-xl bg-dash-surface border border-dash-border shadow-lg overflow-hidden">
                {PERIODS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => {
                      setPeriod(p.key)
                      setShowDropdown(false)
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-xs text-left transition-colors',
                      period === p.key
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Chart */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : totalRevenue === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <TrendingUp className="w-8 h-8 text-gray-700 mb-2" />
          <p className="text-sm text-gray-500">No sales data yet</p>
          <p className="text-xs text-gray-600 mt-0.5">
            Revenue will appear here once you record sales
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3f9af5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3f9af5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(chartData.length / 8)}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmt(v)}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f0f14',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  fontSize: 11,
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
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3f9af5]" /> Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Expenses
        </span>
        {maxRevenue > 0 && (
          <span className="text-[10px] text-gray-600 ml-auto">
            Peak: {fmt(maxRevenue)}
          </span>
        )}
      </div>
    </div>
  )
}