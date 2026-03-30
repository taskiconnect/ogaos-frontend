'use client'

export const dynamic = 'force-dynamic'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import CouponBox from '@/components/dashboard/subscription/CouponBox'
import { BILLING_OPTIONS, PLAN_META, formatNaira, getPlanTotal } from '@/lib/utils/Utils'
import { initiateSubscription } from '@/lib/api/subscription'
import type { CouponValidationData, SubscriptionPlan } from '@/lib/api/types'

export default function SubscriptionCheckoutPage() {
  const params = useSearchParams()
  const router = useRouter()

  const initialPlan = (params.get('plan') as SubscriptionPlan) || 'growth'
  const initialPeriod = Number(params.get('period') || '1')

  const [plan, setPlan] = useState<SubscriptionPlan>(initialPlan)
  const [periodMonths, setPeriodMonths] = useState(initialPeriod)
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState<CouponValidationData | null>(null)
  const [loading, setLoading] = useState(false)

  const meta = PLAN_META[plan]
  const originalAmount = useMemo(() => getPlanTotal(plan, periodMonths), [plan, periodMonths])
  const finalAmount = couponData?.final_amount ?? originalAmount

  const handleProceed = async () => {
    setLoading(true)
    try {
      const res = await initiateSubscription({
        plan,
        period_months: periodMonths,
        coupon_code: couponCode || undefined,
      })

      if (res.data.activated) {
        toast.success(res.data.message ?? 'Subscription activated successfully')
        router.push('/dashboard/subscription/success')
        return
      }

      if (res.data.paystack_authorization_url) {
        window.location.href = res.data.paystack_authorization_url
        return
      }

      toast.error('Unable to start payment')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Could not initiate subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 pb-20 max-w-5xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-sm text-gray-400 mt-1">
              Choose your plan, apply a coupon, and continue to Paystack.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/2 p-6 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Selected Plan</p>
                  <h2 className="text-2xl font-bold text-white mt-2">{meta.label}</h2>
                  <p className="text-sm text-gray-400 mt-1">{meta.description}</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                    Billing Period
                  </label>
                  <select
                    value={periodMonths}
                    onChange={(e) => {
                      const months = Number(e.target.value)
                      setPeriodMonths(months)
                      setCouponData(null)
                      setCouponCode('')
                    }}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/40"
                  >
                    {BILLING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <CouponBox
                plan={plan}
                periodMonths={periodMonths}
                originalAmount={originalAmount}
                onValidated={(data, code) => {
                  setCouponData(data)
                  setCouponCode(code)
                }}
              />
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-white/10 bg-white/2 p-6 space-y-4 sticky top-24">
                <h3 className="text-lg font-semibold text-white">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Plan</span>
                    <span className="text-white font-medium">{meta.label}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Period</span>
                    <span className="text-white font-medium">{periodMonths} month(s)</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Original Amount</span>
                    <span className="text-white font-medium">{formatNaira(originalAmount)}</span>
                  </div>

                  {couponData && (
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Discount</span>
                      <span className="font-semibold">- {formatNaira(couponData.discount_amount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Payable</span>
                  <span className="text-2xl font-bold text-white">{formatNaira(finalAmount)}</span>
                </div>

                <button
                  onClick={handleProceed}
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
                >
                  {loading ? 'Processing…' : finalAmount === 0 ? 'Activate Now' : 'Proceed to Paystack'}
                </button>

                <button
                  onClick={() => router.push('/dashboard/subscription')}
                  className="w-full h-11 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 hover:bg-white/10"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}