'use client'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
/** Mirrors the original API middleware plan map. Go remains authoritative. */
export function PlanAccess({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const segment = path.split('/')[2]
  const required: Record<string, 'growth' | 'pro'> = {
    invoices: 'growth',
    debts: 'growth',
    expenses: 'pro',
    stores: 'pro',
    recruitment: 'pro',
  }
  const need = required[segment]
  const q = useSubscription()
  if (!need) return <>{children}</>
  if (q.isLoading)
    return (
      <p role="status" className="p-10 text-sm text-muted-foreground">
        Checking plan access…
      </p>
    )
  if (q.isError)
    return (
      <div role="alert" className="m-6 rounded-2xl border border-border p-6">
        Plan information is temporarily unavailable.{' '}
        <button onClick={() => void q.refetch()} className="text-blue-400">
          Try again
        </button>
      </div>
    )
  const sub = q.subscription
  const active = sub && q.isActive
  const allowed =
    active &&
    (sub.plan === 'custom' || sub.plan === 'pro' || (need === 'growth' && sub.plan === 'growth'))
  if (allowed) return <>{children}</>
  return (
    <section className="mx-auto m-6 max-w-2xl rounded-3xl border border-border bg-card p-8 sm:p-12">
      <LockKeyhole className="mb-5 size-9 text-blue-400" />
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        More room to grow
      </p>
      <h1 className="mt-3 text-3xl font-semibold capitalize">
        {segment} is available with {need === 'pro' ? 'Pro' : 'Growth'}.
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Your business dashboard remains available on every plan. Upgrade when you’re ready to use
        these additional tools.
      </p>
      <div className="mt-7 flex gap-3">
        <Link
          href="/dashboard/subscription"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Compare plans
        </Link>
        <Link href="/dashboard" className="rounded-xl border border-border px-5 py-3 text-sm">
          Back to dashboard
        </Link>
      </div>
    </section>
  )
}
