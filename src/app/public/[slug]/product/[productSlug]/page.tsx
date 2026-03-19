'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Download, ShoppingBag, Star,
  CheckCircle2, Loader2, AlertCircle, Play,
  Shield, Clock, FileText,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicProduct {
  id: string
  title: string
  slug: string
  description: string
  type: string
  price: number        // kobo
  currency: string
  cover_image_url: string | null
  gallery_image_urls: string   // JSON array string
  promo_video_url: string | null
  file_size: number | null
  file_mime_type: string | null
  sales_count: number
}

// Paystack inline types
declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: PaystackOptions) => { openIframe: () => void }
    }
  }
}
interface PaystackOptions {
  key: string
  email: string
  amount: number       // kobo
  currency: string
  ref: string
  metadata: Record<string, unknown>
  callback: (response: { reference: string }) => void
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? ''

function fmt(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtSize(bytes: number | null) {
  if (!bytes) return null
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}
function genRef() {
  return `ogaos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
function youtubeEmbed(url: string | null) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-14 bg-gray-200 rounded-2xl mt-6" />
      </div>
    </div>
  )
}

// ─── Purchase form ─────────────────────────────────────────────────────────────

interface PurchaseFormProps {
  product: PublicProduct
  onSuccess: () => void
}

function PurchaseForm({ product, onSuccess }: PurchaseFormProps) {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const scriptRef = useRef(false)

  // Load Paystack inline script once
  useEffect(() => {
    if (scriptRef.current || !PAYSTACK_KEY) return
    scriptRef.current = true
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.async = true
    document.head.appendChild(s)
  }, [])

  function validate() {
    if (!name.trim())  { setError('Please enter your name');  return false }
    if (!email.trim()) { setError('Please enter your email'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  function handlePay() {
    setError('')
    if (!validate()) return
    if (!window.PaystackPop) {
      setError('Payment system not ready. Please refresh and try again.')
      return
    }
    if (!PAYSTACK_KEY) {
      setError('Payment is not configured for this store.')
      return
    }

    setLoading(true)
    const ref = genRef()

    const handler = window.PaystackPop.setup({
      key:      PAYSTACK_KEY,
      email:    email.trim(),
      amount:   product.price,
      currency: product.currency || 'NGN',
      ref,
      metadata: {
        type:       'digital_purchase',
        product_id: product.id,
        buyer_name: name.trim(),
      },
      callback: () => {
        // Payment confirmed by Paystack — backend webhook will handle fulfillment
        setLoading(false)
        onSuccess()
      },
      onClose: () => {
        setLoading(false)
      },
    })
    handler.openIframe()
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Complete your purchase</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Emeka Okafor"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="emeka@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">Your download link will be sent to this email</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-4 rounded-xl text-base font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
      >
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          : <>Pay {fmt(product.price)} securely</>
        }
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Shield className="w-3.5 h-3.5" />
        Secured by Paystack
      </div>
    </div>
  )
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessScreen({ email }: { email: string }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
      </div>
      <h3 className="text-lg font-bold text-emerald-800">Payment successful!</h3>
      <p className="text-sm text-emerald-700">
        Your download link has been sent to <span className="font-semibold">{email}</span>.
        Please check your inbox (and spam folder).
      </p>
      <p className="text-xs text-emerald-600">The link expires in 48 hours.</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const params      = useParams()
  const slug        = params?.slug        as string
  const productSlug = params?.productSlug as string

  const [product,   setProduct]   = useState<PublicProduct | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [buyerEmail, setBuyerEmail] = useState('')

  useEffect(() => {
    if (!productSlug) return
    fetch(`${API}/api/v1/public/store/${productSlug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => { if (data) setProduct(data?.data ?? data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [productSlug])

  if (loading)  return <Skeleton />

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-8 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h1 className="text-xl font-bold text-gray-900">Product not found</h1>
        <Link href={`/public/${slug}`} className="text-blue-600 font-semibold hover:underline">
          ← Back to store
        </Link>
      </div>
    )
  }

  const embedUrl  = youtubeEmbed(product.promo_video_url)
  const gallery   = (() => { try { return JSON.parse(product.gallery_image_urls ?? '[]') } catch { return [] } })() as string[]
  const allImages = [product.cover_image_url, ...gallery].filter(Boolean) as string[]
  const [activeImg, setActiveImg] = useState(0)
  const sizeStr   = fmtSize(product.file_size)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/public/${slug}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to store
          </Link>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Powered by <span className="font-bold text-gray-700">Oga<span className="text-blue-600">OS</span></span>
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-16">

        {/* Media: video takes priority, then image gallery */}
        {embedUrl ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm bg-black">
            <iframe src={embedUrl} title={product.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen className="w-full h-full" />
          </div>
        ) : allImages.length > 0 ? (
          <div className="space-y-2">
            {/* Main image */}
            <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden shadow-sm bg-gray-100">
              <img src={allImages[activeImg]} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {/* Thumbnails — only show if more than 1 image */}
            {allImages.length > 1 && (
              <div className="flex gap-2">
                {allImages.map((url, i) => (
                  <button key={url} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      i === activeImg ? 'border-blue-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-blue-200" />
          </div>
        )}

        {/* Product info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              {product.type}
            </span>
            {product.sales_count > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <Star className="w-3 h-3 fill-current" /> {product.sales_count} people bought this
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-3 pt-1">
            {sizeStr && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Download className="w-3.5 h-3.5" /> {sizeStr} download
              </div>
            )}
            {product.file_mime_type && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                <FileText className="w-3.5 h-3.5" /> {product.file_mime_type.split('/')[1]?.toUpperCase() ?? 'File'}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5" /> Instant delivery via email
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-4xl font-black text-gray-900">{fmt(product.price)}</span>
          </div>
        </div>

        {/* Purchase form or success */}
        {purchased ? (
          <SuccessScreen email={buyerEmail} />
        ) : (
          <PurchaseForm
            product={product}
            onSuccess={() => setPurchased(true)}
          />
        )}

        {/* What you get */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">What you get</h4>
          <ul className="space-y-2">
            {[
              'Instant download link sent to your email',
              'Access within minutes of payment',
              '48-hour download window',
              'Secure payment via Paystack',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-blue-800">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
