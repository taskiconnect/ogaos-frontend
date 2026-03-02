// app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { StatCard } from '@/components/ui/StatCard'; // ← fixed import (from ui/)
import RevenueChart from '@/components/dashboard/RevenueChart';
import OutstandingDebts from '@/components/dashboard/OutstandingDebts';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import QuickActions from '@/components/dashboard/QuickActions';
import StaffOverview from '@/components/dashboard/StaffOverview';
import CustomersOverview from '@/components/dashboard/CustomersOverview';
import TaxCalculator from '@/components/dashboard/TaxCalculator';
import ModulePreviews from '@/components/dashboard/ModulePreviews';
import PostJobModal from '@/components/dashboard/PostJobModal';
import AddStaffModal from '@/components/dashboard/AddStaffModal';
import AddCustomerModal from '@/components/dashboard/AddCustomerModal';

import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  Users,
  Calculator as CalculatorIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const [showJobModal, setShowJobModal] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  // Safely get first name with fallback
  const firstName = user?.first_name || 'Miracle';

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />

      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-6 lg:p-10 space-y-12 pb-20">
          {/* Greeting */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Good morning, Oga {firstName} 👋
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Here's what's happening with your business today •{' '}
              {new Date().toLocaleDateString('en-NG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Stats Grid – using shadcn-style StatCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="TODAY'S SALES"
              value="₦245,890"
              change="+12.4%"
              icon={DollarSign}
              trend="up"
            />
            <StatCard
              title="OUTSTANDING DEBTS"
              value="₦128,450"
              change="-8.2%"
              icon={AlertTriangle}
              trend="down"
            />
            <StatCard
              title="ACTIVE STAFF"
              value="2 / 5"
              change="+1 today"
              icon={Users}
              trend="up"
            />
            <StatCard
              title="TOTAL CUSTOMERS"
              value="142"
              change="+19 this month"
              icon={TrendingUp}
              trend="up"
            />
          </div>

          {/* Revenue + Debts */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-4">
              <RevenueChart />
            </div>
            <div className="lg:col-span-3">
              <OutstandingDebts />
            </div>
          </div>

          {/* Recent + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <RecentTransactions />
            </div>
            <div className="lg:col-span-7">
              <QuickActions />
            </div>
          </div>

          {/* Staff + Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StaffOverview />
            <CustomersOverview />
          </div>

          {/* Tax + Hire-Right Quick Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TaxCalculator />
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8 h-full flex flex-col justify-center items-center text-center">
                <Briefcase className="w-14 h-14 text-primary mb-6" />
                <h3 className="text-2xl font-semibold mb-3">Hire-Right Recruitment</h3>
                <p className="text-gray-400 mb-8 max-w-md">
                  Post jobs and get matched with reliable staff in your area — fast.
                </p>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-10 text-lg"
                  onClick={() => setShowJobModal(true)}
                >
                  Post New Job
                </Button>
              </div>
            </div>
          </div>

          {/* Remaining Modules */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold">Explore More Features</h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <ModulePreviews />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <PostJobModal open={showJobModal} onOpenChange={setShowJobModal} />
      <AddStaffModal open={showAddStaff} onOpenChange={setShowAddStaff} />
      <AddCustomerModal open={showAddCustomer} onOpenChange={setShowAddCustomer} />
    </div>
  );
}