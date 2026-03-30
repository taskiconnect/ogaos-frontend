'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getInitials } from '@/lib/utils'

const ROUTE_LABELS: Record<string, string> = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/dashboard/admins': 'Admins',
  '/admin/dashboard/businesses': 'Businesses',
  '/admin/dashboard/users': 'Users',
  '/admin/dashboard/coupons': 'Coupons',
  '/admin/dashboard/analytics': 'Analytics',
  '/admin/dashboard/settings': 'Settings',
}

interface AdminUser {
  first_name?: string
  last_name?: string
  email?: string
  role?: string
}

export default function AdminDashboardHeader({
  admin,
}: {
  admin?: AdminUser | null
}) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const pageTitle = ROUTE_LABELS[pathname] ?? 'Admin Dashboard'
  const displayName = admin
    ? `${admin.first_name ?? ''} ${admin.last_name ?? ''}`.trim() || admin.email || 'Admin'
    : 'Admin'

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center gap-4 pl-14 pr-6 lg:px-10 border-b border-white/8 bg-[#0c0c12]/80 backdrop-blur-md">
      <h1 className="text-base font-semibold text-white flex-1">{pageTitle}</h1>

      <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-white/5 border border-white/8 text-gray-400 text-sm w-52 cursor-text hover:border-white/15 transition-colors">
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs">Search…</span>
        <span className="ml-auto text-[10px] border border-white/15 rounded px-1.5 py-0.5">⌘K</span>
      </div>

      <button
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-[#0c0c12]" />
      </button>

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer ring-2 ring-primary/30 hover:ring-primary/60 transition-all shrink-0"
        style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
        title={displayName}
      >
        {getInitials(displayName)}
      </div>
    </header>
  )
}