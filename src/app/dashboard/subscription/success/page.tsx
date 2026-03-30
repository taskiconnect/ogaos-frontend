'use client'

export const dynamic = 'force-dynamic'

import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-10 pb-20">
          <div className="max-w-2xl mx-auto rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-white">Subscription Activated</h1>
            <p className="mt-2 text-sm text-gray-300">
              Your payment was successful and your subscription features are now available.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
              >
                View Subscription
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-gray-200 hover:bg-white/10"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}