'use client'
import { PLAN_META } from '@/lib/config/plans'
import { formatNaira } from '@/lib/utils/Utils'
import { ArrowUpRight, Check } from 'lucide-react'
import Link from 'next/link'
export function PricingSection() {
  return (
    <section id="pricing" className="relative bg-background px-5 py-24 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-bold tracking-[.22em] text-blue-400 uppercase">
            Simple plans. Room to grow.
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your next chapter starts here.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Open your dashboard on any plan. Add the tools you need as your business grows. Prices
            match your OgaOS workspace.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {(['growth', 'pro', 'custom'] as const).map((plan) => {
            const meta = PLAN_META[plan]
            return (
              <article
                key={plan}
                className={`relative rounded-3xl border p-8 ${plan === 'growth' ? 'border-blue-400/50 bg-blue-500/10' : 'border-border bg-card'}`}
              >
                {meta.popular && (
                  <span className="mb-6 inline-block rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold">{meta.label}</h3>
                <p className="mt-2 min-h-12 text-sm text-muted-foreground">{meta.description}</p>
                <p className="my-7 text-4xl font-semibold">
                  {plan === 'custom' ? 'Let’s talk' : formatNaira(meta.monthlyPrice)}
                  {plan !== 'custom' && (
                    <span className="text-sm font-normal text-muted-foreground"> /month</span>
                  )}
                </p>
                <ul className="mb-8 space-y-3 text-sm">
                  {meta.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/auth/register?plan=${plan}`}
                  className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  {plan === 'custom' ? 'Create an account' : `Choose ${meta.label}`}
                  <ArrowUpRight className="size-4" />
                </Link>
              </article>
            )
          })}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Monthly prices shown in NGN. The payment quote in checkout is authoritative. No
          unconfigured annual discount is advertised.
        </p>
      </div>
    </section>
  )
}
