'use client'

import Link from 'next/link'
import {
  ShoppingCart, Receipt, TrendingDown, Landmark,
  Package, ShoppingBag, Store, Users2, Briefcase,
  ArrowRight, Check,
} from 'lucide-react'

const MODULES = [
  { label: 'Sales',        description: 'Record sales, issue receipts, track payment methods and customer balances.',         href: '/dashboard/sales',       icon: ShoppingCart, color: '#3f9af5', features: ['POS-style recording', 'VAT & WHT support', 'Receipt generation']    },
  { label: 'Invoices',     description: 'Create, send and track professional invoices with full tax compliance.',             href: '/dashboard/invoices',    icon: Receipt,      color: '#10b981', features: ['PDF-ready invoices', 'Send via email', 'Overdue reminders']          },
  { label: 'Expenses',     description: 'Log OPEX and CAPEX with depreciation tracking for tax-ready reporting.',            href: '/dashboard/expenses',    icon: TrendingDown, color: '#f59e0b', features: ['Opex vs Capex split', 'Monthly summary', 'Tax deductible flag']       },
  { label: 'Debts',        description: 'Track receivables and payables. Record partial payments with full history.',        href: '/dashboard/debts',       icon: Landmark,     color: '#f97316', features: ['Receivable & payable', 'Partial payments', 'Overdue alerts']          },
  { label: 'Products',     description: 'Manage your catalogue with real-time inventory tracking and low-stock alerts.',     href: '/dashboard/products',    icon: Package,      color: '#ec4899', features: ['Inventory tracking', 'Low-stock alerts', 'Stock adjustments']         },
  { label: 'Digital Store',description: 'Sell e-books, templates and digital files. Payments via Paystack/Flutterwave.',   href: '/dashboard/digital',     icon: ShoppingBag,  color: '#06b6d4', features: ['File delivery', 'Platform payout', 'Sales analytics']                 },
  { label: 'Stores',       description: 'Manage multiple physical store locations and assign inventory per branch.',        href: '/dashboard/stores',      icon: Store,        color: '#8b5cf6', features: ['Multi-branch support', 'Default store', 'Per-store reporting']       },
  { label: 'Customers',    description: 'Your full customer database with purchase history, debts and notes.',              href: '/dashboard/customers',   icon: Users2,       color: '#a855f7', features: ['Purchase history', 'Outstanding debts', 'Customer search']           },
  { label: 'Recruitment',  description: 'Post jobs, receive applications and run AI-assisted assessments.',                href: '/dashboard/recruitment', icon: Briefcase,    color: '#6366f1', features: ['Job postings', 'Application tracking', 'Auto assessment']            },
]

export default function ModulePreviews() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {MODULES.map(mod => (
        <Link
          key={mod.href}
          href={mod.href}
          className="group relative rounded-2xl border border-dash-border bg-dash-surface p-5 hover:bg-dash-hover transition-all duration-200 overflow-hidden"
        >
          {/* Background glow */}
          <div
            className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
            style={{ background: mod.color }}
          />

          {/* Icon + label */}
          <div className="flex items-center justify-between mb-4 relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}
            >
              <mod.icon className="w-5 h-5" style={{ color: mod.color }} />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>

          <h4 className="font-semibold text-foreground mb-1.5 relative">{mod.label}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 relative">{mod.description}</p>

          <div className="space-y-1.5 relative">
            {mod.features.map(f => (
              <div key={f} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Check className="w-3 h-3 shrink-0" style={{ color: mod.color }} />
                {f}
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  )
}
