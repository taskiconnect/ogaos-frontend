// src/app/public/digital-orders/[orderId]/complete/page.tsx

import Link from 'next/link'
import { CheckCircle, Download, ExternalLink, Clock, CreditCard, Package } from 'lucide-react'
import { getOrderFulfillment, getTokenDownloadUrl } from '@/lib/api/public'

type PageProps = {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function DigitalOrderCompletePage({
  params,
  searchParams,
}: PageProps) {
  const { orderId } = await params
  const { token } = await searchParams

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-dash-surface p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
            <span className="text-xl">⚠️</span>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-1">
            Access error
          </p>
          <h1 className="text-xl font-bold text-white">Invalid access link</h1>
          <p className="mt-2 text-sm text-gray-400">
            This fulfillment link is incomplete — the token is missing.
          </p>
        </div>
      </main>
    )
  }

  const res = await getOrderFulfillment(orderId, token)
  const data = res.data

  if (!data) {
    throw new Error(res.message || 'No fulfillment data returned')
  }

  const downloadUrl = data.download_token
    ? getTokenDownloadUrl(data.download_token)
    : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Order fulfillment
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white">
              {data.product_title}
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-gray-400">{data.message}</p>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-white/8 bg-dash-surface p-6 shadow-lg">

          {/* Status grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <CreditCard className="h-3.5 w-3.5" />
                <p className="text-[10px] font-semibold uppercase tracking-wide">
                  Payment status
                </p>
              </div>
              <p className="text-base font-semibold capitalize text-white">
                {data.payment_status}
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Package className="h-3.5 w-3.5" />
                <p className="text-[10px] font-semibold uppercase tracking-wide">
                  Fulfillment status
                </p>
              </div>
              <p className="text-base font-semibold capitalize text-white">
                {data.fulfillment_status}
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <CheckCircle className="h-3.5 w-3.5" />
                <p className="text-[10px] font-semibold uppercase tracking-wide">
                  Access granted
                </p>
              </div>
              <p className="text-base font-semibold text-white">
                {data.access_granted ? (
                  <span className="text-emerald-400">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock className="h-3.5 w-3.5" />
                <p className="text-[10px] font-semibold uppercase tracking-wide">
                  Access expires
                </p>
              </div>
              <p className="text-base font-semibold text-white">
                {data.access_expires_at
                  ? new Date(data.access_expires_at).toLocaleString()
                  : 'Not specified'}
              </p>
            </div>
          </div>

          {/* Delivery note */}
          {data.delivery_note && (
            <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-yellow-400">
                Delivery note
              </p>
              <p className="mt-1.5 text-sm leading-6 text-yellow-300/80">
                {data.delivery_note}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/6 pt-5">
            {downloadUrl && (
              <a
                href={downloadUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download product
              </a>
            )}

            {data.redirect_url && (
              <a
                href={data.redirect_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <ExternalLink className="h-4 w-4" />
                Open access link
              </a>
            )}

            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.08] hover:text-white"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}