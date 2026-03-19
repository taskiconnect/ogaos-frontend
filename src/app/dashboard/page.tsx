'use client'

import { useState } from 'react'
import Sidebar            from '@/components/dashboard/Sidebar'
import DashboardHeader    from '@/components/dashboard/DashboardHeader'
import { StatCard }       from '@/components/ui/StatCard'
import RevenueChart       from '@/components/dashboard/RevenueChart'
import OutstandingDebts   from '@/components/dashboard/OutstandingDebts'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import QuickActions       from '@/components/dashboard/QuickActions'
import CustomersOverview  from '@/components/dashboard/CustomersOverview'
import TaxCalculator      from '@/components/dashboard/TaxCalculator'
import ModulePreviews     from '@/components/dashboard/ModulePreviews'
import PostJobModal       from '@/components/dashboard/PostJobModal'
import AddCustomerModal   from '@/components/dashboard/AddCustomerModal'
import AddStaffModal      from '@/components/dashboard/AddStaffModal'
import StaffOverview      from '@/components/dashboard/StaffOverview'
import { DollarSign, AlertTriangle, TrendingUp, Briefcase, Users } from 'lucide-react'
import { useAuthStore }   from '@/stores/authStore'
import { Button }         from '@/components/ui/button'
import { useDashboard, formatNaira } from '@/lib/hooks/useDashboard'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const dash = useDashboard()

  const [showJobModal,    setShowJobModal]    = useState(false)
  const [showAddStaff,    setShowAddStaff]    = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  const firstName = user?.first_name || 'Oga'

  return (
    <div className="min-h-screen bg-dash-bg text-foreground">
      <Sidebar />

      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-6 lg:p-10 space-y-12 pb-20">

          {/* Greeting */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Good morning, Oga {firstName} 👋
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Here&apos;s what&apos;s happening with your business today &middot;{' '}
              {new Date().toLocaleDateString('en-NG', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="TODAY'S SALES"
              value={dash.isLoading ? '—' : formatNaira(dash.todaySalesTotal * 100)}
              change={dash.isLoading ? '…' : `${dash.todaySalesCount} transaction${dash.todaySalesCount !== 1 ? 's' : ''}`}
              icon={DollarSign}
              trend="up"
            />
            {/* Outstanding = money customers still owe from partial sales */}
            <StatCard
              title="CUSTOMERS OWE YOU"
              value={dash.isLoading ? '—' : formatNaira(dash.outstandingDebtTotal * 100)}
              change={dash.isLoading ? '…' : dash.outstandingDebtCount === 0
                ? 'All paid up'
                : `${dash.outstandingDebtCount} sale${dash.outstandingDebtCount !== 1 ? 's' : ''} unpaid`
              }
              icon={AlertTriangle}
              trend={dash.outstandingDebtCount > 0 ? 'down' : 'neutral'}
            />
            <StatCard
              title="ACTIVE STAFF"
              value="—"
              change="Go to Staff page"
              icon={Users}
              trend="neutral"
            />
            <StatCard
              title="TOTAL CUSTOMERS"
              value={dash.isLoading ? '—' : dash.totalCustomers.toString()}
              change="in your CRM"
              icon={TrendingUp}
              trend="up"
            />
          </div>

          {/* Revenue + Debts */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-4">
              <RevenueChart data={dash.monthlyRevenue} isLoading={dash.isLoading} />
            </div>
            <div className="lg:col-span-3">
              <OutstandingDebts debts={[]} isLoading={dash.isLoading} />
            </div>
          </div>

          {/* Recent Transactions + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <RecentTransactions sales={dash.recentSales} isLoading={dash.isLoading} />
            </div>
            <div className="lg:col-span-7">
              <QuickActions onAddCustomer={() => setShowAddCustomer(true)} />
            </div>
          </div>

          {/* Staff + Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StaffOverview />
            <CustomersOverview customers={dash.topCustomers} isLoading={dash.isLoading} />
          </div>

          {/* Tax Calculator + Hire-Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TaxCalculator />
            </div>
            <div className="lg:col-span-5">
              <div className="bg-dash-surface border border-dash-border rounded-3xl p-8 h-full flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                  <Briefcase className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Hire-Right Recruitment</h3>
                <p className="text-muted-foreground mb-8 max-w-xs text-sm leading-relaxed">
                  Post jobs and get matched with reliable staff in your area — fast.
                </p>
                <Button
                  size="lg"
                  className="px-10 text-base font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
                  onClick={() => setShowJobModal(true)}
                >
                  Post New Job
                </Button>
              </div>
            </div>
          </div>

          {/* Explore More Features */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Explore More Features</h2>
              <div className="h-px flex-1 bg-dash-border" />
            </div>
            <ModulePreviews />
          </div>

        </main>
      </div>

      <PostJobModal     open={showJobModal}    onOpenChange={setShowJobModal}    />
      <AddStaffModal    open={showAddStaff}    onOpenChange={setShowAddStaff}    />
      <AddCustomerModal
        open={showAddCustomer}
        onOpenChange={setShowAddCustomer}
        onSuccess={() => dash.refetch()}
      />
    </div>
  )
}
