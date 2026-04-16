'use client'

export const dynamic = 'force-dynamic'

import { useMemo, useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listInvoices,
  sendInvoice,
  cancelInvoice,
  reviseInvoice,
} from '@/lib/api/finance'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Plus, Search, FileText, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invoice } from '@/lib/api/types'
import CreateInvoiceModal from '@/components/invoices/CreateInvoiceModal'
import InvoiceDetailDrawer from '@/components/invoices/InvoiceDetailDrawer'

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function custName(inv: Invoice) {
  if (inv.customer) return `${inv.customer.first_name} ${inv.customer.last_name}`.trim()
  return 'No customer'
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  sent: { label: 'Sent', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  partial: { label: 'Partial', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  paid: { label: 'Paid', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  overdue: { label: 'Overdue', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  superseded: { label: 'Superseded', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
}

const STATUS_FILTERS = ['', 'draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'superseded']

const DATE_OPTS = [
  { label: 'All time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
]

function dateRange(v: string) {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const fd = (x: Date) => `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`

  if (v === 'today') {
    const t = fd(d)
    return { date_from: t, date_to: t }
  }

  if (v === 'week') {
    const s = new Date(d)
    s.setDate(d.getDate() - d.getDay())
    return { date_from: fd(s), date_to: fd(d) }
  }

  if (v === 'month') {
    return {
      date_from: fd(new Date(d.getFullYear(), d.getMonth(), 1)),
      date_to: fd(d),
    }
  }

  return {}
}

function MiniStat({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function InvoicesPage() {
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateOpt, setDateOpt] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Invoice | null>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['invoices', status, dateOpt],
    queryFn: ({ pageParam }) =>
      listInvoices({
        limit: 30,
        cursor: pageParam as string | undefined,
        status: status || undefined,
        ...dateRange(dateOpt),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) => last.next_cursor ?? undefined,
  })

  const allInvoices: Invoice[] = useMemo(
    () => (data?.pages ?? []).flatMap((p: any) => p.data ?? []),
    [data]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return allInvoices
    const q = search.toLowerCase()
    return allInvoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        custName(inv).toLowerCase().includes(q)
    )
  }, [allInvoices, search])

  const totalValue = allInvoices.reduce((s, i) => s + i.total_amount, 0)
  const paidCount = allInvoices.filter((i) => i.status === 'paid').length
  const overdueCount = allInvoices.filter((i) => i.status === 'overdue').length
  const outstanding = allInvoices
    .filter((i) => ['sent', 'overdue', 'partial'].includes(i.status))
    .reduce((s, i) => s + i.balance_due, 0)

  const refreshInvoices = async () => {
    await qc.invalidateQueries({ queryKey: ['invoices'] })
  }

  const sendMut = useMutation({
    mutationFn: (id: string) => sendInvoice(id),
    onSuccess: refreshInvoices,
  })

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelInvoice(id),
    onSuccess: async () => {
      await refreshInvoices()
      setSelected(null)
    },
  })

  const reviseMut = useMutation({
    mutationFn: (id: string) => reviseInvoice(id),
    onSuccess: async (newInvoice) => {
      await refreshInvoices()
      setSelected(newInvoice)
    },
  })

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-6 lg:p-10 space-y-8 pb-20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
              <p className="text-gray-400 mt-1 text-sm">Create and track client invoices</p>
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat label="Total Value" value={fmt(totalValue)} color="text-white" />
            <MiniStat
              label="Outstanding"
              value={fmt(outstanding)}
              color="text-yellow-400"
              sub={`${allInvoices.filter((i) => ['sent', 'overdue', 'partial'].includes(i.status)).length} unpaid`}
            />
            <MiniStat
              label="Paid"
              value={String(paidCount)}
              color="text-emerald-400"
              sub="invoices settled"
            />
            <MiniStat
              label="Overdue"
              value={String(overdueCount)}
              color="text-red-400"
              sub="need attention"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice # or customer..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition-all',
                    status === s
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  )}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>

            <select
              value={dateOpt}
              onChange={(e) => setDateOpt(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none"
            >
              {DATE_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 text-sm">Loading invoices...</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 flex flex-col items-center text-center">
                <FileText className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No invoices found</p>
                <p className="text-gray-600 text-sm mt-1">Create your first invoice to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] text-gray-500 uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-semibold">Invoice #</th>
                      <th className="text-left px-5 py-3 font-semibold">Customer</th>
                      <th className="text-left px-5 py-3 font-semibold">Issued</th>
                      <th className="text-left px-5 py-3 font-semibold">Due</th>
                      <th className="text-right px-5 py-3 font-semibold">Amount</th>
                      <th className="text-right px-5 py-3 font-semibold">Balance</th>
                      <th className="text-left px-5 py-3 font-semibold">Status</th>
                      <th className="text-right px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((inv) => {
                      const st = STATUS_MAP[inv.status] ?? STATUS_MAP.draft

                      return (
                        <tr
                          key={inv.id}
                          onClick={() => setSelected(inv)}
                          className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-white">{inv.invoice_number}</p>
                              {typeof inv.revision_number === 'number' && (
                                <p className="text-xs text-gray-500">Rev {inv.revision_number}</p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-gray-300">{custName(inv)}</td>
                          <td className="px-5 py-4 text-gray-400">{fmtDate(inv.issue_date)}</td>
                          <td className="px-5 py-4 text-gray-400">{fmtDate(inv.due_date)}</td>
                          <td className="px-5 py-4 text-right font-semibold text-white">
                            {fmt(inv.total_amount)}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-yellow-400">
                            {fmt(inv.balance_due)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                'text-xs font-semibold px-2.5 py-1 rounded-full border',
                                st.cls
                              )}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td
                            className="px-5 py-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-2">
                              {inv.status === 'draft' && (
                                <button
                                  onClick={() => sendMut.mutate(inv.id)}
                                  disabled={sendMut.isPending}
                                  className="px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors"
                                >
                                  Send
                                </button>
                              )}

                              {['sent', 'paid', 'partial', 'overdue'].includes(inv.status) && (
                                <button
                                  onClick={() => reviseMut.mutate(inv.id)}
                                  disabled={reviseMut.isPending}
                                  className="px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 text-xs font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors"
                                >
                                  Revise
                                </button>
                              )}

                              {['draft', 'sent', 'overdue'].includes(inv.status) && (
                                <button
                                  onClick={() => cancelMut.mutate(inv.id)}
                                  disabled={cancelMut.isPending}
                                  className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {hasNextPage && (
            <div className="text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
              >
                <ChevronDown className="w-4 h-4" />
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </main>
      </div>

      <CreateInvoiceModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['invoices'] })}
      />

      {selected && (
        <InvoiceDetailDrawer
          invoice={selected}
          onClose={() => setSelected(null)}
          onSend={() => {
            sendMut.mutate(selected.id)
            setSelected(null)
          }}
          onCancel={() => cancelMut.mutate(selected.id)}
          onPayment={() => qc.invalidateQueries({ queryKey: ['invoices'] })}
          onRevise={() => reviseMut.mutate(selected.id)}
        />
      )}
    </div>
  )
}