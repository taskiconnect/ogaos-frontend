'use client'

export const dynamic = 'force-dynamic'

import {
  ShieldCheck,
  Users,
  Building2,
  TicketPercent,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader'
import { useAdminAuthStore } from '@/stores/adminAuthStore'

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </p>
        <div className={cn('w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border', color)}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{value}</p>
      {sub && <p className="text-[10px] sm:text-xs text-gray-500 truncate">{sub}</p>}
    </div>
  )
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-white/2 border border-white/8 rounded-xl p-3 sm:p-4 text-center">
      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-base sm:text-lg font-bold text-white truncate">{value}</p>
      {sub && <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5 truncate">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAdminAuthStore()

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-white">
      <AdminSidebar admin={user} />

      <div className="lg:pl-72">
        <AdminDashboardHeader admin={user} />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 pb-20">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {getTimeBasedGreeting()}, {user.first_name} 👋
            </h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">
              {user.role.replace('_', ' ')} · {user.email}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPICard
              title="YOUR ROLE"
              value={user.role.replace('_', ' ').toUpperCase()}
              sub={user.is_active ? 'account active' : 'account inactive'}
              icon={ShieldCheck}
              color="bg-primary/10 border-primary/20 text-primary"
            />
            <KPICard
              title="EMAIL"
              value={user.email}
              sub="authenticated admin account"
              icon={Users}
              color="bg-blue-500/10 border-blue-500/20 text-blue-400"
            />
            <KPICard
              title="PASSWORD"
              value={user.password_set ? 'SET' : 'PENDING'}
              sub="setup status"
              icon={Building2}
              color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            />
            <KPICard
              title="STATUS"
              value={user.is_active ? 'ACTIVE' : 'INACTIVE'}
              sub="admin account state"
              icon={TicketPercent}
              color="bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <MiniStat label="First Name" value={user.first_name} />
            <MiniStat label="Last Name" value={user.last_name} />
            <MiniStat label="Role" value={user.role} />
            <MiniStat
              label="Last Login"
              value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'No record'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
            <div className="lg:col-span-4 rounded-2xl border border-white/8 bg-white/2 p-5 min-h-80">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Admin Account
                  </p>
                  <h3 className="text-xl font-bold text-white mt-1">Authenticated profile</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 space-y-3">
                <p><span className="text-gray-400">ID:</span> {user.id}</p>
                <p><span className="text-gray-400">Name:</span> {user.first_name} {user.last_name}</p>
                <p><span className="text-gray-400">Email:</span> {user.email}</p>
                <p><span className="text-gray-400">Role:</span> {user.role}</p>
                <p><span className="text-gray-400">Active:</span> {String(user.is_active)}</p>
                <p><span className="text-gray-400">Password Set:</span> {String(user.password_set)}</p>
              </div>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-white/8 bg-white/2 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Session
                  </p>
                  <h3 className="text-xl font-bold text-white mt-1">Current admin info</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                  <p className="text-sm text-white">Signed in as {user.email}</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                  <p className="text-sm text-white">Role: {user.role}</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                  <p className="text-sm text-white">
                    Last login: {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'No record'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}