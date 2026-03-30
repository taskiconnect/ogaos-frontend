'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  TicketPercent, Plus, Search, Tag, Calendar,
  Trash2, Pencil, CheckCircle2, XCircle, ChevronDown,
  Flame, BarChart2, Gift,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import api from '@/lib/api/adminClient'
import CouponFormModal from '@/components/admin/coupons/CouponFormModal'
import DeleteCouponModal from '@/components/admin/coupons/DeleteCouponModal'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string
  code: string
  description: string
  discount_value: number
  applicable_plans: string[]
  starts_at: string
  expires_at: string
  max_redemptions: number
  redemptions: number
  remaining: number
  is_active: boolean
  created_at: string
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchCoupons(): Promise<Coupon[]> {
  const res = await api.get<{ success: boolean; data: Coupon[] }>('/api/admin/coupons')
  return res.data.data
}

async function deleteCoupon(id: string): Promise<void> {
  await api.delete(`/api/admin/coupons/${id}`)
}

async function toggleCoupon(id: string, is_active: boolean): Promise<void> {
  await api.patch(`/api/admin/coupons/${id}`, { is_active })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function isExpired(iso: string) {
  return new Date(iso) < new Date()
}

function couponStatus(c: Coupon): 'active' | 'inactive' | 'expired' | 'exhausted' {
  if (!c.is_active) return 'inactive'
  if (isExpired(c.expires_at)) return 'expired'
  if (c.max_redemptions > 0 && c.remaining <= 0) return 'exhausted'
  return 'active'
}

const STATUS_CLS: Record<string, string> = {
  active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive:  'bg-gray-500/10 text-gray-400 border-gray-500/20',
  expired:   'bg-red-500/10 text-red-400 border-red-500/20',
  exhausted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub,
  icon: Icon, iconColor, iconBg, valueColor,
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; iconColor: string; iconBg: string; valueColor?: string
}) {
  return (
    <div className="relative bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5 overflow-hidden">
      <div className={cn('absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center', iconBg)}>
        <Icon className={cn('w-3.5 h-3.5', iconColor)} />
      </div>
      <div className="pr-10">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <p className={cn('text-2xl font-bold leading-tight truncate', valueColor ?? 'text-white')}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Coupon Row ───────────────────────────────────────────────────────────────

function CouponRow({
  coupon,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
}: {
  coupon: Coupon
  onEdit: (c: Coupon) => void
  onDelete: (c: Coupon) => void
  onToggle: (c: Coupon) => void
  isToggling: boolean
}) {
  const status = couponStatus(coupon)
  const usagePercent = coupon.max_redemptions > 0
    ? Math.min(100, Math.round((coupon.redemptions / coupon.max_redemptions) * 100))
    : 0

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0',
        status === 'active'
          ? 'bg-primary/10 border-primary/20'
          : 'bg-white/5 border-white/10'
      )}>
        <TicketPercent className={cn(
          'w-4 h-4',
          status === 'active' ? 'text-primary' : 'text-gray-500'
        )} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'font-mono text-sm font-bold tracking-wider',
            status === 'active' ? 'text-white' : 'text-gray-500'
          )}>
            {coupon.code}
          </span>
          <span className={cn(
            'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
            STATUS_CLS[status]
          )}>
            {status}
          </span>
          <span className="text-xs text-emerald-400 font-semibold">
            {coupon.discount_value}% off
          </span>
        </div>

        {coupon.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{coupon.description}</p>
        )}

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Plans */}
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-gray-600" />
            <span className="text-[11px] text-gray-500">
              {coupon.applicable_plans.join(', ')}
            </span>
          </div>
          {/* Date range */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-600" />
            <span className="text-[11px] text-gray-500">
              {fmtDate(coupon.starts_at)} – {fmtDate(coupon.expires_at)}
            </span>
          </div>
        </div>

        {/* Usage bar */}
        {coupon.max_redemptions > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  usagePercent >= 90 ? 'bg-red-500' :
                  usagePercent >= 60 ? 'bg-yellow-500' : 'bg-primary'
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">
              {coupon.redemptions}/{coupon.max_redemptions} used
            </span>
          </div>
        )}

        {coupon.max_redemptions === 0 && (
          <p className="text-[10px] text-gray-600 mt-1">{coupon.redemptions} redemptions · unlimited</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {/* Toggle active */}
        <button
          onClick={() => onToggle(coupon)}
          disabled={isToggling}
          title={coupon.is_active ? 'Deactivate' : 'Activate'}
          className={cn(
            'w-8 h-8 rounded-lg border flex items-center justify-center transition-colors',
            coupon.is_active
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
          )}
        >
          {coupon.is_active
            ? <XCircle className="w-3.5 h-3.5" />
            : <CheckCircle2 className="w-3.5 h-3.5" />
          }
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(coupon)}
          title="Edit coupon"
          className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(coupon)}
          title="Delete coupon"
          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const { user } = useAdminAuthStore()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Coupon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: fetchCoupons,
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      toast.success('Coupon deleted.')
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete coupon.'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      toggleCoupon(id, is_active),
    onSuccess: (_data, vars) => {
      toast.success(`Coupon ${vars.is_active ? 'activated' : 'deactivated'}.`)
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
    onError: () => toast.error('Failed to update coupon.'),
    onSettled: () => setTogglingId(null),
  })

  const handleToggle = (c: Coupon) => {
    setTogglingId(c.id)
    toggleMut.mutate({ id: c.id, is_active: !c.is_active })
  }

  const filtered = useMemo(() => {
    let list = coupons
    if (statusFilter) list = list.filter(c => couponStatus(c) === statusFilter)
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(c =>
      c.code.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q)
    )
  }, [coupons, search, statusFilter])

  // Summary stats
  const totalActive    = coupons.filter(c => couponStatus(c) === 'active').length
  const totalUsed      = coupons.reduce((s, c) => s + c.redemptions, 0)
  const totalCoupons   = coupons.length

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-white">
      <AdminSidebar admin={user} />

      <div className="lg:pl-72">
        <AdminDashboardHeader admin={user} />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 pb-20">

          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Coupons</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Manage discount codes and track redemptions
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              <Plus className="w-4 h-4" />
              New Coupon
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              label="Total Coupons"
              value={String(totalCoupons)}
              sub="all time"
              icon={Gift}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Active"
              value={String(totalActive)}
              sub="currently live"
              icon={Flame}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-400"
              valueColor="text-emerald-400"
            />
            <StatCard
              label="Total Redemptions"
              value={String(totalUsed)}
              sub="across all coupons"
              icon={BarChart2}
              iconBg="bg-yellow-500/10"
              iconColor="text-yellow-400"
              valueColor="text-yellow-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search code or description…"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['', 'active', 'inactive', 'expired', 'exhausted'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-semibold border uppercase transition-all',
                    statusFilter === s
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  )}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Coupons list */}
          <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 text-sm">Loading coupons…</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 flex flex-col items-center text-center">
                <TicketPercent className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No coupons found</p>
                <p className="text-gray-600 text-sm mt-1">
                  {search || statusFilter ? 'Try adjusting your filters' : 'Create your first coupon to get started'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map(coupon => (
                  <CouponRow
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onToggle={handleToggle}
                    isToggling={togglingId === coupon.id}
                  />
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Create modal */}
      <CouponFormModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['admin-coupons'] })
          setShowCreate(false)
        }}
      />

      {/* Edit modal */}
      {editTarget && (
        <CouponFormModal
          open={!!editTarget}
          onOpenChange={(v) => { if (!v) setEditTarget(null) }}
          coupon={editTarget}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-coupons'] })
            setEditTarget(null)
          }}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteCouponModal
          coupon={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          isPending={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        />
      )}
    </div>
  )
}