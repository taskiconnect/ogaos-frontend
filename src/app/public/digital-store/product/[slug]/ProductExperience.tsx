'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Download,
  Store,
  CheckCircle2,
  Globe,
  Clock3,
  Lock,
  ShoppingBag,
  FileText,
  Video,
  PackageCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  X,
  ImageIcon,
} from 'lucide-react'

import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { cn } from '@/lib/utils'
import type { PublicDigitalProductResponse } from '@/types/public'
import { formatBytes, formatCurrency, parseGallery } from '@/types/public'
import CheckoutCard from './CheckoutCard'

type Props = {
  product: PublicDigitalProductResponse
}

function getTypeIcon(type: string) {
  const value = type.toLowerCase()

  if (value.includes('course')) return Video
  if (value.includes('ebook')) return FileText
  if (value.includes('template')) return PackageCheck

  return ShoppingBag
}

function getFulfillmentLabel(mode: string) {
  switch (mode) {
    case 'file_download':
      return 'Instant file delivery'
    case 'course_access':
      return 'Instant course access'
    case 'external_link':
      return 'External access link'
    case 'manual_delivery':
      return 'Manual delivery'
    default:
      return mode.replace(/_/g, ' ')
  }
}

function getFulfillmentDescription(mode: string) {
  switch (mode) {
    case 'file_download':
      return 'You get immediate access to download the file right after your payment is confirmed.'
    case 'course_access':
      return "You'll be redirected to the course platform and granted access instantly after payment."
    case 'external_link':
      return "You'll receive a secure link to access the product content after successful payment."
    case 'manual_delivery':
      return 'The seller will personally deliver this product to you after your payment is confirmed.'
    default:
      return 'Digital delivery after successful payment.'
  }
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const u = new URL(url)

    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    return null
  } catch {
    return null
  }
}

function PromoVideoPlayer({ src, poster }: { src: string; poster?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [showControls, setShowControls] = useState(false)

  function fmt(s: number) {
    const m = Math.floor(s / 60)
    return `${m}:${Math.floor(s % 60)
      .toString()
      .padStart(2, '0')}`
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return

    if (v.paused) {
      v.play()
      setPlaying(true)
      setStarted(true)
      setEnded(false)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return

    v.muted = !v.muted
    setMuted(v.muted)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current
    if (!v || !v.duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
  }

  function handleFullscreen() {
    videoRef.current?.requestFullscreen?.()
  }

  function handleReplay() {
    const v = videoRef.current
    if (!v) return

    v.currentTime = 0
    v.play()
    setPlaying(true)
    setEnded(false)
  }

  return (
    <div
      className="group relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="block aspect-video w-full object-contain"
        poster={poster ?? undefined}
        playsInline
        preload="metadata"
        onTimeUpdate={() => {
          const v = videoRef.current
          if (!v || !v.duration) return

          setCurrentTime(v.currentTime)
          setProgress((v.currentTime / v.duration) * 100 || 0)
        }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onEnded={() => {
          setPlaying(false)
          setEnded(true)
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55">
          {poster && (
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
              aria-hidden
            />
          )}

          <div className="relative z-10 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-primary hover:bg-primary"
              style={{ width: 68, height: 68 }}
            >
              <Play className="h-7 w-7 translate-x-0.5 text-white" />
            </button>

            <span className="text-sm font-semibold tracking-wide text-white/60">
              Watch promo video
            </span>
          </div>
        </div>
      )}

      {ended && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
          <button
            type="button"
            onClick={handleReplay}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition hover:border-primary hover:bg-primary"
          >
            <RotateCcw className="h-7 w-7 text-white" />
          </button>

          <p className="mt-3 text-sm font-semibold text-white/50">Replay</p>
        </div>
      )}

      {started && !ended && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-3 pt-10 transition-opacity duration-200',
            showControls || !playing ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div
            className="mb-3 h-1 w-full cursor-pointer rounded-full bg-white/20 transition-[height] hover:h-1.5"
            onClick={handleSeek}
          >
            <div className="relative h-full rounded-full bg-primary" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-primary"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>

              <span className="tabular-nums text-[11px] font-medium text-white/50">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleFullscreen}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20"
            >
              <Maximize className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductPromoMedia({
  url,
  title,
  poster,
}: {
  url: string
  title: string
  poster?: string | null
}) {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(url)

  if (youtubeEmbedUrl) {
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          src={youtubeEmbedUrl}
          title={`${title} promo video`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return <PromoVideoPlayer src={url} poster={poster} />
}

function GalleryViewer({
  images,
  title,
  onLightbox,
}: {
  images: string[]
  title: string
  onLightbox: (src: string) => void
}) {
  const [index, setIndex] = useState(0)
  const current = images[index]

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  function next() {
    setIndex((i) => (i + 1) % images.length)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
            <ImageIcon className="h-3 w-3 text-primary" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            Gallery
          </p>
        </div>

        {images.length > 1 && (
          <span className="tabular-nums text-[10px] font-semibold text-gray-600">
            {index + 1} / {images.length}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-dash-subtle" style={{ aspectRatio: '4/3' }}>
        {current ? (
          <img
            src={current}
            alt={`${title} image ${index + 1}`}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-white/10" />
          </div>
        )}

        <button
          type="button"
          onClick={() => current && onLightbox(current)}
          className="group absolute inset-0 flex items-center justify-center bg-transparent transition-colors hover:bg-black/20"
          aria-label="View full size"
        >
          <span className="rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
            View full size
          </span>
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:bg-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:bg-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'relative shrink-0 overflow-hidden rounded-lg border transition-all duration-150',
                i === index
                  ? 'border-primary opacity-100 ring-2 ring-primary/30'
                  : 'border-white/10 opacity-50 hover:border-white/20 hover:opacity-80'
              )}
              style={{ width: 72, height: 48 }}
            >
              <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {images.length > 1 && images.length <= 10 && (
        <div className="flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'h-1 rounded-full transition-all duration-200',
                i === index ? 'w-6 bg-primary' : 'w-1.5 bg-white/20 hover:bg-white/40'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductExperience({ product }: Props) {
  const gallery = useMemo(() => parseGallery(product.gallery_image_urls), [product.gallery_image_urls])

  const galleryImages = useMemo(() => {
    const seen = new Set<string>()
    const items: string[] = []

    for (const img of gallery) {
      if (img && !seen.has(img)) {
        seen.add(img)
        items.push(img)
      }
    }

    return items
  }, [gallery])

  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  const TypeIcon = getTypeIcon(product.type)
  const sellerName = product.business.name
  const sellerSlug = product.business.slug
  const sellerLogo = product.business.logo_url
  const hasVideo = Boolean(product.promo_video_url)
  const hasGallery = galleryImages.length > 0

  return (
    <main className="min-h-screen bg-background text-white">
      <LandingHeader />

      <section className="border-b border-white/8 bg-dash-subtle">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <Link
            href={`/public/digital-store/${sellerSlug}`}
            className="mb-8 inline-flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to store
          </Link>

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
            <div className="mx-auto shrink-0 lg:mx-0" style={{ width: 260 }}>
              <div
                className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-dash-surface shadow-2xl shadow-black/60"
                style={{ aspectRatio: '3/4' }}
              >
                {product.cover_image_url ? (
                  <img
                    src={product.cover_image_url}
                    alt={product.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="h-14 w-14 text-white/10" />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent px-4 pb-4 pt-12">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary backdrop-blur-md">
                    <TypeIcon className="h-3 w-3" />
                    {product.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-6 lg:pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {getFulfillmentLabel(product.fulfillment_mode)}
                </span>

                {product.sales_count > 0 && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    {product.sales_count} sold
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tight text-white">
                  {formatCurrency(product.price / 100, product.currency)}
                </span>
                <span className="text-sm font-medium text-gray-500">one-time</span>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-gray-400">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: 'Delivery', value: getFulfillmentLabel(product.fulfillment_mode) },
                  {
                    label: 'Access',
                    value: product.access_duration_hours ? `${product.access_duration_hours}h` : 'Lifetime',
                  },
                  ...(product.file_size ? [{ label: 'File size', value: formatBytes(product.file_size) }] : []),
                  { label: 'Account needed', value: product.requires_account ? 'Yes' : 'No' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/8 bg-dash-surface px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                {sellerLogo ? (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10">
                    <img src={sellerLogo} alt={sellerName} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Sold by
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-white">{sellerName}</p>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      OgaOS Store
                    </span>
                  </div>
                </div>

                <Link
                  href={`/public/digital-store/${sellerSlug}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  <Store className="h-3.5 w-3.5" />
                  View Store
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-5">
            {(hasVideo || hasGallery) && (
              <div className="overflow-hidden rounded-2xl border border-white/8 bg-dash-surface">
                <div className="flex items-center gap-4 border-b border-white/6 px-5 py-3.5">
                  {hasVideo && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
                        <Video className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Promo Video
                      </p>
                    </div>
                  )}

                  {hasVideo && hasGallery && <div className="h-3 w-px bg-white/10" />}

                  {hasGallery && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
                        <ImageIcon className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Gallery · {galleryImages.length}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex min-h-0 flex-col lg:flex-row lg:items-stretch">
                  {hasVideo && (
                    <div
                      className={cn(
                        'flex flex-col bg-black',
                        hasGallery ? 'lg:w-[60%]' : 'w-full'
                      )}
                    >
                      <ProductPromoMedia
                        url={product.promo_video_url!}
                        title={product.title}
                        poster={product.cover_image_url}
                      />
                    </div>
                  )}

                  {hasVideo && hasGallery && <div className="hidden w-px shrink-0 bg-white/6 lg:block" />}

                  {hasGallery && (
                    <div
                      className={cn(
                        'flex flex-col p-4',
                        hasVideo ? 'lg:w-[40%]' : 'w-full'
                      )}
                    >
                      <GalleryViewer
                        images={galleryImages}
                        title={product.title}
                        onLightbox={setLightboxImg}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-white/8 bg-dash-surface">
              <div className="border-b border-white/6 px-5 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Delivery & access
                </p>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start gap-4 rounded-xl border border-primary/15 bg-primary/[0.06] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                    <Download className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      {getFulfillmentLabel(product.fulfillment_mode)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      {getFulfillmentDescription(product.fulfillment_mode)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[
                    {
                      icon: Clock3,
                      label: 'Access duration',
                      value: product.access_duration_hours ? `${product.access_duration_hours}h` : 'Lifetime',
                    },
                    {
                      icon: Lock,
                      label: 'Account required',
                      value: product.requires_account ? 'Yes' : 'No',
                    },
                    ...(product.file_size
                      ? [{ icon: Download, label: 'File size', value: formatBytes(product.file_size) }]
                      : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                      <div className="mb-1.5 flex items-center gap-1.5 text-gray-500">
                        <Icon className="h-3.5 w-3.5" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                          {label}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                {product.delivery_note && (
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.07] p-4">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                      Note from seller
                    </p>
                    <p className="text-sm leading-6 text-yellow-200/80">
                      {product.delivery_note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/8 bg-dash-surface">
              <div className="border-b border-white/6 px-5 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Why buy on OgaOS
                </p>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-3">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Secure checkout',
                    body: 'Paystack-powered payments with end-to-end protection on every purchase.',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Instant delivery',
                    body: 'File, course, link or manual — all digital delivery types supported.',
                  },
                  {
                    icon: Globe,
                    title: 'Verified sellers',
                    body: 'Every store is tied to a registered and verified business on OgaOS.',
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-[88px]">
            <CheckoutCard product={product} />
          </div>
        </div>
      </section>

      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setLightboxImg(null)}
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImg}
              alt="Full size preview"
              className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}