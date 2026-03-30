'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Building2,
  TicketPercent,
  ChartColumn,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  UserCog,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { toast } from 'sonner'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { label: 'Admins',     href: '/admin/dashboard/admins',     icon: ShieldCheck   },
      { label: 'Users',      href: '/admin/dashboard/users',      icon: Users         },
      { label: 'Businesses', href: '/admin/dashboard/businesses', icon: Building2     },
      { label: 'Coupons',    href: '/admin/dashboard/coupons',    icon: TicketPercent },
    ],
  },
  {
    label: 'Insights',
    items: [{ label: 'Analytics', href: '/admin/dashboard/analytics', icon: ChartColumn }],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', href: '/admin/dashboard/settings', icon: Settings }],
  },
]

interface AdminProfile {
  first_name?: string
  last_name?: string
  email?: string
  role?: string
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  collapsed: boolean
  active: boolean
}

function NavItem({ href, icon: Icon, label, collapsed, active }: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
        active
          ? 'bg-primary/15 text-primary border border-primary/25'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}
      <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary' : '')} />

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-white/10 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl text-white">
          {label}
        </span>
      )}
    </Link>
  )
}

function SidebarInner({
  collapsed,
  onCollapse,
  admin,
}: {
  collapsed: boolean
  onCollapse?: () => void
  admin?: AdminProfile | null
}) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === '/admin/dashboard'
      ? pathname === '/admin/dashboard'
      : pathname.startsWith(href)

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    toast.success('Logged out')
    router.push('/admin/auth/login')
  }

  const displayName = admin
    ? `${admin.first_name ?? ''} ${admin.last_name ?? ''}`.trim() || admin.email || 'Admin'
    : 'Admin User'

  const profileActive = pathname.startsWith('/admin/dashboard/profile')

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Logo / brand ── */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-white/8 shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">OgaOS Admin</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-none">Control Panel</p>
            </div>
          </Link>
        )}

        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <UserCog className="w-4 h-4 text-primary" />
          </div>
        )}

        {onCollapse && (
          <button
            onClick={onCollapse}
            className="hidden md:flex w-6 h-6 items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-all"
          >
            {collapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft  className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.12em]"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom — avatar + logout ── */}
      <div className="shrink-0 border-t border-white/8 p-2 space-y-1">

        {/* Avatar — links to profile page */}
        <Link
          href="/admin/dashboard/profile"
          title={collapsed ? 'My Profile' : undefined}
          className={cn(
            'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
            profileActive
              ? 'bg-primary/15 border border-primary/25'
              : 'hover:bg-white/5'
          )}
        >
          {profileActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
          )}

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {getInitials(displayName)}
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap min-w-0 flex-1"
              >
                <p className={cn(
                  'text-sm font-medium truncate',
                  profileActive ? 'text-primary' : 'text-white'
                )}>
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {admin?.role?.replace('_', ' ') ?? 'admin'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip when collapsed */}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-white/10 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl text-white">
              My Profile
            </span>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/8 transition-all',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Log out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}

export default function AdminSidebar({ admin }: { admin?: AdminProfile | null }) {
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 288 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-20 bg-[#0a0a0f] border-r border-white/8 overflow-hidden"
      >
        <SidebarInner
          collapsed={collapsed}
          onCollapse={() => setCollapsed((c) => !c)}
          admin={admin}
        />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 bg-[#0a0a0f] border-r border-white/8"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarInner collapsed={false} admin={admin} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}