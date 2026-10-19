'use client'

import { getInitials } from '@/lib/utils'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LABELS: Record<string, string> = {
  admins: 'Admins',
  businesses: 'Businesses',
  coupons: 'Coupons',
  profile: 'Profile',
}

export default function AdminDashboardHeader() {
  const pathname = usePathname()
  const admin = useAdminAuthStore((state) => state.user)
  const name = [admin?.first_name, admin?.last_name].filter(Boolean).join(' ') || 'Admin'
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 pl-16 pr-5 backdrop-blur-xl lg:px-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-sm">
        <Link href="/admin/dashboard" className="text-muted-foreground">
          Administration
        </Link>
        <span>/</span>
        <span className="font-medium">{LABELS[pathname.split('/')[3]] || 'Overview'}</span>
      </nav>
      <Link
        href="/admin/dashboard/profile"
        aria-label={`Admin account: ${name}`}
        className="flex items-center gap-3"
      >
        <span className="hidden text-right sm:block">
          <span className="block text-xs font-medium">{name}</span>
          <span className="block text-[10px] capitalize text-muted-foreground">
            {admin?.role.replaceAll('_', ' ')}
          </span>
        </span>
        <span className="grid size-9 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/15 text-xs font-bold text-blue-300">
          {getInitials(name)}
        </span>
      </Link>
    </header>
  )
}
