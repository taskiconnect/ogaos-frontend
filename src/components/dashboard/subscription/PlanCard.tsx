'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubscriptionPlan } from '@/lib/api/types'
import { PLAN_META, formatNaira } from '@/lib/utils/Utils'

interface Props {
  plan: SubscriptionPlan
  selected?: boolean
  currentPlan?: SubscriptionPlan
  onSelect?: (plan: SubscriptionPlan) => void
}

export default function PlanCard({ plan, selected, currentPlan, onSelect }: Props) {
  const meta = PLAN_META[plan]
  const isCurrent = currentPlan === plan

  return (
    <div
      className={cn(
        'relative rounded-3xl border p-6 bg-white/2 backdrop-blur-xl transition-all',
        selected
          ? 'border-primary/50 shadow-lg shadow-primary/10'
          : 'border-white/10 hover:border-white/20 hover:bg-white/4',
        meta.popular && 'ring-1 ring-primary/30'
      )}
    >
      {meta.popular && (
        <div className="absolute -top-3 right-5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase text-white">
          Popular
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-bold text-white">{meta.label}</h3>
        <p className="mt-1 text-sm text-gray-400">{meta.description}</p>
      </div>

      <div className="mb-6">
        <p className="text-4xl font-extrabold text-white">
          {plan === 'custom' ? 'Custom' : formatNaira(meta.monthlyPrice)}
          {plan !== 'custom' && <span className="ml-1 text-base text-gray-500">/month</span>}
        </p>
      </div>

      <ul className="space-y-3 mb-6">
        {meta.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-gray-200">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        disabled={isCurrent}
        onClick={() => onSelect?.(plan)}
        className={cn(
          'w-full h-11 rounded-xl text-sm font-semibold transition-all',
          isCurrent
            ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
            : selected
            ? 'text-white'
            : 'bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10'
        )}
        style={
          !isCurrent && selected
            ? { background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }
            : undefined
        }
      >
        {isCurrent ? 'Current Plan' : meta.cta}
      </button>
    </div>
  )
}