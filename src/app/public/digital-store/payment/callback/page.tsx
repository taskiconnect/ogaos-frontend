import Link from 'next/link'
import { CheckCircle, Hash, Receipt, Key } from 'lucide-react'

type PageProps = {
  searchParams: Promise<{
    reference?: string
    trxref?: string
    order_id?: string
    token?: string
  }>
}

export default async function PaymentCallbackPage({ searchParams }: PageProps) {
  const params = await searchParams
  const reference = params.reference || params.trxref || ''
  const orderId = params.order_id || ''
  const token = params.token || ''

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <CheckCircle className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Payment received
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
            We got your payment
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
            Your payment is being confirmed. If the fulfillment link didn&apos;t open
            automatically, use the details below.
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-dash-surface p-6 shadow-lg">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Transaction details
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2 shrink-0">
                <Receipt className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Reference
                </span>
              </div>
              <span className="text-right text-xs font-semibold text-white break-all">
                {reference || 'Not available'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2 shrink-0">
                <Hash className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Order ID
                </span>
              </div>
              <span className="text-right text-xs font-semibold text-white break-all">
                {orderId || 'Available via redirect flow'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2 shrink-0">
                <Key className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Token
                </span>
              </div>
              <span className="text-right text-xs font-semibold text-white break-all">
                {token || 'Available after fulfillment'}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-600">
            Use the order ID and token from your completion link to open the fulfillment page.
          </p>

          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}