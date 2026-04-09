'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  ShoppingBag,
  Building2,
  Eye,
  Search,
  Shield,
  Truck,
  RefreshCw,
  MapPin,
  Globe,
  Phone,
  ExternalLink,
  MessageCircle,
  QrCode,
  Copy,
  Play,
  Calendar,
  ShoppingCart,
  Wifi,
} from 'lucide-react'

import type {
  PublicBusiness,
  DigitalProduct,
  PhysicalProduct,
  CartItem,
} from '@/components/public/public-profile-shared'
import {
  fmt,
  fullAddress,
  mapsEmbed,
  mapsLink,
  waLink,
} from '@/components/public/public-profile-shared'

import { ProductCard } from './ProductCard'
import { CartDrawer } from './CartDrawer'
import { ShareModal } from './ShareModal'
import { Lightbox } from './Lightbox'

interface NormalizedProduct {
  isDigital: boolean
  id: string
  name: string
  price: number
  image: string | null
  type: string
  description?: string | null
  salesCount?: number
  fileSize?: number | null
  slug?: string
}

function normalizeProducts(
  digital: DigitalProduct[],
  physical: PhysicalProduct[]
): NormalizedProduct[] {
  return [
    ...digital.filter((p) => p.is_published).map((p) => ({
      isDigital: true,
      id: p.id,
      name: p.title,
      price: p.price,
      image: p.cover_image_url,
      type: p.type,
      description: p.description,
      salesCount: p.sales_count,
      fileSize: p.file_size,
      slug: p.slug,
    })),
    ...physical.filter((p) => p.is_active).map((p) => ({
      isDigital: false,
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image_url,
      type: p.type ?? 'product',
      description: p.description,
    })),
  ]
}

interface Props {
  biz: PublicBusiness
  digital: DigitalProduct[]
  physical: PhysicalProduct[]
  keywords: string[]
  gallery: string[]
  accent: string
}

export function ProfileContent({
  biz,
  digital,
  physical,
  keywords,
  gallery,
}: Props) {
  const [activeTab, setActiveTab] = useState<'shop' | 'about' | 'gallery'>(
    'shop'
  )
  const [productFilter, setProductFilter] = useState<
    'all' | 'digital' | 'physical'
  >('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [lightbox, setLightbox] = useState<{
    images: string[]
    idx: number
  } | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  const allProducts = normalizeProducts(digital, physical)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const fullAddr = fullAddress(biz)

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('ogaos:cart-count', { detail: cartCount })
    )
  }, [cartCount])

  useEffect(() => {
    const openShare = () => setShowShare(true)
    const openCart = () => setShowCart(true)

    window.addEventListener('ogaos:open-share', openShare)
    window.addEventListener('ogaos:open-cart', openCart)

    return () => {
      window.removeEventListener('ogaos:open-share', openShare)
      window.removeEventListener('ogaos:open-cart', openCart)
    }
  }, [])

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

  const updateCart = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    )
  }, [])

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      return existing
        ? prev.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          )
        : [...prev, item]
    })
  }, [])

  const filteredProducts = allProducts.filter((p) => {
    const matchesFilter =
      productFilter === 'all' ||
      (productFilter === 'digital' && p.isDigital) ||
      (productFilter === 'physical' && !p.isDigital)

    const matchesSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <>
      <div className="mb-6 flex gap-1 rounded-2xl border border-dash-border bg-dash-raised p-1">
        {[
          {
            key: 'shop' as const,
            label: 'Shop',
            icon: ShoppingBag,
            count: allProducts.length,
          },
          { key: 'about' as const, label: 'About', icon: Building2 },
          {
            key: 'gallery' as const,
            label: 'Gallery',
            icon: Eye,
            count: gallery.length,
          },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
              activeTab === key
                ? 'bg-brand-blue text-white shadow-lg'
                : 'text-muted-foreground hover:bg-dash-hover hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  activeTab === key ? 'bg-white/20' : 'bg-white/8'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'shop' && (
        <div>
          {allProducts.length > 0 && (
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-xl border border-dash-border bg-dash-surface py-2.5 pl-10 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand-blue/50 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                {(['all', 'digital', 'physical'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setProductFilter(f)}
                    className={`rounded-xl border px-4 py-2.5 text-xs font-bold capitalize transition-all ${
                      productFilter === f
                        ? 'border-brand-blue bg-brand-blue text-white'
                        : 'border-dash-border bg-dash-surface text-muted-foreground hover:border-dash-border hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allProducts.length > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-2">
              {[
                {
                  icon: Shield,
                  text: 'Secure Checkout',
                  color: 'text-brand-blue',
                },
                {
                  icon: Truck,
                  text: 'Fast Delivery',
                  color: 'text-emerald-400',
                },
                {
                  icon: RefreshCw,
                  text: 'Easy Returns',
                  color: 'text-amber-400',
                },
              ].map(({ icon: Icon, text, color }) => (
                <div
                  key={text}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dash-border bg-dash-surface py-2.5"
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="hidden text-[11px] font-semibold text-muted-foreground sm:inline">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  {...p}
                  bizSlug={biz.slug}
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
                  {search ? 'No products found' : 'No products yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {search
                    ? 'Try a different search term'
                    : "This business hasn't listed any products yet."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="grid grid-cols-1 gap-6 pb-20 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            {biz.description && (
              <div className="rounded-2xl border border-dash-border bg-dash-surface p-6">
                <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  About
                </h2>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {biz.description}
                </p>
              </div>
            )}

            {biz.storefront_video_url &&
              (() => {
                const m = biz.storefront_video_url.match(
                  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/
                )
                const embedId = m?.[1]

                return (
                  <div>
                    <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                      Featured Video
                    </h2>

                    {embedId ? (
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
                    ) : (
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
                          <p className="font-semibold text-foreground">
                            Watch our video
                          </p>
                          <p className="max-w-xs truncate text-xs text-muted-foreground">
                            {biz.storefront_video_url}
                          </p>
                        </div>
                        <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                )
              })()}

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
            {fullAddr && (
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

              {fullAddr && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-brand-blue/20 bg-brand-blue/10">
                    <MapPin className="h-3.5 w-3.5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Address
                    </p>
                    <p className="text-sm leading-snug text-foreground/80">
                      {fullAddr}
                    </p>
                  </div>
                </div>
              )}

              {biz.website_url && (
                <a
                  href={
                    biz.website_url.startsWith('http')
                      ? biz.website_url
                      : `https://${biz.website_url}`
                  }
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

              {biz.phone_number && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
                    <Phone className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Phone
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${biz.phone_number}`}
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {biz.phone_number}
                      </a>
                      <a
                        href={waLink(biz.phone_number, biz.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-[#25D366]/30 bg-[#25D366]/15 px-2 py-0.5 text-[10px] font-bold text-[#25D366] transition-colors hover:bg-[#25D366]/25"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {!fullAddr && !biz.website_url && !biz.phone_number && (
                <p className="text-sm italic text-muted-foreground">
                  No contact details available
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-dash-border bg-dash-surface p-5">
              <h2 className="mb-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Business Details
              </h2>
              <div className="divide-y divide-dash-border">
                {[
                  { icon: Building2, label: 'Category', value: biz.category },
                  { icon: MapPin, label: 'State', value: biz.state ?? '—' },
                  { icon: Globe, label: 'Country', value: biz.country ?? 'Nigeria' },
                  {
                    icon: Calendar,
                    label: 'Joined',
                    value: biz.created_at
                      ? new Date(biz.created_at).toLocaleDateString('en-NG', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—',
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {value}
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wifi className="h-3.5 w-3.5" /> Status
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
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
        <div className="pb-20">
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
                  key={url}
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
              <p className="text-sm text-muted-foreground">
                No gallery images yet
              </p>
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
              View Cart · {fmt(cart.reduce((s, i) => s + i.price * i.qty, 0))}
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