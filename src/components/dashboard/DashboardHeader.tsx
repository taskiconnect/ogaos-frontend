'use client'

import { useEffect, useState } from 'react'
import { useTheme }     from 'next-themes'
import { Sun, Moon, Bell, Search } from 'lucide-react'
import { usePathname }  from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { getInitials }  from '@/lib/utils'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':             'Dashboard',
  '/dashboard/sales':       'Sales',
  '/dashboard/invoices':    'Invoices',
  '/dashboard/expenses':    'Expenses',
  '/dashboard/debts':       'Debts',
  '/dashboard/products':    'Products',
  '/dashboard/digital':     'Digital Store',
  '/dashboard/stores':      'Stores',
  '/dashboard/customers':   'Customers',
  '/dashboard/recruitment': 'Recruitment',
  '/dashboard/settings':    'Settings',
}

export default function DashboardHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const pathname = usePathname()
  const { user } = useAuthStore()

  const pageTitle   = ROUTE_LABELS[pathname] ?? 'Dashboard'

  // All from authStore — already populated by LoginForm → getMe() → setUser()
  const fullName    = user ? `${user.first_name} ${user.last_name}`.trim() : ''
  const businessName = user?.business?.name ?? ''
  const isDark      = resolvedTheme === 'dark'

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center gap-4 px-6 lg:px-10 border-b border-dash-border bg-dash-subtle/80 backdrop-blur-md">

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">{pageTitle}</h1>
        {businessName && (
          <p className="text-[11px] text-muted-foreground truncate hidden sm:block">{businessName}</p>
        )}
      </div>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-dash-subtle border border-dash-border text-muted-foreground text-sm w-52 cursor-text hover:border-border transition-colors">
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs">Search…</span>
        <span className="ml-auto text-[10px] border border-dash-border rounded px-1.5 py-0.5">⌘K</span>
      </div>

      {/* Notifications */}
      <button
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-dash-subtle" />
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        disabled={!mounted}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all disabled:opacity-0"
        aria-label="Toggle theme"
      >
        {mounted && (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
      </button>

      {/* Avatar — initials from real name, tooltip shows full name + role */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white cursor-pointer ring-2 ring-primary/30 hover:ring-primary/60 transition-all shrink-0"
        style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
        title={fullName ? `${fullName}${user?.role ? ` · ${user.role}` : ''}` : 'Profile'}
      >
        {fullName ? getInitials(fullName) : '?'}
      </div>
    </header>
  )
}
