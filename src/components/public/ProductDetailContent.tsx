'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Download,
  Package,
  BriefcaseBusiness,
  Star,
  CheckCircle,
  MessageCircle,
  Share2,
  Copy,
  Check,
  MapPin,
  Globe,
  ExternalLink,
  Tag,
  HardDrive,
  Calendar,
  XCircle,
} from 'lucide-react'
import type { PublicBusiness, PublicDigitalProduct, PublicProduct } from '@/types/public'
import { formatBytes, formatCurrency } from '@/types/public'

const TYPE_COLORS: Record<string, string> = {
  download: 'border-blue-500/20 bg-blue-500/15 text-blue-400',
  course: 'border-purple-500/20 bg-purple-500/15 text-purple-400',
  video: 'border-red-500/20 bg-red-500/15 text-red-400',
  service: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-400',
  product: 'border-amber-500/20 bg-amber-500/15 text-amber-400',
}

interface Props {
  product: PublicDigitalProduct | PublicProduct
  itemKind: 'digital' | 'physical' | 'service'
  biz: PublicBusiness
  slug: string
}

function isDigital(p: PublicDigitalProduct | PublicProduct): p is PublicDigitalProduct {
  return 'title' in p
}

export function ProductDetailContent({ product, itemKind, biz, slug }: Props) {
  const [copied, setCopied] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const name = isDigital(product) ? product.title : product.name
  const description = product.description
  const price = product.price
  const currency = isDigital(product) ? product.currency : 'NGN'
  const coverImage = isDigital(product) ? product.cover_image_url : (product as PublicProduct).image_url
  const type = isDigital(product) ? product.type : (product as PublicProduct).type || (itemKind === 'service' ? 'service' : 'product')
  const salesCount = isDigital(product) ? product.sales_count : undefined
  const fileSize = isDigital(product) ? product.file_size : null
  const createdAt = product.created_at
  const inStock = isDigital(product) ? true : (product as PublicProduct).in_stock

  // Parse gallery images
  let galleryImages: string[] = []
  try {
    const raw = isDigital(product) ? product.gallery_image_urls : null
    if (raw) galleryImages = JSON.parse(raw)
  } catch {}

  const allImages = [coverImage, ...galleryImages].filter(Boolean) as string[]

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    const msg = `Hi ${biz.name}! I'm interested in: ${name} (${formatCurrency(price, currency)})\n\nSeen at: ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  const typeColor = TYPE_COLORS[type] ?? 'border-gray-500/20 bg-gray-500/15 text-gray-400'

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* Left: images */}
      <div className="lg:col-span-5">
        <div
          className="relative mb-3 overflow-hidden rounded-2xl border border-white/6 bg-[#0e0e1a]"
          style={{ aspectRatio: '1/1' }}
        >
          {allImages[activeImage] ? (
            <Image
              src={allImages[activeImage]}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {itemKind === 'digital' ? (
                <Download className="h-20 w-20 text-white/8" />
              ) : itemKind === 'service' ? (
                <BriefcaseBusiness className="h-20 w-20 text-white/8" />
              ) : (
                <Package className="h-20 w-20 text-white/8" />
              )}
            </div>
          )}

          {/* Type badge */}
          <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${typeColor}`}>
            {type}
          </span>

          {/* Stock badge */}
          {itemKind !== 'digital' && (
            <span
              className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                inStock
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}
            >
              {inStock ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-all ${
                  activeImage === i
                    ? 'border-brand-blue shadow-[0_0_0_2px_rgba(28,53,234,0.4)]'
                    : 'border-white/6 opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`${name} image ${i + 1}`} fill className="object-cover" unoptimized sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: details */}
      <div className="flex flex-col gap-6 lg:col-span-7">
        {/* Name & price */}
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {(salesCount ?? 0) > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                {salesCount} sold
              </span>
            )}
          </div>

          <h1 className="mb-3 text-2xl font-black leading-tight text-white sm:text-3xl">{name}</h1>

          <p className="text-3xl font-black text-brand-blue">{formatCurrency(price, currency)}</p>
        </div>

        {/* Description */}
        {description && (
          <div className="rounded-2xl border border-white/6 bg-[#0e0e1a] p-5">
            <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Description
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{description}</p>
          </div>
        )}

        {/* Meta details */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fileSize && (
            <div className="flex flex-col gap-1 rounded-xl border border-white/6 bg-[#0e0e1a] p-3">
              <HardDrive className="h-4 w-4 text-brand-blue" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">File Size</span>
              <span className="text-sm font-semibold text-foreground">{formatBytes(fileSize)}</span>
            </div>
          )}

          {createdAt && (
            <div className="flex flex-col gap-1 rounded-xl border border-white/6 bg-[#0e0e1a] p-3">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Listed</span>
              <span className="text-sm font-semibold text-foreground">
                {new Date(createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1 rounded-xl border border-white/6 bg-[#0e0e1a] p-3">
            <Tag className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Category</span>
            <span className="text-sm font-semibold capitalize text-foreground">{type}</span>
          </div>
        </div>

        {/* Business card */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-[#0e0e1a] p-4">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {biz.logo_url ? (
              <Image src={biz.logo_url} alt={biz.name} fill className="object-cover" unoptimized sizes="44px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-black text-white/30">
                {biz.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{biz.name}</p>
            <p className="text-xs text-muted-foreground">{biz.category}</p>
            {(biz.city_town || biz.state) && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {[biz.city_town, biz.state].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <Link
            href={`/public/${slug}`}
            className="shrink-0 rounded-xl border border-brand-blue/40 bg-brand-blue/10 px-3 py-1.5 text-xs font-bold text-brand-blue transition-all hover:bg-brand-blue hover:text-white"
          >
            View Store
          </Link>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleWhatsApp}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#20bd5a]"
          >
            <MessageCircle className="h-4 w-4" />
            Enquire via WhatsApp
          </button>

          {biz.website_url && (
            <a
              href={biz.website_url.startsWith('http') ? biz.website_url : `https://${biz.website_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-dash-border bg-dash-surface px-5 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-dash-hover"
            >
              <Globe className="h-4 w-4" />
              Visit Website
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          )}
        </div>

        {/* Share row */}
        <div className="flex items-center gap-2 border-t border-white/6 pt-4">
          <span className="text-xs text-muted-foreground">Share:</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-dash-border bg-dash-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-dash-hover hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out ${name}: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-[#25D366]/20 bg-[#25D366]/10 px-3 py-1.5 text-xs font-semibold text-[#25D366] transition-all hover:bg-[#25D366]/20"
          >
            <Share2 className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}