'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listDebts, recordDebtPayment, listSales } from '@/lib/api/finance'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Plus, Search, AlertTriangle, ChevronDown, TrendingDown, TrendingUp, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Debt, Sale } from '@/lib/api/types'
import CreateDebtModal from '@/components/debts/CreateDebtModal'
import DebtDrawer from '@/components/debts/DebtDrawer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}
function partyName(d: Debt) {
  if (d.customer) return `${d.customer.first_name} ${d.customer.last_name}`.trim()
  return d.supplier_name ?? 'Walk-in customer'
}
function daysLeft(due: string | null) {
  if (!due) return null
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000)
}

// Convert a partial sale into the Debt shape so we can render it in the same list
function saleToDebt(sale: Sale): Debt {
  return {
    id:             sale.id,
    business_id:    sale.business_id,
    direction:      'receivable',
    customer_id:    sale.customer_id,
    supplier_name:  null,
    supplier_phone: null,
    description:    `Balance from sale ${sale.sale_number}`,
    total_amount:   sale.total_amount,
    amount_paid:    sale.amount_paid,
    amount_due:     sale.balance_due,
    due_date:       null,
    status:         'outstanding',
    notes:          null,
    recorded_by:    sale.recorded_by,
    created_at:     sale.created_at,
    updated_at:     sale.updated_at,
    customer:       sale.customer,
  }
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  outstanding: { label: 'Outstanding', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  partial:     { label: 'Partial',     cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  overdue:     { label: 'Overdue',     cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  settled:     { label: 'Settled',     cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

const DIR_FILTERS    = ['', 'receivable', 'payable'] as const
const STATUS_FILTERS = ['', 'outstanding', 'partial', 'overdue', 'settled']

function MiniStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DebtsPage() {
  const qc = useQueryClient()
  const [search,     setSearch]     = useState('')
  const [dir,        setDir]        = useState<'' | 'receivable' | 'payable'>('')
  const [status,     setStatus]     = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selected,   setSelected]   = useState<Debt | null>(null)

  // ── Manual debt records from /debts ───────────────────────────────────────
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: debtsLoading } =
    useInfiniteQuery({
      queryKey: ['debts', dir, status],
      queryFn: ({ pageParam }) => listDebts({
        limit:     30,
        cursor:    pageParam as string | undefined,
        direction: dir || undefined,
        status:    status || undefined,
      }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last: any) => last.next_cursor ?? undefined,
    })

  const allDebts: Debt[] = useMemo(
    () => (data?.pages ?? []).flatMap((p: any) => p.data ?? []), [data]
  )

  // ── Partial sales with unpaid balance (walk-in customers mainly) ──────────
  // These won't have a debt record because auto-creation only happens when
  // a customer is linked to the sale. We fetch them and merge into receivables.
  const { data: partialSalesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales', 'partial-for-debts'],
    queryFn:  () => listSales({ status: 'partial', limit: 100 }),
    // Only needed when viewing receivables or all
    enabled: dir === '' || dir === 'receivable',
  })

  const partialSales: Sale[] = useMemo(
    () => (partialSalesData?.data ?? []).filter(s => (s.balance_due ?? 0) > 0),
    [partialSalesData]
  )

  // ── Merge: debt records + sale-derived debts (dedup by sale_number) ───────
  // A debt record's description is "Balance from sale <sale_number>".
  // If a matching debt record already exists, don't add the sale again.
  const mergedReceivables: Debt[] = useMemo(() => {
    const debtSaleNumbers = new Set(
      allDebts
        .filter(d => d.direction === 'receivable' && d.description.startsWith('Balance from sale '))
        .map(d => d.description.replace('Balance from sale ', '').trim())
    )
    const saleDerived = partialSales
      .filter(s => !debtSaleNumbers.has(s.sale_number))
      .map(saleToDebt)
    return saleDerived
  }, [allDebts, partialSales])

  // ── Combined list for rendering ───────────────────────────────────────────
  const combinedDebts: Debt[] = useMemo(() => {
    // When filtering by payable, only show debt records (no sale-derived)
    if (dir === 'payable') return allDebts
    // When filtering by receivable, show debt records + sale-derived
    if (dir === 'receivable') return [...allDebts, ...mergedReceivables]
    // All: debt records + sale-derived receivables merged
    return [...allDebts, ...mergedReceivables]
  }, [allDebts, mergedReceivables, dir])

  // Apply search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return combinedDebts
    const q = search.toLowerCase()
    return combinedDebts.filter(d =>
      partyName(d).toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    )
  }, [combinedDebts, search])

  // ── KPI stats (use combinedDebts for accuracy) ───────────────────────────
  const totalReceivable = combinedDebts
    .filter(d => d.direction === 'receivable' && d.status !== 'settled')
    .reduce((s, d) => s + d.amount_due, 0)
  const totalPayable = allDebts
    .filter(d => d.direction === 'payable' && d.status !== 'settled')
    .reduce((s, d) => s + d.amount_due, 0)
  const overdueCount = combinedDebts.filter(d => d.status === 'overdue').length

  const isLoading = debtsLoading || salesLoading

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-20">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Debts</h1>
              <p className="text-gray-400 mt-1 text-sm">Track money owed to you and money you owe</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <Plus className="w-4 h-4" /> Record Debt
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat label="Owed to You"  value={fmt(totalReceivable)} color="text-emerald-400" sub="receivable" />
            <MiniStat label="You Owe"      value={fmt(totalPayable)}    color="text-red-400"     sub="payable" />
            <MiniStat label="Net Position" value={fmt(totalReceivable - totalPayable)}
              color={totalReceivable >= totalPayable ? 'text-emerald-400' : 'text-red-400'} />
            <MiniStat label="Overdue"      value={String(overdueCount)}
              color={overdueCount > 0 ? 'text-red-400' : 'text-gray-500'} sub="need attention" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {DIR_FILTERS.map(d => (
                <button key={d} onClick={() => setDir(d)}
                  className={cn('px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition-all',
                    dir === d ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                  {d || 'All'}
                  {d === 'receivable' ? ' (owed to you)' : d === 'payable' ? ' (you owe)' : ''}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={cn('px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition-all',
                    status === s ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                  {s || 'All statuses'}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 text-sm">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 flex flex-col items-center text-center">
                <AlertTriangle className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No debts found</p>
                <p className="text-gray-600 text-sm mt-1">Record money owed to or by your business</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map(debt => {
                  const st   = STATUS_MAP[debt.status] ?? STATUS_MAP.outstanding
                  const days = daysLeft(debt.due_date)
                  // Sale-derived debts have an id matching a sale id — we can
                  // check by seeing if a debt record exists in allDebts for this id
                  const isSaleDerived = !allDebts.find(d => d.id === debt.id)
                  return (
                    <div key={`${debt.id}-${debt.direction}`}
                      onClick={() => setSelected(debt)}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors">

                      <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0',
                        debt.direction === 'receivable' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20')}>
                        {isSaleDerived
                          ? <ShoppingCart className="w-5 h-5 text-emerald-400" />
                          : debt.direction === 'receivable'
                            ? <TrendingUp className="w-5 h-5 text-emerald-400" />
                            : <TrendingDown className="w-5 h-5 text-red-400" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{partyName(debt)}</p>
                          {isSaleDerived && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20 shrink-0">
                              From sale
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{debt.description}</p>
                      </div>

                      <div className="hidden sm:block text-right shrink-0">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm text-gray-300">{fmt(debt.total_amount)}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">Due</p>
                        <p className="text-sm font-semibold text-white">{fmt(debt.amount_due)}</p>
                      </div>

                      <div className="hidden lg:block text-right shrink-0">
                        {debt.due_date ? (
                          <p className={cn('text-xs font-medium',
                            days !== null && days < 0 ? 'text-red-400'
                            : days !== null && days <= 7 ? 'text-yellow-400'
                            : 'text-gray-400')}>
                            {days !== null && days < 0
                              ? `${Math.abs(days)}d overdue`
                              : days !== null ? `Due in ${days}d`
                              : fmtDate(debt.due_date)}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-600">No due date</p>
                        )}
                      </div>

                      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0', st.cls)}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {hasNextPage && (
            <div className="text-center">
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10">
                <ChevronDown className="w-4 h-4" />
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}

        </main>
      </div>

      <CreateDebtModal open={showCreate} onOpenChange={setShowCreate}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['debts'] })} />
      {selected && (
        <DebtDrawer debt={selected} onClose={() => setSelected(null)}
          onPayment={() => {
            qc.invalidateQueries({ queryKey: ['debts'] })
            qc.invalidateQueries({ queryKey: ['sales', 'partial-for-debts'] })
            setSelected(null)
          }} />
      )}
    </div>
  )
}