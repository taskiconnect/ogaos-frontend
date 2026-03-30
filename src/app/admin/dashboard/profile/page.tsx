'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import {
  UserCog, ShieldCheck, Mail, Clock, Calendar,
  Crown, Headphones, BadgeDollarSign, KeyRound,
  CheckCircle2, XCircle, Activity, RefreshCw,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useAdminDashboard } from '@/lib/hooks/useAdminDashboard'
import type { AdminRole } from '@/types/admin'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string | null) {
  if (!iso) return 'Never'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
    year:    'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
  }).format(new Date(iso))
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso))
}

const ROLE_META: Record<AdminRole, {
  label: string; icon: React.ElementType
  bg: string; border: string; text: string; desc: string
}> = {
  super_admin: {
    label:  'Super Admin',
    icon:   Crown,
    bg:     'bg-primary/10',
    border: 'border-primary/20',
    text:   'text-primary',
    desc:   'Full access — manage admins, coupons, settings, and all platform data.',
  },
  support: {
    label:  'Support',
    icon:   Headphones,
    bg:     'bg-blue-500/10',
    border: 'border-blue-500/20',
    text:   'text-blue-400',
    desc:   'Can view users, businesses, analytics and coupons. Cannot modify admin accounts.',
  },
  finance: {
    label:  'Finance',
    icon:   BadgeDollarSign,
    bg:     'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text:   'text-emerald-400',
    desc:   'Read-only access to analytics and revenue reports.',
  },
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 text-gray-600 shrink-0" />
        <span className="text-sm text-gray-400 truncate">{label}</span>
      </div>
      <span className={cn('text-sm font-medium text-right', valueClass ?? 'text-white')}>
        {value}
      </span>
    </div>
  )
}

// ─── Permission Badge ─────────────────────────────────────────────────────────

function PermBadge({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium',
      allowed
        ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400'
        : 'bg-white/3 border-white/10 text-gray-600'
    )}>
      {allowed
        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        : <XCircle className="w-3.5 h-3.5 shrink-0" />
      }
      {label}
    </div>
  )
}

// ─── Permissions map per role ─────────────────────────────────────────────────

const PERMISSIONS: Record<AdminRole, Record<string, boolean>> = {
  super_admin: {
    'Invite admins':      true,
    'Edit admin roles':   true,
    'Deactivate admins':  true,
    'Manage coupons':     true,
    'View users':         true,
    'View businesses':    true,
    'Analytics overview': true,
    'Revenue reports':    true,
    'Platform settings':  true,
  },
  support: {
    'Invite admins':      false,
    'Edit admin roles':   false,
    'Deactivate admins':  false,
    'Manage coupons':     true,
    'View users':         true,
    'View businesses':    true,
    'Analytics overview': true,
    'Revenue reports':    false,
    'Platform settings':  false,
  },
  finance: {
    'Invite admins':      false,
    'Edit admin roles':   false,
    'Deactivate admins':  false,
    'Manage coupons':     false,
    'View users':         false,
    'View businesses':    false,
    'Analytics overview': true,
    'Revenue reports':    true,
    'Platform settings':  false,
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilePage() {
  const { user } = useAdminAuthStore()
  const { isLoading, refetchAdmin } = useAdminDashboard()

  if (!user) return null

  const role   = ROLE_META[user.role]
  const RoleIcon = role.icon
  const displayName = `${user.first_name} ${user.last_name}`.trim()
  const perms  = PERMISSIONS[user.role]

  return (
    <div className="min-h-screen bg-background text-white">
      <AdminSidebar admin={user} />

      <div className="lg:pl-72">
        <AdminDashboardHeader admin={user} />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 pb-20">

          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Your admin account details and permissions
              </p>
            </div>
            <button
              onClick={() => refetchAdmin()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              Refresh
            </button>
          </div>

          {/* Profile hero */}
          <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            {/* Gradient band */}
            <div
              className="h-24 sm:h-28 w-full"
              style={{ background: 'linear-gradient(135deg, #001a6e 0%, #0a2a8a 50%, #1a4fc4 100%)' }}
            />

            <div className="px-6 pb-6 -mt-10 sm:-mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-background flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
              >
                {getInitials(displayName)}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{displayName}</h2>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border',
                    role.bg, role.border, role.text
                  )}>
                    <RoleIcon className="w-3 h-3" />
                    {role.label}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
              </div>

              {/* Status pill */}
              <div className={cn(
                'self-start sm:self-auto px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5',
                user.is_active
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              )}>
                {user.is_active
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <XCircle className="w-3.5 h-3.5" />
                }
                {user.is_active ? 'Account active' : 'Account inactive'}
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">

            {/* Left — account details */}
            <div className="lg:col-span-4 space-y-5">

              {/* Identity */}
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <UserCog className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Account Details</h3>
                </div>

                <div className="space-y-0">
                  <DetailRow icon={ShieldCheck}  label="Admin ID"     value={<span className="font-mono text-xs text-gray-400">{user.id}</span>} />
                  <DetailRow icon={Mail}          label="Email"        value={user.email} />
                  <DetailRow icon={UserCog}       label="First Name"   value={user.first_name} />
                  <DetailRow icon={UserCog}       label="Last Name"    value={user.last_name} />
                  <DetailRow
                    icon={RoleIcon}
                    label="Role"
                    value={role.label}
                    valueClass={role.text}
                  />
                  <DetailRow
                    icon={KeyRound}
                    label="Password"
                    value={user.password_set ? 'Set' : 'Pending setup'}
                    valueClass={user.password_set ? 'text-emerald-400' : 'text-yellow-400'}
                  />
                  <DetailRow
                    icon={CheckCircle2}
                    label="Account Status"
                    value={user.is_active ? 'Active' : 'Inactive'}
                    valueClass={user.is_active ? 'text-emerald-400' : 'text-red-400'}
                  />
                </div>
              </div>

              {/* Session */}
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Session & Activity</h3>
                </div>
                <div className="space-y-0">
                  <DetailRow
                    icon={Clock}
                    label="Last Login"
                    value={fmtDateTime(user.last_login_at)}
                    valueClass="text-gray-300"
                  />
                  <DetailRow
                    icon={Calendar}
                    label="Account Created"
                    value={fmtDate(user.created_at)}
                    valueClass="text-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Right — role card + permissions */}
            <div className="lg:col-span-3 space-y-5">

              {/* Role card */}
              <div className={cn(
                'rounded-2xl border p-5',
                role.bg, role.border
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center border',
                    'bg-white/10', role.border
                  )}>
                    <RoleIcon className={cn('w-5 h-5', role.text)} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Your Role
                    </p>
                    <p className={cn('text-base font-bold', role.text)}>{role.label}</p>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{role.desc}</p>
              </div>

              {/* Permissions */}
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Permissions</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(perms).map(([label, allowed]) => (
                    <PermBadge key={label} label={label} allowed={allowed} />
                  ))}
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  )
}