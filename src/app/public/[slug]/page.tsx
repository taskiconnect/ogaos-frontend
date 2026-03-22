'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Globe, ShoppingBag, Star, Download,
  Package, ExternalLink, ChevronRight, AlertCircle, Play, X,
  CheckCircle2, Building2, Tag,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicBusiness {
  id: string
  name: string
  category: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  street: string | null
  city_town: string | null
  local_government: string | null
  state: string | null
  country: string | null
  is_verified: boolean
  profile_views: number
  gallery_image_urls: string
  storefront_video_url: string | null
}

interface PublicProduct {
  id: string
  title: string
  slug: string
  description: string
  type: string
  price: number
  currency: string
  cover_image_url: string | null
  gallery_image_urls: string
  file_size: number | null
  file_mime_type: string | null
  sales_count: number
  is_published: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/api\/v1\/?$/, '')

function fmt(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}
function fmtSize(bytes: number | null) {
  if (!bytes) return null
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000)     return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}
function parseGallery(raw: string | null | undefined): string[] {
  try { return JSON.parse(raw ?? '[]') } catch { return [] }
}
function youtubeEmbed(url: string | null) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}
function fullAddress(b: PublicBusiness) {
  return [b.street, b.city_town, b.local_government, b.state, b.country]
    .filter(Boolean).join(', ')
}
function shortAddress(b: PublicBusiness) {
  return [b.city_town, b.state].filter(Boolean).join(', ')
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#0c0c12] animate-pulse">
      <div className="h-56 bg-white/5" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end gap-5 -mt-16 mb-8">
          <div className="w-28 h-28 rounded-3xl bg-white/10 border-4 border-[#0c0c12] shrink-0" />
          <div className="pb-2 space-y-3">
            <div className="h-8 w-56 bg-white/10 rounded-xl" />
            <div className="h-4 w-36 bg-white/5 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, initial, onClose }: { images: string[]; initial: number; onClose: () => void }) {
  const [active, setActive] = useState(initial)
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
        <X className="w-5 h-5" />
      </button>
      <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img src={images[active]} alt="" className="w-full max-h-[80vh] object-contain rounded-2xl" />
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {images.map((url, i) => (
              <button key={url} onClick={() => setActive(i)}
                className="shrink-0 transition-all">
                <img src={url} alt=""
                  className={`w-14 h-14 object-cover rounded-xl border-2 transition-all ${
                    i === active ? 'border-blue-400 opacity-100' : 'border-white/10 opacity-40 hover:opacity-70'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ p, slug }: { p: PublicProduct; slug: string }) {
  const typeColors: Record<string, string> = {
    download: 'bg-blue-500/15 text-blue-400',
    course:   'bg-purple-500/15 text-purple-400',
    video:    'bg-red-500/15 text-red-400',
    service:  'bg-emerald-500/15 text-emerald-400',
    other:    'bg-gray-500/15 text-gray-400',
  }
  const tc = typeColors[p.type] ?? typeColors.other

  return (
    <Link href={`/public/${slug}/product/${p.slug}`}
      className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200 flex flex-col">
      {/* Cover */}
      <div className="relative h-48 bg-white/5 overflow-hidden shrink-0">
        {p.cover_image_url ? (
          <img src={p.cover_image_url} alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-14 h-14 text-white/10" />
          </div>
        )}
        {/* Type badge */}
        <span className={`absolute top-3 left-3 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${tc}`}>
          {p.type}
        </span>
        {p.sales_count > 0 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400/90 backdrop-blur text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <Star className="w-3 h-3 fill-current" /> {p.sales_count}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-5 flex flex-col gap-2.5">
        <h3 className="font-bold text-white text-base line-clamp-2 group-hover:text-blue-300 transition-colors">
          {p.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 flex-1 leading-relaxed">{p.description}</p>
        {p.file_size && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Download className="w-3.5 h-3.5" />
            <span>{fmtSize(p.file_size)}</span>
            {p.file_mime_type && <span className="text-gray-600">· {p.file_mime_type.split('/')[1]?.toUpperCase()}</span>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
        <div>
          <p className="text-xs text-gray-500">Price</p>
          <p className="text-xl font-bold text-white">{fmt(p.price)}</p>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2.5 rounded-xl shrink-0 group-hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
          Buy <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, href }: {
  icon: React.ElementType; label: string; value: string; href?: string
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-blue-400" />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-sm text-gray-200 mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  )
  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="hover:opacity-80 transition-opacity">{content}</a>
  )
  return content
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StorefrontPage() {
  const params  = useParams()
  const slug    = params?.slug as string

  const [business,  setBusiness]  = useState<PublicBusiness | null>(null)
  const [products,  setProducts]  = useState<PublicProduct[]>([])
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [lightbox,  setLightbox]  = useState<{ images: string[]; index: number } | null>(null)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      fetch(`${API}/api/v1/public/business/${slug}`),
      fetch(`${API}/api/v1/public/business/${slug}/products`),
    ])
      .then(async ([bizRes, prodRes]) => {
        if (bizRes.status === 404) { setNotFound(true); return }
        const bizJson  = await bizRes.json()
        const prodJson = prodRes.ok ? await prodRes.json() : { data: [] }
        setBusiness(bizJson?.data ?? bizJson)
        setProducts(prodJson?.data ?? [])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Skeleton />

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Store not found</h1>
        <p className="text-gray-400">This storefront doesn&apos;t exist or has been taken down.</p>
      </div>
    )
  }

  const gallery     = parseGallery(business.gallery_image_urls)
  const published   = products.filter(p => p.is_published)
  const videoEmbed  = youtubeEmbed(business.storefront_video_url)
  const fullAddr    = fullAddress(business)
  const shortAddr   = shortAddress(business)
  const initials    = business.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#0c0c12] text-white">

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div className="relative h-52 sm:h-64 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #001a6e 0%, #0d47b8 50%, #1e90ff 100%)' }}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Category tag */}
        <div className="absolute bottom-5 right-5">
          <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Tag className="w-3 h-3" /> {business.category}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Profile header ──────────────────────────────────────────────── */}
        <div className="-mt-16 mb-8 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          {/* Logo */}
          <div className="w-28 h-28 rounded-3xl border-4 border-[#0c0c12] overflow-hidden bg-[#1a1a2e] shadow-2xl shrink-0">
            {business.logo_url
              ? <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>{initials}</div>
            }
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{business.name}</h1>
              {business.is_verified && (
                <span className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
              {shortAddr && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" /> {shortAddr}
                </span>
              )}
              {published.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-gray-500" /> {published.length} product{published.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Powered by */}
          <div className="pb-1 shrink-0">
            <a href="/" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Powered by <span className="font-bold text-white">Oga<span className="text-blue-400">OS</span></span>
            </a>
          </div>
        </div>

        {/* ── Main content grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">

          {/* Left sidebar — business info */}
          <aside className="lg:col-span-4 space-y-5 order-2 lg:order-1">

            {/* About */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">About</h2>
              {business.description ? (
                <p className="text-sm text-gray-300 leading-relaxed">{business.description}</p>
              ) : (
                <p className="text-sm text-gray-600 italic">No description added yet.</p>
              )}
            </div>

            {/* Contact & Location */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact & Location</h2>

              {fullAddr && (
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={fullAddr}
                  href={`https://maps.google.com/?q=${encodeURIComponent(fullAddr)}`}
                />
              )}
              {business.website_url && (
                <InfoRow
                  icon={Globe}
                  label="Website"
                  value={business.website_url.replace(/^https?:\/\//, '')}
                  href={business.website_url}
                />
              )}
              {!fullAddr && !business.website_url && (
                <p className="text-sm text-gray-600 italic">No contact details added.</p>
              )}
            </div>

            {/* Business details */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Business Details</h2>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-gray-500 flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Category</span>
                <span className="text-xs font-semibold text-white bg-white/5 px-2.5 py-1 rounded-full">{business.category}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-gray-500 flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Products</span>
                <span className="text-xs font-semibold text-white">{published.length} listed</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-gray-500 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                </span>
              </div>
            </div>

            {/* Promo video (sidebar on desktop) */}
            {business.storefront_video_url && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                {videoEmbed ? (
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe src={videoEmbed} title={`${business.name} promo`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="w-full h-full" />
                  </div>
                ) : (
                  <a href={business.storefront_video_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 text-red-400 ml-0.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Watch our video</p>
                      <p className="text-xs text-gray-500 truncate">{business.storefront_video_url}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 shrink-0" />
                  </a>
                )}
              </div>
            )}
          </aside>

          {/* Right main — gallery + products */}
          <main className="lg:col-span-8 space-y-8 order-1 lg:order-2">

            {/* Gallery */}
            {gallery.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Our Store</h2>
                <div className={`grid gap-3 ${
                  gallery.length === 1 ? 'grid-cols-1' :
                  gallery.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2 sm:grid-cols-3'
                }`}>
                  {gallery.map((url, i) => (
                    <button key={url} onClick={() => setLightbox({ images: gallery, index: i })}
                      className="relative overflow-hidden rounded-2xl bg-white/5 group cursor-zoom-in"
                      style={{ aspectRatio: gallery.length === 3 && i === 0 ? '16/10' : '4/3' }}>
                      <img src={url} alt={`Store photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Digital Products
                  {published.length > 0 && (
                    <span className="text-xs font-normal text-gray-500 normal-case">({published.length})</span>
                  )}
                </h2>
              </div>

              {published.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Package className="w-7 h-7 text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-semibold">No products yet</p>
                  <p className="text-gray-600 text-sm mt-1">Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {published.map(p => <ProductCard key={p.id} p={p} slug={slug} />)}
                </div>
              )}
            </div>

          </main>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/8 bg-white/[0.02] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden">
              {business.logo_url
                ? <img src={business.logo_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>{initials[0]}</div>
              }
            </div>
            <div>
              <p className="text-sm font-bold text-white">{business.name}</p>
              {shortAddr && <p className="text-xs text-gray-500">{shortAddr}</p>}
            </div>
          </div>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Powered by <span className="font-bold text-white">Oga<span className="text-blue-400">OS</span></span>
          </a>
        </div>
      </div>

      {lightbox && (
        <Lightbox images={lightbox.images} initial={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}