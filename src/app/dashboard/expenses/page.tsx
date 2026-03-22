'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listExpenses, deleteExpense, getExpenseSummary } from '@/lib/api/finance'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Plus, Search, Receipt, Trash2, ChevronDown, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Expense } from '@/lib/api/types'
import CreateExpenseModal from '@/components/expenses/CreateExpenseModal'
import EditExpenseDrawer from '@/components/expenses/EditExpenseDrawer'

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}

const CATEGORIES = [
  'Rent', 'Salaries', 'Utilities', 'Marketing', 'Transport',
  'Equipment', 'Supplies', 'Maintenance', 'Insurance', 'Other',
]

const TYPE_CLS: Record<string, string> = {
  opex:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  capex: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

function MiniStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function ExpensesPage() {
  const qc = useQueryClient()
  const now = new Date()

  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [dateOpt, setDateOpt]       = useState('month')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected]     = useState<Expense | null>(null)

  function dateRange(v: string) {
    const d = new Date(), p = (n: number) => String(n).padStart(2, '0')
    const fd = (x: Date) => `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`
    if (v === 'today') { const t = fd(d); return { date_from: t, date_to: t } }
    if (v === 'week')  { const s = new Date(d); s.setDate(d.getDate()-d.getDay()); return { date_from: fd(s), date_to: fd(d) } }
    if (v === 'month') { return { date_from: fd(new Date(d.getFullYear(), d.getMonth(), 1)), date_to: fd(d) } }
    if (v === 'year')  { return { date_from: `${d.getFullYear()}-01-01`, date_to: fd(d) } }
    return {}
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['expenses', typeFilter, catFilter, dateOpt],
    queryFn: ({ pageParam }) => listExpenses({
      limit: 30, cursor: pageParam as string | undefined,
      expense_type: (typeFilter as 'opex' | 'capex') || undefined,
      category: catFilter || undefined,
      ...dateRange(dateOpt),
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) => last.next_cursor ?? undefined,
  })

  const { data: summary } = useQuery({
    queryKey: ['expense-summary', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => getExpenseSummary(now.getFullYear(), now.getMonth() + 1),
  })

  const allExpenses: Expense[] = useMemo(
    () => (data?.pages ?? []).flatMap((p: any) => p.data ?? []), [data]
  )
  const filtered = useMemo(() => {
    if (!search.trim()) return allExpenses
    const q = search.toLowerCase()
    return allExpenses.filter(e =>
      e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    )
  }, [allExpenses, search])

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })

  const thisMonthTotal = summary?.total_amount ?? 0
  const opexTotal      = summary?.total_opex ?? 0
  const capexTotal     = summary?.total_capex ?? 0
  const topCategory    = summary?.by_category
    ? Object.entries(summary.by_category).sort((a, b) => b[1] - a[1])[0]
    : null

  const DATE_OPTS = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This year', value: 'year' },
    { label: 'All time', value: '' },
  ]

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-20">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
              <p className="text-gray-400 mt-1 text-sm">Track operating and capital expenses</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <Plus className="w-4 h-4" /> Add Expense
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat label="This Month"   value={fmt(thisMonthTotal)} color="text-white"         sub={`${now.toLocaleString('en-NG', { month: 'long' })}`} />
            <MiniStat label="OpEx"         value={fmt(opexTotal)}      color="text-blue-400"      sub="operating expenses" />
            <MiniStat label="CapEx"        value={fmt(capexTotal)}     color="text-purple-400"    sub="capital expenses" />
            <MiniStat label="Top Category" value={topCategory ? topCategory[0] : '—'}
              color="text-yellow-400" sub={topCategory ? fmt(topCategory[1]) : 'No data yet'} />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search description or category..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
            </div>
            <div className="flex gap-2">
              {(['', 'opex', 'capex'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={cn('px-3 py-2 rounded-xl text-xs font-semibold border uppercase transition-all',
                    typeFilter === t ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                  {t || 'All'}
                </button>
              ))}
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none">
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={dateOpt} onChange={e => setDateOpt(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none">
              {DATE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* List */}
          <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 text-sm">Loading expenses...</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 flex flex-col items-center text-center">
                <TrendingDown className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No expenses found</p>
                <p className="text-gray-600 text-sm mt-1">Start tracking your business expenses</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map(exp => (
                  <div key={exp.id} onClick={() => setSelected(exp)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{exp.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', TYPE_CLS[exp.expense_type] ?? TYPE_CLS.opex)}>
                          {exp.expense_type}
                        </span>
                        <span className="text-xs text-gray-500">{exp.category}</span>
                        <span className="text-xs text-gray-600">{fmtDate(exp.expense_date)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-white">{fmt(exp.amount)}</p>
                      {exp.is_tax_deductible && (
                        <p className="text-[10px] text-emerald-400 mt-0.5">Tax deductible</p>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteMut.mutate(exp.id) }}
                      disabled={deleteMut.isPending}
                      className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasNextPage && (
            <div className="text-center">
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10">
                <ChevronDown className="w-4 h-4" />{isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}

        </main>
      </div>

      <CreateExpenseModal open={showCreate} onOpenChange={setShowCreate}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['expenses'] })} />
      {selected && (
        <EditExpenseDrawer expense={selected} onClose={() => setSelected(null)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['expenses'] }); setSelected(null) }} />
      )}
    </div>
  )
}
