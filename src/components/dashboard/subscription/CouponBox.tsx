'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { TicketPercent } from 'lucide-react'
import { validateSubscriptionCoupon } from '@/lib/api/subscription'
import type { CouponValidationData, SubscriptionPlan } from '@/lib/api/types'
import { formatNaira } from '@/lib/utils/Utils'

interface Props {
  plan: SubscriptionPlan
  periodMonths: number
  originalAmount: number
  onValidated: (data: CouponValidationData | null, code: string) => void
}

export default function CouponBox({ plan, periodMonths, originalAmount, onValidated }: Props) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CouponValidationData | null>(null)

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code')
      return
    }

    setLoading(true)
    try {
      const res = await validateSubscriptionCoupon({
        plan,
        period_months: periodMonths,
        coupon_code: couponCode.trim(),
        original_amount: originalAmount * 100,
      })

      const normalized: CouponValidationData = {
        ...res.data,
        original_amount: Math.round(res.data.original_amount / 100),
        discount_amount: Math.round(res.data.discount_amount / 100),
        final_amount: Math.round(res.data.final_amount / 100),
      }

      setResult(normalized)
      onValidated(normalized, couponCode.trim())
      toast.success('Coupon applied successfully')
    } catch (err: any) {
      setResult(null)
      onValidated(null, '')
      toast.error(err?.response?.data?.message ?? 'Invalid coupon code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TicketPercent className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-white">Have a coupon code?</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/40"
        />
        <button
          onClick={applyCoupon}
          disabled={loading}
          className="h-11 px-5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
        >
          {loading ? 'Validating…' : 'Apply Coupon'}
        </button>
      </div>

      {result && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="text-sm text-emerald-300">
            Discount applied: <span className="font-semibold">{formatNaira(result.discount_amount)}</span>
          </p>
          <p className="text-xs text-emerald-400/90 mt-1">
            Final total: {formatNaira(result.final_amount)}
          </p>
        </div>
      )}
    </div>
  )
}