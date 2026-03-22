'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listCustomers, deleteCustomer } from '@/lib/api/business'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Plus, Search, Users, Trash2, ChevronDown, Phone, Mail, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/api/types'
import CustomerModal from '@/components/customers/CustomerModal'
import CustomerDrawer from '@/components/customers/CustomerDrawer'

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}
function initials(c: Customer) {
  return `${c.first_name[0] ?? ''}${c.last_name[0] ?? ''}`.toUpperCase()
}
function fullName(c: Customer) {
  return `${c.first_name} ${c.last_name}`.trim()
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30',
]
function avatarColor(id: string) {
  const n = id.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[n]
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function CustomersPage() {
  const qc = useQueryClient()
  const [search, setSearch]         = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected]     = useState<Customer | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['customers', search],
    queryFn: ({ pageParam }) => listCustomers({
      limit: 30, cursor: pageParam as string | undefined,
      search: search || undefined,
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) => last.next_cursor ?? undefined,
  })

  const allCustomers: Customer[] = useMemo(
    () => (data?.pages ?? []).flatMap((p: any) => p.data ?? []), [data]
  )

  const totalRevenue  = allCustomers.reduce((s, c) => s + c.total_purchases, 0)
  const totalOrders   = allCustomers.reduce((s, c) => s + c.total_orders, 0)
  const withDebt      = allCustomers.filter(c => c.outstanding_debt > 0).length

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setDeleting(null) },
  })

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-20">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <p className="text-gray-400 mt-1 text-sm">Manage your customer relationships</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat label="Total Customers" value={String(allCustomers.length)} color="text-white" />
            <MiniStat label="Total Revenue"   value={fmt(totalRevenue)}           color="text-emerald-400" />
            <MiniStat label="Total Orders"    value={String(totalOrders)}         color="text-blue-400" />
            <MiniStat label="With Debt"       value={String(withDebt)}            color={withDebt > 0 ? 'text-red-400' : 'text-gray-500'} />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 text-sm">Loading customers...</div>
            ) : allCustomers.length === 0 ? (
              <div className="p-16 flex flex-col items-center text-center">
                <Users className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No customers yet</p>
                <p className="text-gray-600 text-sm mt-1">Add your first customer to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {allCustomers.map(customer => (
                  <div key={customer.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    {/* Avatar */}
                    <button onClick={() => setSelected(customer)}
                      className={cn('w-10 h-10 rounded-xl border font-bold text-sm flex items-center justify-center shrink-0', avatarColor(customer.id))}>
                      {initials(customer)}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelected(customer)}>
                      <p className="text-sm font-semibold text-white">{fullName(customer)}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {customer.phone_number && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />{customer.phone_number}
                          </span>
                        )}
                        {customer.email && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />{customer.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="text-sm font-semibold text-emerald-400">{fmt(customer.total_purchases)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Orders</p>
                        <p className="text-sm font-semibold text-white">{customer.total_orders}</p>
                      </div>
                      {customer.outstanding_debt > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Debt</p>
                          <p className="text-sm font-semibold text-red-400">{fmt(customer.outstanding_debt)}</p>
                        </div>
                      )}
                    </div>

                    {/* Since */}
                    <div className="hidden lg:block text-right shrink-0">
                      <p className="text-xs text-gray-500">Since</p>
                      <p className="text-xs text-gray-400">{fmtDate(customer.created_at)}</p>
                    </div>

                    {/* Delete */}
                    {deleting === customer.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => deleteMut.mutate(customer.id)}
                          className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-red-400 font-semibold hover:bg-red-500/30">
                          Confirm
                        </button>
                        <button onClick={() => setDeleting(null)}
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setDeleting(customer.id) }}
                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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

      <CustomerModal open={showCreate} onOpenChange={setShowCreate}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['customers'] })} />
      {selected && (
        <CustomerDrawer customer={selected} onClose={() => setSelected(null)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['customers'] }); setSelected(null) }} />
      )}
    </div>
  )
}
