'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import {
  updateDigitalProduct,
  addDigitalProductGalleryImage,
  removeDigitalProductGalleryImage,
  uploadDigitalCover,
  uploadDigitalFile,
} from '@/lib/api/digital'
import {
  X,
  Loader2,
  ImagePlus,
  Trash2,
  Link,
  Info,
  QrCode,
  Download,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Camera,
  FileUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  DigitalProduct,
  UpdateDigitalProductRequest,
  DigitalFulfillmentMode,
} from '@/lib/api/types'
import ProductQRCodePanel from '@/components/digital/ProductQRCodePanel'

interface Props {
  product: DigitalProduct
  onClose: () => void
  onSuccess: () => void
  businessName?: string
  businessSlug?: string
  businessLogoURL?: string
  frontendURL?: string
}

function parseGallery(raw: string): string[] {
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const ALLOWED_VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'vimeo.com', 'drive.google.com']

function isValidVideoUrl(url: string): boolean {
  if (!url.trim()) return true
  try {
    const hostname = new URL(url).hostname
    return ALLOWED_VIDEO_HOSTS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

function needsRedirectURL(mode: DigitalFulfillmentMode) {
  return mode === 'course_access' || mode === 'external_link'
}

const FULFILLMENT_MODES: {
  value: DigitalFulfillmentMode
  label: string
  hint: string
}[] = [
  {
    value: 'file_download',
    label: 'File Download',
    hint: 'Buyer downloads a file you upload',
  },
  {
    value: 'course_access',
    label: 'Course Access',
    hint: 'Redirect buyer to your course platform',
  },
  {
    value: 'external_link',
    label: 'External Link',
    hint: 'Redirect buyer to any URL after payment',
  },
  {
    value: 'manual_delivery',
    label: 'Manual Delivery',
    hint: 'You deliver manually after payment',
  },
]

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function resolveBaseUrl(frontendURL?: string) {
  const envBase = trimTrailingSlash(String(frontendURL || '').trim())
  if (envBase) return envBase

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin)
  }

  return ''
}

function buildProductPublicUrl(frontendURL: string, slug: string) {
  const safeSlug = String(slug || '').trim()
  const path = `/public/digital-store/product/${safeSlug}`

  const base = resolveBaseUrl(frontendURL)
  if (!base) return path

  return `${base}${path}`
}

function fmtMoney(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatFileSize(size: number) {
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`
  if (size >= 1_000) return `${(size / 1_000).toFixed(0)} KB`
  return `${size} B`
}

async function compressImage(file: File): Promise<File> {
  const outputType = file.type || 'image/jpeg'

  const compressedBlob = await imageCompression(file, {
    maxSizeMB: 0.15,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: outputType,
    initialQuality: 0.75,
  })

  const ext =
    outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg'
  const finalName = file.name.includes('.') ? file.name : `${file.name}.${ext}`

  return new File([compressedBlob], finalName, {
    type: compressedBlob.type || outputType || 'image/jpeg',
    lastModified: Date.now(),
  })
}

export default function EditDigitalDrawer({
  product: p,
  onClose,
  onSuccess,
  businessName = '',
  businessSlug = '',
  businessLogoURL = '',
  frontendURL = '',
}: Props) {
  const qc = useQueryClient()

  const [title, setTitle] = useState(p.title)
  const [description, setDescription] = useState(p.description)
  const [price, setPrice] = useState(String(p.price / 100))
  const [promoUrl, setPromoUrl] = useState(p.promo_video_url ?? '')
  const [videoTouched, setVideoTouched] = useState(false)
  const [fulfillmentMode, setFulfillmentMode] = useState<DigitalFulfillmentMode>(
    p.fulfillment_mode ?? 'file_download'
  )
  const [redirectURL, setRedirectURL] = useState(p.access_redirect_url ?? '')
  const [deliveryNote, setDeliveryNote] = useState(p.delivery_note ?? '')
  const [accessHours, setAccessHours] = useState(
    p.access_duration_hours ? String(p.access_duration_hours) : ''
  )
  const [saveError, setSaveError] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryErr, setGalleryErr] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [assetStage, setAssetStage] = useState('')

  const [selectedCover, setSelectedCover] = useState<File | null>(null)
  const [selectedDigitalFile, setSelectedDigitalFile] = useState<File | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const digitalFileRef = useRef<HTMLInputElement>(null)

  const gallery = parseGallery(p.gallery_image_urls)

  const coverPreviewUrl = useMemo(() => {
    if (selectedCover) return URL.createObjectURL(selectedCover)
    return p.cover_image_url ?? null
  }, [selectedCover, p.cover_image_url])

  useEffect(() => {
    return () => {
      if (coverPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl)
      }
    }
  }, [coverPreviewUrl])

  const productURL = useMemo(
    () => buildProductPublicUrl(frontendURL, p.slug),
    [frontendURL, p.slug]
  )

  const saveMut = useMutation({
    mutationFn: async (data: UpdateDigitalProductRequest) => {
      setAssetStage('Saving product...')
      await updateDigitalProduct(p.id, data)

      if (selectedCover) {
        setAssetStage('Uploading cover image...')
        const compressedCover = await compressImage(selectedCover)
        await uploadDigitalCover(p.id, compressedCover)
      }

      if (selectedDigitalFile) {
        setAssetStage('Uploading digital file...')
        await uploadDigitalFile(p.id, selectedDigitalFile)
      }
    },
    onSuccess: () => {
      setAssetStage('')
      onSuccess()
    },
    onError: (e: any) => {
      setAssetStage('')
      setSaveError(e?.response?.data?.message ?? 'Update failed')
    },
  })

  const removeMut = useMutation({
    mutationFn: (index: number) => removeDigitalProductGalleryImage(p.id, index),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['digital-products'] }),
    onError: () => setGalleryErr('Failed to remove image'),
  })

  async function handleGalleryUpload(file: File) {
    setGalleryErr('')

    if (gallery.length >= 3) {
      setGalleryErr('Maximum 3 gallery images allowed')
      return
    }

    if (!file.type.startsWith('image/')) {
      setGalleryErr('Only image files allowed (jpg, png, webp)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setGalleryErr('Image must be under 5 MB')
      return
    }

    setUploadingGallery(true)
    try {
      const compressedFile = await compressImage(file)
      await addDigitalProductGalleryImage(p.id, compressedFile)
      qc.invalidateQueries({ queryKey: ['digital-products'] })
    } catch (e: any) {
      setGalleryErr(e?.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploadingGallery(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(productURL)
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1500)
    } catch {}
  }

  async function handleNativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: p.title,
          text: `Check out this digital product from ${businessName || 'our store'}`,
          url: productURL,
        })
      } else {
        await handleCopyLink()
      }
    } catch {}
  }

  async function handleCoverChange(file?: File | null) {
    if (!file) return

    const acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
    if (!acceptedFormats.includes(file.type)) {
      setSaveError('Only JPG, PNG, or WEBP images are accepted for cover image.')
      return
    }

    const maxRawSizeBytes = 5 * 1024 * 1024
    if (file.size > maxRawSizeBytes) {
      setSaveError('Cover image must be 5MB or less.')
      return
    }

    setSaveError('')
    setSelectedCover(file)
  }

  function handleDigitalFileChange(file?: File | null) {
    if (!file) return

    const maxSizeBytes = 200 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setSaveError('Digital file must be 200MB or less.')
      return
    }

    setSaveError('')
    setSelectedDigitalFile(file)
  }

  function handleSave() {
    setSaveError('')

    if (!title.trim()) {
      setSaveError('Title is required')
      return
    }

    if (needsRedirectURL(fulfillmentMode) && !redirectURL.trim()) {
      setSaveError('A fulfillment link is required for this delivery type')
      return
    }

    if (promoUrl && !isValidVideoUrl(promoUrl)) {
      setSaveError('Video must be a YouTube, Vimeo, or Google Drive link')
      return
    }

    if (!price || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setSaveError('Price must be greater than 0')
      return
    }

    if (
      fulfillmentMode === 'file_download' &&
      !p.file_size &&
      !selectedDigitalFile
    ) {
      setSaveError('A digital file is required for file download products')
      return
    }

    saveMut.mutate({
      title: title.trim(),
      description: description.trim(),
      price: Math.round(parseFloat(price) * 100),
      fulfillment_mode: fulfillmentMode,
      access_redirect_url: redirectURL.trim() || undefined,
      delivery_note: deliveryNote.trim() || undefined,
      access_duration_hours: accessHours ? parseInt(accessHours, 10) : undefined,
      promo_video_url: promoUrl.trim() || undefined,
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        <div className="relative flex h-full w-full flex-col border-l border-white/10 bg-[#0f0f14] sm:w-[480px]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0f14] px-6 py-4">
            <div>
              <p className="text-xs text-gray-500">Digital Product</p>
              <h2 className="text-lg font-bold text-white">{p.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <a
                  href={productURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Public Page
                </a>

                <button
                  onClick={() => setShowQR(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  QR Code
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>

                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              </div>

              <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.06] p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
                  Public URL
                </p>
                <p className="break-all text-xs leading-6 text-gray-300">{productURL}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Product Code
                </p>
                <p className="break-all text-xs leading-6 text-gray-300">{p.slug}</p>
                <p className="mt-2 text-xs text-gray-500">
                  This public code is generated automatically and does not change when the title is edited.
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Cover Image
                </p>

                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      {coverPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverPreviewUrl}
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-8 w-8 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-white">Replace cover image</p>
                        <p className="text-xs text-gray-500">JPG, PNG, or WEBP.</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => coverRef.current?.click()}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                        >
                          <Camera className="h-4 w-4" />
                          Choose Image
                        </button>

                        {selectedCover && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCover(null)
                              setSaveError('')
                            }}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {selectedCover && (
                        <p className="text-xs text-emerald-400">
                          Selected: {selectedCover.name}
                        </p>
                      )}
                    </div>

                    <input
                      ref={coverRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        void handleCoverChange(e.target.files?.[0] ?? null)
                        e.currentTarget.value = ''
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Downloadable File
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {p.file_size ? 'Current file uploaded' : 'No file uploaded yet'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {p.file_size ? formatFileSize(p.file_size) : 'Upload a downloadable file for file download products'}
                        {p.file_mime_type ? ` • ${p.file_mime_type}` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => digitalFileRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                    >
                      <FileUp className="h-4 w-4" />
                      {p.file_size ? 'Replace File' : 'Upload File'}
                    </button>
                  </div>

                  {selectedDigitalFile && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <p className="text-xs text-emerald-400">
                        Selected: {selectedDigitalFile.name}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {formatFileSize(selectedDigitalFile.size)}
                      </p>
                    </div>
                  )}

                  <input
                    ref={digitalFileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      handleDigitalFileChange(e.target.files?.[0] ?? null)
                      e.currentTarget.value = ''
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="mb-0.5 text-gray-500">Sales</p>
                  <p className="text-base font-bold text-white">{p.sales_count}</p>
                </div>
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3">
                  <p className="mb-0.5 text-gray-500">Revenue</p>
                  <p className="font-bold text-emerald-400">{fmtMoney(p.total_revenue)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="mb-0.5 text-gray-500">Status</p>
                  <p className="font-bold text-white">{p.is_published ? 'Published' : 'Draft'}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="mb-0.5 text-gray-500">Mode</p>
                  <p className="font-bold text-white line-clamp-1">{fulfillmentMode.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-1">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Basic Info
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Access Duration <span className="normal-case font-normal text-gray-600">(optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={accessHours}
                      onChange={(e) => setAccessHours(e.target.value)}
                      placeholder="e.g. 720"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
                    />
                    <span className="shrink-0 text-sm text-gray-400">hours</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Promo Video <span className="normal-case font-normal text-gray-600">(optional)</span>
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    value={promoUrl}
                    onChange={(e) => {
                      setPromoUrl(e.target.value)
                      setVideoTouched(false)
                    }}
                    onBlur={() => setVideoTouched(true)}
                    placeholder="https://youtube.com/watch?v=..."
                    className={cn(
                      'w-full rounded-xl border bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors',
                      videoTouched && promoUrl && !isValidVideoUrl(promoUrl)
                        ? 'border-red-500/40'
                        : 'border-white/10 focus:border-white/25'
                    )}
                  />
                </div>
                {videoTouched && promoUrl && !isValidVideoUrl(promoUrl) && (
                  <p className="mt-1.5 text-xs text-red-400">
                    Only YouTube, Vimeo, or Google Drive links allowed
                  </p>
                )}
              </div>

              <div className="border-t border-white/5 pt-1">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Delivery Settings
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  How do you deliver this product?
                </label>
                <div className="relative">
                  <select
                    value={fulfillmentMode}
                    onChange={(e) =>
                      setFulfillmentMode(e.target.value as DigitalFulfillmentMode)
                    }
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-white/25"
                  >
                    {FULFILLMENT_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  {FULFILLMENT_MODES.find((mode) => mode.value === fulfillmentMode)?.hint}
                </p>
              </div>

              {needsRedirectURL(fulfillmentMode) && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Fulfillment Link *
                  </label>
                  <input
                    value={redirectURL}
                    onChange={(e) => setRedirectURL(e.target.value)}
                    placeholder="https://your-platform.com/course/access"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Buyers are redirected here immediately after successful payment.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Delivery Note <span className="normal-case font-normal text-gray-600">(optional)</span>
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  rows={2}
                  placeholder={
                    fulfillmentMode === 'manual_delivery'
                      ? 'e.g. You will receive your file via email within 24 hours'
                      : 'e.g. Check your email for login instructions'
                  }
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Shown to buyers on their fulfillment page.
                </p>
              </div>

              <div className="border-t border-white/5 pt-1">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Gallery Images
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{gallery.length}/3 images</span>

                  {gallery.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingGallery}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
                    >
                      {uploadingGallery ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-3.5 w-3.5" />
                          Add image
                        </>
                      )}
                    </button>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleGalleryUpload(file)
                      e.target.value = ''
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((url: string, index: number) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeMut.mutate(index)}
                        disabled={removeMut.isPending}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                      >
                        {removeMut.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}

                  {Array.from({ length: Math.max(0, 3 - gallery.length) }).map((_, index) => (
                    <button
                      key={`slot-${index}`}
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingGallery}
                      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/10 text-gray-600 transition-all hover:border-blue-400/40 hover:bg-blue-500/5 hover:text-blue-400 disabled:opacity-50"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px]">Add</span>
                    </button>
                  ))}
                </div>

                {galleryErr && (
                  <p className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    {galleryErr}
                  </p>
                )}
              </div>

              {assetStage && (
                <p className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
                  {assetStage}
                </p>
              )}

              {saveError && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {saveError}
                </p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-white/10 bg-[#0f0f14] p-4">
            <button
              onClick={handleSave}
              disabled={saveMut.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              {saveMut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {assetStage || 'Saving...'}
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

          <ProductQRCodePanel
            open={showQR}
            onClose={() => setShowQR(false)}
            productURL={productURL}
            businessName={businessName || businessSlug || 'My Business'}
            productTitle={p.title}
            productCode={p.slug}
            businessLogoURL={businessLogoURL}
          />
        </div>
      </div>
    </>
  )
}