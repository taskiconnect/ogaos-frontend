'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShieldCheck,
  UserPlus,
  Crown,
  Headphones,
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Pencil,
  UserX,
  RefreshCw,
  Search,
  Clock,
  Mail,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader'
import InviteAdminModal from '@/components/admin/admins/InviteAdminModal'
import EditAdminModal from '@/components/admin/admins/EditAdminModal'
import DeactivateAdminModal from '@/components/admin/admins/DeactivateAdminModal'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useAdminDashboard } from '@/lib/hooks/useAdminDashboard'
import { listAdmins, deactivateAdmin } from '@/lib/api/admin'
import type { AdminProfile, AdminRole } from '@/types/admin'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string | null) {
  if (!iso) return 'Never'

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// ─── Role meta ────────────────────────────────────────────────────────────────

const ROLE_META: Record<
  AdminRole,
  {
    label: string
    icon: React.ElementType
    bg: string
    border: string
    text: string
  }
> = {
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    text: 'text-primary',
  },
  support: {
    label: 'Support',
    icon: Headphones,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
  },
  finance: {
    label: 'Finance',
    icon: BadgeDollarSign,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
  },
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: AdminRole }) {
  const meta = ROLE_META[role]
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border',
        meta.bg,
        meta.border,
        meta.text
      )}
    >
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border',
        active
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      )}
    >
      {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Row action menu ──────────────────────────────────────────────────────────

function RowActions({
  admin,
  currentUserId,
  onEdit,
  onDeactivate,
}: {
  admin: AdminProfile
  currentUserId: string
  onEdit: (a: AdminProfile) => void
  onDeactivate: (a: AdminProfile) => void
}) {
  const [open, setOpen] = useState(false)
  const isSelf = admin.id === currentUserId

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-all"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-44 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
            <button
              onClick={() => {
                setOpen(false)
                onEdit(admin)
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Role
            </button>

            {!isSelf && admin.is_active && (
              <button
                onClick={() => {
                  setOpen(false)
                  onDeactivate(admin)
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
              >
                <UserX className="w-3.5 h-3.5" />
                Deactivate
              </button>
            )}

            {isSelf && (
              <p className="px-3 py-2 text-xs text-gray-600 italic">Can&apos;t edit yourself</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 rounded-lg bg-white/5 animate-pulse"
            style={{ width: `${60 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-white">No admins yet</p>
            <p className="text-xs text-gray-500 mt-1">Invite your first admin to get started</p>
          </div>

          <button
            onClick={onInvite}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            <UserPlus className="w-4 h-4" />
            Invite Admin
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const { user } = useAdminAuthStore()
  const { isLoading: dashLoading } = useAdminDashboard()

  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminProfile | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<AdminProfile | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-list'],
    queryFn: async () => {
      const res = await listAdmins()
      return res.data ?? []
    },
    staleTime: 1000 * 60 * 2,
  })

  const deactivateMutation = useMutation({
    mutationFn: async (adminId: string) => {
      return await deactivateAdmin(adminId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] })
      setDeactivateTarget(null)
    },
  })

  const admins = (data ?? []).filter((a) => {
    const q = search.toLowerCase()

    return (
      a.first_name.toLowerCase().includes(q) ||
      a.last_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q)
    )
  })

  const isSuperAdmin = user?.role === 'super_admin'

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-list'] })
    setInviteOpen(false)
    setEditTarget(null)
    setDeactivateTarget(null)
  }

  if (!user || dashLoading) return null

  return (
    <div className="min-h-screen bg-background text-white">
      <AdminSidebar admin={user} />

      <div className="lg:pl-72">
        <AdminDashboardHeader admin={user} />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 pb-20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admins</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Manage platform admin accounts and roles
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
                Refresh
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => setInviteOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Admin
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: data?.length ?? 0, color: 'text-white' },
              {
                label: 'Active',
                value: data?.filter((a) => a.is_active).length ?? 0,
                color: 'text-emerald-400',
              },
              {
                label: 'Inactive',
                value: data?.filter((a) => !a.is_active).length ?? 0,
                color: 'text-red-400',
              },
              {
                label: 'Super',
                value: data?.filter((a) => a.role === 'super_admin').length ?? 0,
                color: 'text-primary',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/8 bg-white/2 px-4 py-3"
              >
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or role…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Admin', 'Email', 'Role', 'Status', 'Last Login', ''].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                  ) : admins.length === 0 ? (
                    <EmptyState onInvite={() => setInviteOpen(true)} />
                  ) : (
                    admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{
                                background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)',
                              }}
                            >
                              {getInitials(`${admin.first_name} ${admin.last_name}`)}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-white">
                                {admin.first_name} {admin.last_name}
                                {admin.id === user.id && (
                                  <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500">
                                    you
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">{admin.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            {admin.email}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <RoleBadge role={admin.role} />
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge active={admin.is_active} />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            {fmtDateTime(admin.last_login_at)}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right">
                          {isSuperAdmin && (
                            <RowActions
                              admin={admin}
                              currentUserId={user.id}
                              onEdit={setEditTarget}
                              onDeactivate={setDeactivateTarget}
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!isLoading && admins.length > 0 && (
              <div className="px-4 py-3 border-t border-white/8">
                <p className="text-xs text-gray-500">
                  Showing {admins.length} of {data?.length ?? 0} admins
                  {search && ` matching "${search}"`}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <InviteAdminModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={onSuccess}
      />

      {editTarget && (
        <EditAdminModal
          open={!!editTarget}
          onOpenChange={(v: boolean) => {
            if (!v) setEditTarget(null)
          }}
          admin={editTarget}
          onSuccess={onSuccess}
        />
      )}

      {deactivateTarget && (
        <DeactivateAdminModal
          admin={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => deactivateMutation.mutate(deactivateTarget.id)}
          isPending={deactivateMutation.isPending}
        />
      )}
    </div>
  )
}