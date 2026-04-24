'use client'

import { useMemo, useState } from 'react'
import {
  Share2,
  Copy,
  Check,
  Lock,
  ShieldCheck,
  BadgeCheck,
  Wallet,
} from 'lucide-react'
import { initializeDigitalCheckout } from '@/lib/api/public'
import type { PublicDigitalProductResponse } from '@/types/public'
import { formatCurrency } from '@/types/public'
import { cn } from '@/lib/utils'

type Props = {
  product: PublicDigitalProductResponse
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function getFrontendBaseUrl() {
  const envBase = process.env.NEXT_PUBLIC_FRONTEND_URL || ''
  const trimmedEnvBase = trimTrailingSlash(envBase)
  if (trimmedEnvBase) return trimmedEnvBase
  if (typeof window !== 'undefined') {
    return trimTrailingSlash(window.location.origin)
  }
  return ''
}

function buildProductUrl(slug: string) {
  const base = getFrontendBaseUrl()
  const path = `/public/digital-store/product/${slug}`
  if (!base) return path
  return `${base}${path}`
}

export default function CheckoutCard({ product }: Props) {
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const productUrl = useMemo(() => buildProductUrl(product.slug), [product.slug])

  const fees = useMemo(() => {
    const price = Math.round((product.price || 0) / 100)
    const platformFee = Math.round(price * 0.05)
    return { price, platformFee, total: price + platformFee }
  }, [product.price])

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  async function handleNativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `Check out this digital product: ${product.title}`,
          url: productUrl,
        })
      } else {
        await handleCopyLink()
      }
    } catch {}
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!buyerName.trim() || !buyerEmail.trim()) {
      setError('Buyer name and email are required')
      return
    }

    try {
      setLoading(true)

      const res = await initializeDigitalCheckout(product.id, {
        buyer_name: buyerName.trim(),
        buyer_email: buyerEmail.trim(),
        buyer_phone: buyerPhone.trim() || undefined,
      })

      const authUrl = res.data?.authorization_url
      if (!authUrl) {
        throw new Error(res.message || 'No Paystack authorization URL returned')
      }

      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-primary focus:bg-white/[0.06]'

  const labelClass =
    'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500'

  return (
    <aside className="lg:sticky lg:top-[92px]">
      <div className="overflow-hidden rounded-3xl border border-white/8 bg-dash-surface shadow-lg">

        {/* Price header */}
        <div className="border-b border-white/8 p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Buy this product
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight text-white">
            {formatCurrency(product.price / 100, product.currency)}
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Secure payment via Paystack. Delivery based on seller's fulfillment flow.
          </p>
        </div>

        <div className="p-6 space-y-5">

          {/* Fee breakdown */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-gray-400">
              <span>Product price</span>
              <span className="font-semibold text-white">
                {formatCurrency(fees.price, product.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Platform fee (5%)</span>
              <span className="font-semibold text-white">
                {formatCurrency(fees.platformFee, product.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/8 pt-3 text-gray-400">
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-white">
                {formatCurrency(fees.total, product.currency)}
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 text-center">
              <ShieldCheck className="h-5 w-5 text-primary mx-auto" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white">Secure</p>
              <p className="mt-1 text-[10px] leading-4 text-gray-500">Protected checkout</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 text-center">
              <BadgeCheck className="h-5 w-5 text-primary mx-auto" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white">Trusted</p>
              <p className="mt-1 text-[10px] leading-4 text-gray-500">OgaOS store</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 text-center">
              <Wallet className="h-5 w-5 text-primary mx-auto" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white">Simple</p>
              <p className="mt-1 text-[10px] leading-4 text-gray-500">Fast purchase</p>
            </div>
          </div>

          {/* Share row — Share + Copy only */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Share2 className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Share this product
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-[11px] font-semibold text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-[11px] font-semibold text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span className={cn(copied && 'text-emerald-400')}>
                  {copied ? 'Copied!' : 'Copy link'}
                </span>
              </button>
            </div>
          </div>

          {/* Checkout form */}
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className={inputClass}
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className={labelClass}>Phone number <span className="normal-case text-gray-600">(optional)</span></label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className={inputClass}
                placeholder="Enter your phone number"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90',
                loading && 'cursor-not-allowed opacity-60'
              )}
            >
              <Lock className="h-4 w-4" />
              {loading ? 'Redirecting to payment…' : 'Proceed to payment'}
            </button>

            <p className="text-center text-[10px] text-gray-600 leading-4">
              By purchasing, you agree to the seller's delivery terms. Payments are processed securely via Paystack.
            </p>
          </form>
        </div>
      </div>
    </aside>
  )
}