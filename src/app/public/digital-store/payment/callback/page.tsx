import { Clock3 } from 'lucide-react'
import Link from 'next/link'
export const metadata = {
  title: 'Payment confirmation | OgaOS',
  robots: { index: false, follow: false },
  referrer: 'no-referrer' as const,
}
export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string; order_id?: string; token?: string }>
}) {
  const p = await searchParams
  const reference = p.reference || p.trxref
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <section className="max-w-xl rounded-3xl border border-border bg-card p-8 sm:p-10">
        <span className="mb-6 grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Clock3 className="size-7" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          Payment processing
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Check your payment confirmation.</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Returning from checkout does not confirm a successful payment. Once your payment has been
          confirmed, your access link will be sent to the email address used at checkout. Keep this
          reference and avoid paying again while confirmation is pending.
        </p>
        {reference && (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Payment reference</p>
            <p className="mt-1 break-all font-mono text-sm">{reference}</p>
          </div>
        )}
        {p.order_id && p.token && (
          <Link
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
            href={`/public/digital-orders/${encodeURIComponent(p.order_id)}/complete?token=${encodeURIComponent(p.token)}`}
          >
            Check order access
          </Link>
        )}
        <div className="mt-6">
          <Link href="/" className="text-sm text-blue-400">
            Return to OgaOS →
          </Link>
        </div>
      </section>
    </main>
  )
}
