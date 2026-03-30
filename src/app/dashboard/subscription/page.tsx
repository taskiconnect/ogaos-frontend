'use client'

export const dynamic = 'force-dynamic'

import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import SubscriptionSummaryCard from '@/components/dashboard/subscription/SubscriptionSummaryCard'
import PlanCard from '@/components/dashboard/subscription/PlanCard'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SubscriptionPlan } from '@/lib/api/types'

export default function SubscriptionPage() {
  const { subscription, isLoading } = useSubscription()
  const router = useRouter()

  const goToCheckout = (plan: SubscriptionPlan) => {
    if (plan === 'free' || plan === 'custom') return
    router.push(`/dashboard/subscription/checkout?plan=${plan}&period=1`)
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 pb-20">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subscription</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage billing, plan upgrades, and feature access.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-white/10 bg-white/2 p-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <SubscriptionSummaryCard subscription={subscription} />

              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Available Plans</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <PlanCard plan="growth" currentPlan={subscription?.plan} onSelect={goToCheckout} />
                  <PlanCard plan="pro" currentPlan={subscription?.plan} onSelect={goToCheckout} />
                  <PlanCard plan="custom" currentPlan={subscription?.plan} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}