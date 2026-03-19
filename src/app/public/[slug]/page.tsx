'use client'

// src/app/public/[slug]/page.tsx

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Globe, ShoppingBag, Star, Download, Package,
  Zap, ExternalLink, ChevronRight, AlertCircle, Play, X,
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
  state: string | null
  country: string | null
  is_verified: boolean
  gallery_image_urls: string        // JSON array string
  storefront_video_url: string | null
}

interface PublicProduct {
  id: string
  title: string
  slug: string
  description: string
  type: string
  price: number                     // kobo
  currency: string
  cover_image_url: string | null
  file_size: number | null
  sales_count: number
  is_published: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function fmt(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function fmtSize(bytes: number | null) {
  if (!bytes) return null
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

function buildAddress(b: PublicBusiness) {
  return [b.city_town, b.state, b.country].filter(Boolean).join(', ')
}

function parseGallery(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

function youtubeEmbed(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-44 bg-linear-to-r from-blue-200 to-blue-300" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-end gap-4 -mt-14 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gray-200 border-4 border-white shadow" />
          <div className="pb-1 space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded-lg" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-72 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}

// ─── Gallery lightbox ─────────────────────────────────────────────────────────

interface LightboxProps { images: string[]; initial: number; onClose: () => void }

function GalleryLightbox({ images, initial, onClose }: LightboxProps) {
  const [active, setActive] = useState(initial)
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <img src={images[active]} alt="" className="w-full max-h-[80vh] object-contain rounded-xl" />
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === active ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ p, slug }: { p: PublicProduct; slug: string }) {
  return (
    <Link
      href={`/public/${slug}/product/${p.slug}`}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
    >
      <div className="relative h-48 bg-linear-to-br from-slate-100 to-slate-200 overflow-hidden shrink-0">
        {p.cover_image_url ? (
          <img
            src={p.cover_image_url}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-14 h-14 text-slate-300" />
          </div>
        )}
        <span className="absolute top-3 left-3 text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-slate-600 shadow-sm">
          {p.type}
        </span>
        {p.sales_count > 0 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3 fill-current" /> {p.sales_count} sold
          </span>
        )}
      </div>
      <div className="flex-1 p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-gray-900 text-base line-clamp-2 group-hover:text-blue-700 transition-colors">
          {p.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{p.description}</p>
        {p.file_size && (
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <Download className="w-3 h-3" /> {fmtSize(p.file_size)}
          </p>
        )}
      </div>
      <div className="px-4 pb-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">{fmt(p.price)}</span>
        <span
          className="flex items-center gap-1 text-sm font-semibold text-white px-4 py-2 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
        >
          Buy now <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StorefrontPage() {
  const params  = useParams()
  const slug    = params?.slug as string

  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

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
        setProducts((prodJson?.data ?? prodJson) as PublicProduct[])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Skeleton />

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Store not found</h1>
        <p className="text-gray-500">This storefront doesn&apos;t exist or has been taken down.</p>
        <Link href="/" className="text-blue-600 font-semibold hover:underline mt-2">
          Go to OgaOS homepage
        </Link>
      </div>
    )
  }

  const addr       = buildAddress(business)
  const initials   = business.name[0]?.toUpperCase() ?? 'B'
  const gallery    = parseGallery(business.gallery_image_urls)
  const published  = products.filter(p => p.is_published)
  const videoEmbed = youtubeEmbed(business.storefront_video_url)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero banner */}
      <div
        className="h-44 w-full"
        style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Profile header */}
        <div className="-mt-14 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white shrink-0">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
              >
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 pb-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{business.name}</h1>
              {business.is_verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                  <Zap className="w-3 h-3 fill-current" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{business.category}</p>
          </div>
          <a
            href="/"
            className="sm:pb-1 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            Powered by <span className="font-bold text-gray-700">Oga<span className="text-blue-600">OS</span></span>
          </a>
        </div>

        {/* About card */}
        {(business.description || addr || business.website_url) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 space-y-3">
            {business.description && (
              <p className="text-gray-700 text-sm leading-relaxed">{business.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {addr && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" /> {addr}
                </span>
              )}
              {business.website_url && (
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  {business.website_url.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Gallery + video */}
        {(gallery.length > 0 || business.storefront_video_url) && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-900 mb-4">Our Store</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gallery.length > 0 && (
                <div className={`grid gap-2 ${gallery.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {gallery.map((url: string, i: number) => (
                    <button
                      key={url}
                      onClick={() => setLightbox({ images: gallery, index: i })}
                      className={`relative overflow-hidden rounded-xl bg-gray-200 group cursor-zoom-in ${
                        gallery.length === 3 && i === 0 ? 'row-span-2' : ''
                      }`}
                      style={{ aspectRatio: gallery.length === 3 && i === 0 ? '1' : '4/3' }}
                    >
                      <img
                        src={url}
                        alt={`Store photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              )}
              {business.storefront_video_url && (
                <div className={gallery.length === 0 ? 'md:col-span-2' : ''}>
                  {videoEmbed ? (
                    <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <iframe
                        src={videoEmbed}
                        title={`${business.name} promo`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <a
                      href={business.storefront_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-5 py-4 hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Watch our video</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{business.storefront_video_url}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 ml-auto shrink-0" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="mb-16">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Digital Products
            {published.length > 0 && (
              <span className="text-sm font-normal text-gray-400">({published.length})</span>
            )}
          </h2>
          {published.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
              <Package className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No products available yet</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {published.map(p => <ProductCard key={p.id} p={p} slug={slug} />)}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        {business.name} &mdash; powered by{' '}
        <a href="/" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
          Oga<span className="text-blue-600">OS</span>
        </a>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <GalleryLightbox
          images={lightbox.images}
          initial={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

    </div>
  )
}
