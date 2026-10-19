'use client'
import { getInitials } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const LABELS: Record<string, string> = {
  sales: 'Sales',
  invoices: 'Invoices',
  expenses: 'Expenses',
  debts: 'Debts',
  products: 'Products',
  digital: 'Digital store',
  stores: 'Stores',
  customers: 'Customers',
  staff: 'Staff',
  recruitment: 'Recruitment',
  settings: 'Settings',
  subscription: 'Subscription',
}
export default function DashboardHeader() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Account'
  const title = LABELS[pathname.split('/')[2]] || 'Overview'
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 pl-16 pr-5 backdrop-blur-xl lg:px-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-sm">
        <Link href="/dashboard" className="hidden text-muted-foreground sm:inline">
          Workspace
        </Link>
        <span className="hidden text-muted-foreground sm:inline">/</span>
        <span className="font-medium">{title}</span>
      </nav>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/subscription"
          className="hidden items-center gap-1.5 text-xs font-medium text-blue-400 sm:flex"
        >
          Manage plan
          <ArrowUpRight className="size-3.5" />
        </Link>
        <Link
          href={user?.role === 'owner' ? '/dashboard/settings' : '/dashboard/sales'}
          aria-label={`Account: ${name}`}
          className="flex items-center gap-2.5"
        >
          <span className="hidden text-right sm:block">
            <span className="block text-xs font-medium">{name}</span>
            <span className="block text-[10px] capitalize text-muted-foreground">{user?.role}</span>
          </span>
          <span className="grid size-9 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/15 text-xs font-bold text-blue-300">
            {getInitials(name)}
          </span>
        </Link>
      </div>
    </header>
  )
}
