'use client'

import { useMemo, useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import {
  createDigitalProduct,
  uploadDigitalCover,
  uploadDigitalFile,
} from '@/lib/api/digital'
import {
  X,
  Loader2,
  ChevronDown,
  Link as LinkIcon,
  ImagePlus,
  FileUp,
  CheckCircle2,
} from 'lucide-react'
import type {
  CreateDigitalProductRequest,
  DigitalFulfillmentMode,
} from '@/lib/api/types'

interface CreateProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}

const PRODUCT_TYPES = [
  'E-book',
  'Course',
  'Template',
  'Software',
  'Audio',
  'Video',
  'Design Asset',
  'Other',
]

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

const selectClassName =
  'w-full rounded-xl border border-white/10 bg-[#1a1a24] px-4 py-3 text-sm text-white ' +
  'focus:outline-none focus:border-white/25 ' +
  '[&_option]:bg-[#1a1a24] [&_option]:text-white'

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

function formatFileSize(size: number) {
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`
  if (size >= 1_000) return `${(size / 1_000).toFixed(0)} KB`
  return `${size} B`
}

export function CreateDigitalModal({ open, onOpenChange, onSuccess }: CreateProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('E-book')
  const [price, setPrice] = useState('')
  const [promoUrl, setPromoUrl] = useState('')
  const [fulfillmentMode, setFulfillmentMode] =
    useState<DigitalFulfillmentMode>('file_download')
  const [redirectURL, setRedirectURL] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [accessHours, setAccessHours] = useState('')
  const [error, setError] = useState('')
  const [videoTouched, setVideoTouched] = useState(false)

  const [selectedCover, setSelectedCover] = useState<File | null>(null)
  const [selectedDigitalFile, setSelectedDigitalFile] = useState<File | null>(null)
  const [uploadStage, setUploadStage] = useState('')

  const coverPreviewUrl = useMemo(() => {
    if (!selectedCover) return null
    return URL.createObjectURL(selectedCover)
  }, [selectedCover])

  useEffect(() => {
    return () => {
      if (coverPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl)
      }
    }
  }, [coverPreviewUrl])

  function reset() {
    setTitle('')
    setDescription('')
    setType('E-book')
    setPrice('')
    setPromoUrl('')
    setFulfillmentMode('file_download')
    setRedirectURL('')
    setDeliveryNote('')
    setAccessHours('')
    setError('')
    setVideoTouched(false)
    setSelectedCover(null)
    setSelectedDigitalFile(null)
    setUploadStage('')
  }

  async function handleCoverChange(file?: File | null) {
    if (!file) return

    const acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
    if (!acceptedFormats.includes(file.type)) {
      setError('Only JPG, PNG, or WEBP images are accepted for cover image.')
      return
    }

    const maxRawSizeBytes = 5 * 1024 * 1024
    if (file.size > maxRawSizeBytes) {
      setError('Cover image must be 5MB or less.')
      return
    }

    setError('')
    setSelectedCover(file)
  }

  function handleDigitalFileChange(file?: File | null) {
    if (!file) return

    const maxSizeBytes = 200 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError('Digital file must be 200MB or less.')
      return
    }

    setError('')
    setSelectedDigitalFile(file)
  }

  const mut = useMutation({
    mutationFn: async (data: CreateDigitalProductRequest) => {
      setUploadStage('Creating product...')
      const product = await createDigitalProduct(data)

      if (selectedCover) {
        setUploadStage('Uploading cover image...')
        const compressedCover = await compressImage(selectedCover)
        await uploadDigitalCover(product.id, compressedCover)
      }

      if (selectedDigitalFile) {
        setUploadStage('Uploading digital file...')
        await uploadDigitalFile(product.id, selectedDigitalFile)
      }

      return product
    },
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
      reset()
    },
    onError: (e: any) => {
      setUploadStage('')
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to create')
    },
  })

  function handleSubmit() {
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    if (!price || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError('Price is required')
      return
    }

    if (needsRedirectURL(fulfillmentMode) && !redirectURL.trim()) {
      setError('A fulfillment link is required for this delivery type')
      return
    }

    if (promoUrl && !isValidVideoUrl(promoUrl)) {
      setError('Video must be a YouTube, Vimeo, or Google Drive link')
      return
    }

    if (fulfillmentMode === 'file_download' && !selectedDigitalFile) {
      setError('A digital file is required for file download products')
      return
    }

    mut.mutate({
      title: title.trim(),
      description: description.trim(),
      type,
      price: Math.round(parseFloat(price) * 100),
      fulfillment_mode: fulfillmentMode,
      access_redirect_url: redirectURL.trim() || undefined,
      delivery_note: deliveryNote.trim() || undefined,
      access_duration_hours: accessHours ? parseInt(accessHours, 10) : undefined,
      promo_video_url: promoUrl.trim() || undefined,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div
        style={{ maxHeight: '90dvh' }}
        className="relative flex flex-col w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0f0f14] shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-bold text-white">New Digital Product</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="space-y-4 p-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Cover Image <span className="normal-case font-normal text-gray-600">(optional)</span>
              </label>

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
                      <p className="text-sm font-medium text-white">Upload cover image</p>
                      <p className="text-xs text-gray-500">JPG, PNG, or WEBP.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                        Choose Image
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={mut.isPending}
                          onChange={(e) => {
                            void handleCoverChange(e.target.files?.[0] ?? null)
                            e.currentTarget.value = ''
                          }}
                        />
                      </label>

                      {selectedCover && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCover(null)
                            setError('')
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
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Business Plan Template"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={selectClassName}
              >
                {PRODUCT_TYPES.map((productType) => (
                  <option key={productType} value={productType}>
                    {productType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What will the buyer get? What problem does it solve?"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Price (₦) *
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
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
                  className={`${selectClassName} appearance-none pr-10`}
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

            {fulfillmentMode === 'file_download' && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Digital File *
                </label>

                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <FileUp className="h-6 w-6 text-gray-500" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-white">Upload downloadable file</p>
                        <p className="text-xs text-gray-500">
                          PDF, ZIP, DOCX, MP4, or other supported file.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                          Choose File
                          <input
                            type="file"
                            className="hidden"
                            disabled={mut.isPending}
                            onChange={(e) => {
                              handleDigitalFileChange(e.target.files?.[0] ?? null)
                              e.currentTarget.value = ''
                            }}
                          />
                        </label>

                        {selectedDigitalFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDigitalFile(null)
                              setError('')
                            }}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                          >
                            Remove
                          </button>
                        )}
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
                    </div>
                  </div>
                </div>
              </div>
            )}

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
              <p className="mt-1.5 text-xs text-gray-500">
                Leave blank for lifetime access. 720 = 30 days.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Promo Video URL <span className="normal-case font-normal text-gray-600">(optional)</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={promoUrl}
                  onChange={(e) => {
                    setPromoUrl(e.target.value)
                    setVideoTouched(false)
                  }}
                  onBlur={() => setVideoTouched(true)}
                  placeholder="https://youtube.com/watch?v=..."
                  className={`w-full rounded-xl border bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    videoTouched && promoUrl && !isValidVideoUrl(promoUrl)
                      ? 'border-red-500/40'
                      : 'border-white/10 focus:border-white/25'
                  }`}
                />
              </div>
              {videoTouched && promoUrl && !isValidVideoUrl(promoUrl) && (
                <p className="mt-1.5 text-xs text-red-400">
                  Only YouTube, Vimeo, or Google Drive links allowed
                </p>
              )}
            </div>

            <p className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-gray-500">
              The product will be created first, then selected cover image and digital file will be uploaded automatically.
              OgaOS takes a 5% platform fee on each sale.
            </p>

            {uploadStage && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadStage}
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={mut.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              {mut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadStage || 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateDigitalModal