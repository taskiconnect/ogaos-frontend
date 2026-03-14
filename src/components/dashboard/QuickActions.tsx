'use client'

import Link from 'next/link'
import {
  ShoppingCart, Receipt, TrendingDown, Users,
  Package, Landmark, ArrowRight, Briefcase, ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onAddCustomer?: () => void
}

const LINK_ACTIONS = [
  { label: 'Record Sale',    description: 'Log a new cash or credit sale',      href: '/dashboard/sales',       icon: ShoppingCart, border: 'border-blue-500/20',   gradient: 'from-blue-600/10 to-blue-500/5',    iconColor: '#3f9af5' },
  { label: 'Create Invoice', description: 'Generate a VAT-compliant invoice',    href: '/dashboard/invoices',    icon: Receipt,      border: 'border-emerald-500/20', gradient: 'from-emerald-600/10 to-emerald-500/5', iconColor: '#10b981' },
  { label: 'Log Expense',    description: 'Track opex or capex spending',        href: '/dashboard/expenses',    icon: TrendingDown, border: 'border-amber-500/20',   gradient: 'from-amber-600/10 to-amber-500/5',  iconColor: '#f59e0b' },
  { label: 'Add Product',    description: 'List a new product or service',       href: '/dashboard/products',    icon: Package,      border: 'border-pink-500/20',    gradient: 'from-pink-600/10 to-pink-500/5',    iconColor: '#ec4899' },
  { label: 'Record Debt',    description: 'Track who owes what',                 href: '/dashboard/debts',       icon: Landmark,     border: 'border-orange-500/20',  gradient: 'from-orange-600/10 to-orange-500/5', iconColor: '#f97316' },
  { label: 'Digital Store',  description: 'Sell e-books, templates & more',      href: '/dashboard/digital',     icon: ShoppingBag,  border: 'border-cyan-500/20',    gradient: 'from-cyan-600/10 to-cyan-500/5',    iconColor: '#06b6d4' },
  { label: 'Post a Job',     description: 'Find the right talent fast',          href: '/dashboard/recruitment', icon: Briefcase,    border: 'border-indigo-500/20',  gradient: 'from-indigo-600/10 to-indigo-500/5', iconColor: '#6366f1' },
]

export default function QuickActions({ onAddCustomer }: Props) {
  return (
    <div className="rounded-2xl border border-dash-border bg-dash-surface p-6 h-full">
      <h3 className="font-semibold text-foreground text-sm mb-5">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">

        {/* Add Customer — opens modal */}
        <button
          onClick={onAddCustomer}
          className={cn(
            'group relative flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br hover:scale-[1.02] transition-all duration-200 text-left',
            'border-purple-500/20 from-purple-600/10 to-purple-500/5'
          )}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#8b5cf615', border: '1px solid #8b5cf630' }}>
            <Users className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">Add Customer</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight hidden xl:block">
              Add a customer to your CRM
            </p>
          </div>
          <ArrowRight className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Rest are nav links */}
        {LINK_ACTIONS.map(action => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'group relative flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br hover:scale-[1.02] transition-all duration-200',
              action.border,
              action.gradient
            )}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${action.iconColor}15`, border: `1px solid ${action.iconColor}30` }}>
              <action.icon className="w-4 h-4" style={{ color: action.iconColor }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{action.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight hidden xl:block">{action.description}</p>
            </div>
            <ArrowRight className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  )
}
