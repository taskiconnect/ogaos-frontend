'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ShoppingBag,
  Building2,
  Eye,
  Search,
  MapPin,
  Globe,
  ExternalLink,
  MessageCircle,
  QrCode,
  Copy,
  Play,
  ShoppingCart,
  Download,
  Package,
  BriefcaseBusiness,
} from 'lucide-react'

import type {
  PublicBusiness,
  PublicDigitalProduct,
  PublicProduct,
  CartItem,
} from '@/types/public'
import {
  formatCurrency,
  fullAddress,
  mapsEmbed,
  mapsLink,
  parseGallery,
} from '@/types/public'

import { ProductCard } from './ProductCard'
import { CartDrawer } from './CartDrawer'
import { ShareModal } from './ShareModal'
import { Lightbox } from './Lightbox'

type OfferingKind = 'all' | 'digital' | 'products' | 'services'

interface NormalizedOffering {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  type: string
  itemKind: 'digital' | 'physical' | 'service'
  currency?: string
  salesCount?: number
  fileSize?: number | null
  inStock?: boolean
}

interface Props {
  biz: PublicBusiness
  digital: PublicDigitalProduct[]
  physical: PublicProduct[]
  services: PublicProduct[]
  keywords: string[]
  gallery: string[]
  accent: string
}

export function ProfileContent({
  biz,
  digital,
  physical,
  services,
  keywords,
  gallery,
}: Props) {
  const [activeTab, setActiveTab] = useState<'shop' | 'about' | 'gallery'>('shop')
  const [filter, setFilter] = useState<OfferingKind>('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [lightbox, setLightbox] = useState<{ images: string[]; idx: number } | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  const offerings = useMemo<NormalizedOffering[]>(
    () => [
      ...digital.map((item) => ({
        id: item.id,
        name: item.title,
        description: item.description,
        price: item.price,
        image: item.cover_image_url,
        type: item.type,
        itemKind: 'digital' as const,
        currency: item.currency,
        salesCount: item.sales_count,
        fileSize: item.file_size,
        inStock: true,
      })),
      ...physical.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image_url,
        type: item.type || 'product',
        itemKind: 'physical' as const,
        currency: 'NGN',
        inStock: item.in_stock,
      })),
      ...services.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image_url,
        type: item.type || 'service',
        itemKind: 'service' as const,
        currency: 'NGN',
        inStock: true,
      })),
    ],
    [digital, physical, services]
  )

  useEffect(() => {
    if (!mapRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapLoaded(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(mapRef.current)
    return () => observer.disconnect()
  }, [activeTab])

  const filteredOfferings = offerings.filter((item) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'digital' && item.itemKind === 'digital') ||
      (filter === 'products' && item.itemKind === 'physical') ||
      (filter === 'services' && item.itemKind === 'service')

    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description ?? '').toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const address = fullAddress(biz)

  function addToCart(item: CartItem) {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id)
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        )
      }
      return [...prev, item]
    })
  }

  function updateCart(id: string, qty: number) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, qty } : item))
    )
  }

  return (
    <>
      <div className="mb-6 flex gap-1 rounded-2xl border border-dash-border bg-dash-raised p-1">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
            activeTab === 'shop'
              ? 'bg-brand-blue text-white shadow-lg'
              : 'text-muted-foreground hover:bg-dash-hover hover:text-foreground'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Shop
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
            activeTab === 'about'
              ? 'bg-brand-blue text-white shadow-lg'
              : 'text-muted-foreground hover:bg-dash-hover hover:text-foreground'
          }`}
        >
          <Building2 className="h-4 w-4" />
          About
        </button>

        {gallery.length > 0 && (
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
              activeTab === 'gallery'
                ? 'bg-brand-blue text-white shadow-lg'
                : 'text-muted-foreground hover:bg-dash-hover hover:text-foreground'
            }`}
          >
            <Eye className="h-4 w-4" />
            Gallery
          </button>
        )}
      </div>

      {activeTab === 'shop' && (
        <div className="pb-20">
          {offerings.length > 0 && (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search offerings…"
                    className="w-full rounded-xl border border-dash-border bg-dash-surface py-2.5 pl-10 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand-blue/50 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'digital', label: 'Digital' },
                    { key: 'products', label: 'Products' },
                    { key: 'services', label: 'Services' },
                  ]
                    .filter((item) => {
                      if (item.key === 'digital') return digital.length > 0
                      if (item.key === 'products') return physical.length > 0
                      if (item.key === 'services') return services.length > 0
                      return true
                    })
                    .map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setFilter(item.key as OfferingKind)}
                        className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                          filter === item.key
                            ? 'border-brand-blue bg-brand-blue text-white'
                            : 'border-dash-border bg-dash-surface text-muted-foreground hover:border-dash-border hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-dash-border bg-dash-surface py-2.5">
                  <Download className="h-3.5 w-3.5 text-brand-blue" />
                  <span className="hidden text-[11px] font-semibold text-muted-foreground sm:inline">
                    Digital Access
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-dash-border bg-dash-surface py-2.5">
                  <Package className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden text-[11px] font-semibold text-muted-foreground sm:inline">
                    Products
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-dash-border bg-dash-surface py-2.5">
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden text-[11px] font-semibold text-muted-foreground sm:inline">
                    Services
                  </span>
                </div>
              </div>
            </>
          )}

          {filteredOfferings.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredOfferings.map((item) => (
                <ProductCard
                  key={`${item.itemKind}-${item.id}`}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  currency={item.currency}
                  image={item.image}
                  type={item.type}
                  description={item.description}
                  salesCount={item.salesCount}
                  fileSize={item.fileSize}
                  itemKind={item.itemKind}
                  inStock={item.inStock}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dash-border bg-dash-surface">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="mb-1 font-bold text-foreground">
                  {search ? 'No offerings found' : 'No offerings yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {search
                    ? 'Try a different search term.'
                    : "This business hasn't listed any public offerings yet."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div id="about" className="grid grid-cols-1 gap-6 pb-20 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            {biz.description && (
              <div className="rounded-2xl border border-dash-border bg-dash-surface p-6">
                <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  About
                </h2>
                <p className="text-sm leading-relaxed text-foreground/80">{biz.description}</p>
              </div>
            )}

            {biz.storefront_video_url && (
              <div>
                <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Featured Video
                </h2>

                {(() => {
                  const match = biz.storefront_video_url.match(
                    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/
                  )
                  const embedId = match?.[1]

                  if (embedId) {
                    return (
                      <div
                        className="relative overflow-hidden rounded-2xl border border-dash-border bg-black"
                        style={{ aspectRatio: '16/9' }}
                      >
                        <iframe
                          src={`https://www.youtube.com/embed/${embedId}`}
                          title={`${biz.name} video`}
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          className="h-full w-full"
                        />
                      </div>
                    )
                  }

                  return (
                    <a
                      href={biz.storefront_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-2xl border border-dash-border bg-dash-surface p-4 transition-colors hover:bg-dash-hover"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/20">
                        <Play className="ml-0.5 h-6 w-6 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Watch our video</p>
                        <p className="max-w-xs truncate text-xs text-muted-foreground">
                          {biz.storefront_video_url}
                        </p>
                      </div>
                      <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  )
                })()}
              </div>
            )}

            {keywords.length > 0 && (
              <div className="rounded-2xl border border-dash-border bg-dash-surface p-5">
                <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="cursor-default rounded-full border border-dash-border bg-dash-hover px-3 py-1.5 text-xs capitalize text-foreground/80 transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:col-span-5">
            {address && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </h2>
                <div
                  ref={mapRef}
                  className="overflow-hidden rounded-2xl border border-dash-border bg-dash-surface"
                  style={{ height: '260px' }}
                >
                  {mapLoaded ? (
                    <iframe
                      src={mapsEmbed(biz)}
                      width="100%"
                      height="260"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${biz.name}`}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setMapLoaded(true)}
                    >
                      <MapPin className="h-8 w-8" />
                      <p className="text-sm">Click to load map</p>
                    </div>
                  )}
                </div>
                <a
                  href={mapsLink(biz)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dash-border py-2 text-xs text-muted-foreground transition-all hover:bg-dash-hover hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                </a>
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-dash-border bg-dash-surface p-5">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Contact & Info
              </h2>

              {address && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-brand-blue/20 bg-brand-blue/10">
                    <MapPin className="h-3.5 w-3.5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Address
                    </p>
                    <p className="text-sm leading-snug text-foreground/80">{address}</p>
                  </div>
                </div>
              )}

              {biz.website_url && (
                <a
                  href={biz.website_url.startsWith('http') ? biz.website_url : `https://${biz.website_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Website
                    </p>
                    <p className="truncate text-sm text-brand-blue transition-colors group-hover:text-brand-blue/80">
                      {biz.website_url.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                </a>
              )}

              {!address && !biz.website_url && (
                <p className="text-sm italic text-muted-foreground">No contact details available</p>
              )}
            </div>

            <div className="rounded-2xl border border-dash-border bg-dash-surface p-5">
              <h2 className="mb-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Share this business
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowShare(true)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-dash-border bg-dash-hover p-3 text-muted-foreground transition-all hover:bg-dash-hover/80 hover:text-foreground"
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-[10px] font-bold">QR Code</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Check out ${biz.name}: ${typeof window !== 'undefined' ? window.location.href : ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[#25D366]/20 bg-[#25D366]/10 p-3 text-[#25D366] transition-all hover:bg-[#25D366]/20"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </a>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      typeof window !== 'undefined' ? window.location.href : ''
                    )
                  }
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-dash-border bg-dash-hover p-3 text-muted-foreground transition-all hover:bg-dash-hover/80 hover:text-foreground"
                >
                  <Copy className="h-5 w-5" />
                  <span className="text-[10px] font-bold">Copy Link</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div id="gallery" className="pb-20">
          {gallery.length > 0 ? (
            <div
              className={`grid gap-3 ${
                gallery.length === 1
                  ? 'grid-cols-1 max-w-xl'
                  : gallery.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3'
              }`}
            >
              {gallery.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  onClick={() => setLightbox({ images: gallery, idx: i })}
                  className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-dash-border bg-dash-surface"
                  style={{ aspectRatio: '4/3' }}
                >
                  <Image
                    src={url}
                    alt={`${biz.name} photo ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dash-border bg-dash-surface">
                <Eye className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No gallery images yet</p>
            </div>
          )}
        </div>
      )}

      {cartCount > 0 && !showCart && (
        <>
          <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 sm:hidden">
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-2.5 rounded-2xl bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-brand-blue/40 transition-all hover:bg-brand-blue/90"
              style={{ animation: 'bounceIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}
            >
              <ShoppingCart className="h-4 w-4" />
              View Cart · {formatCurrency(cartTotal)}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-blue">
                {cartCount}
              </span>
            </button>
          </div>

          <style>{`
            @keyframes bounceIn {
              0%   { transform: translateX(-50%) scale(0.8); opacity: 0; }
              60%  { transform: translateX(-50%) scale(1.05); }
              100% { transform: translateX(-50%) scale(1); opacity: 1; }
            }
          `}</style>
        </>
      )}

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          idx={lightbox.idx}
          onClose={() => setLightbox(null)}
        />
      )}

      {showShare && <ShareModal biz={biz} onClose={() => setShowShare(false)} />}

      {showCart && (
        <CartDrawer
          items={cart}
          onUpdate={updateCart}
          onClose={() => setShowCart(false)}
          biz={biz}
        />
      )}
    </>
  )
}