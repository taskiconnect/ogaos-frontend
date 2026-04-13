'use client'

import { useState, useEffect, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { createProduct, updateProduct, uploadProductImage } from '@/lib/api/business'
import { X, Loader2, ImagePlus, ScanLine } from 'lucide-react'
import { cn, isUpgradeRequiredError, getSubscriptionToastMessage } from '@/lib/utils'
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/lib/api/types'
import BarcodeScannerModal from '@/components/products/BarcodeScannerModal'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
  editing?: Product | null
}


export default function ProductModal({ open, onOpenChange, onSuccess, editing }: Props) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'product' | 'service'>('product')
  const [sku, setSku] = useState('')
  const [barcode, setBarcode] = useState('')
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [trackInv, setTrackInv] = useState(true)
  const [stockQty, setStockQty] = useState('0')
  const [lowThreshold, setLowThreshold] = useState('5')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState('')

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)

  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (open && !editing) {
      setIdempotencyKey(
        globalThis.crypto?.randomUUID?.() ??
          `product_${Date.now()}_${Math.random().toString(36).slice(2)}`
      )
    }
  }, [open, editing])

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setDescription(editing.description ?? '')
      setType(editing.type as 'product' | 'service')
      setSku(editing.sku ?? '')
      setBarcode(editing.barcode ?? '')
      setPrice(String(editing.price / 100))
      setCostPrice(editing.cost_price ? String(editing.cost_price / 100) : '')
      setTrackInv(editing.track_inventory)
      setStockQty(String(editing.stock_quantity))
      setLowThreshold(String(editing.low_stock_threshold))
      setIsActive(editing.is_active)
    } else {
      setName('')
      setDescription('')
      setType('product')
      setSku('')
      setBarcode('')
      setPrice('')
      setCostPrice('')
      setTrackInv(true)
      setStockQty('0')
      setLowThreshold('5')
      setIsActive(true)
    }

    setSelectedImage(null)
    setIsUploadingImage(false)
    setError('')
    setScannerOpen(false)
  }, [editing, open])

  const previewUrl = useMemo(() => {
    if (selectedImage) return URL.createObjectURL(selectedImage)
    return editing?.image_url ?? null
  }, [selectedImage, editing?.image_url])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  async function compressImage(file: File): Promise<File> {
    const outputType = file.type || 'image/jpeg'

    const compressedBlob = await imageCompression(file, {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: outputType,
      initialQuality: 0.7,
    })

    const ext =
      outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg'
    const finalName = file.name.includes('.') ? file.name : `${file.name}.${ext}`

    return new File([compressedBlob], finalName, {
      type: compressedBlob.type || outputType || 'image/jpeg',
      lastModified: Date.now(),
    })
  }

  const createMut = useMutation({
    mutationFn: async (d: CreateProductRequest) => {
      const product = await createProduct(d, idempotencyKey)
      if (selectedImage) {
        setIsUploadingImage(true)
        try {
          const compressedFile = await compressImage(selectedImage)
          await uploadProductImage(product.id, compressedFile)
        } finally {
          setIsUploadingImage(false)
        }
      }
      return product
    },
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
    onError: (e: unknown) => {
      if (isUpgradeRequiredError(e)) {
        setError(getSubscriptionToastMessage(e))
        onOpenChange(false)
        router.push('/subscription')
        return
      }

      if (typeof e === 'object' && e !== null) {
        const errObj = e as {
          message?: string
          response?: { data?: { message?: string } }
        }
        setError(errObj.message ?? errObj.response?.data?.message ?? 'Failed to save')
        return
      }

      setError('Failed to save')
    },
  })

  const updateMut = useMutation({
    mutationFn: async (d: UpdateProductRequest) => {
      const product = await updateProduct(editing!.id, d)
      if (selectedImage) {
        setIsUploadingImage(true)
        try {
          const compressedFile = await compressImage(selectedImage)
          await uploadProductImage(editing!.id, compressedFile)
        } finally {
          setIsUploadingImage(false)
        }
      }
      return product
    },
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
    onError: (e: unknown) => {
      if (isUpgradeRequiredError(e)) {
        setError(getSubscriptionToastMessage(e))
        onOpenChange(false)
        router.push('/subscription')
        return
      }

      if (typeof e === 'object' && e !== null) {
        const errObj = e as {
          message?: string
          response?: { data?: { message?: string } }
        }
        setError(errObj.message ?? errObj.response?.data?.message ?? 'Failed to update')
        return
      }

      setError('Failed to update')
    },
  })

  async function handleImageChange(file?: File | null) {
    if (!file) return

    const acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
    if (!acceptedFormats.includes(file.type)) {
      setError('Only JPG, PNG, or WEBP images are accepted. Please upload a valid image file.')
      return
    }

    const maxRawSizeBytes = 5 * 1024 * 1024
    if (file.size > maxRawSizeBytes) {
      setError('Image must be 5MB or less.')
      return
    }

    setError('')
    setSelectedImage(file)
  }

  function handleDetectedBarcode(value: string) {
    setBarcode(value)
    setError('')
    setScannerOpen(false)
  }

  function handleSubmit() {
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Price is required')
      return
    }

    if (editing) {
      updateMut.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        price: Math.round(parseFloat(price) * 100),
        cost_price: costPrice ? Math.round(parseFloat(costPrice) * 100) : undefined,
        track_inventory: type === 'service' ? false : trackInv,
        low_stock_threshold: type === 'service' ? undefined : parseInt(lowThreshold) || 5,
        is_active: isActive,
      })
      return
    }

    createMut.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      price: Math.round(parseFloat(price) * 100),
      cost_price: costPrice ? Math.round(parseFloat(costPrice) * 100) : undefined,
      track_inventory: type === 'service' ? false : trackInv,
      stock_quantity: type === 'service' ? undefined : trackInv ? parseInt(stockQty) || 0 : 0,
      low_stock_threshold: type === 'service' ? undefined : parseInt(lowThreshold) || 5,
    })
  }

  const isPending = createMut.isPending || updateMut.isPending
  const isBusy = isPending || isUploadingImage

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[1100] isolate flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className={cn(
            'absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity',
            scannerOpen && 'pointer-events-none opacity-20'
          )}
          onClick={() => {
            if (!scannerOpen) onOpenChange(false)
          }}
        />

        <div
          className={cn(
            'relative max-h-[95vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0f0f14] shadow-2xl sm:max-w-lg sm:rounded-3xl',
            scannerOpen && 'pointer-events-none select-none'
          )}
          aria-hidden={scannerOpen}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0f14] px-6 py-4">
            <h2 className="text-lg font-bold text-white">{editing ? 'Edit Product' : 'New Product'}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              disabled={scannerOpen}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4 p-6">
            {!editing && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Type
                </label>
                <div className="flex gap-2">
                  {(['product', 'service'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t)
                        if (t === 'service') {
                          setTrackInv(false)
                          setStockQty('0')
                        }
                      }}
                      className={cn(
                        'flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition-all',
                        type === t
                          ? 'border-primary bg-primary text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Product Image
              </label>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-white">Upload product image</p>
                      <p className="text-xs text-gray-500">JPG, PNG, or WEBP.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label
                        className={cn(
                          'inline-flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium text-white transition',
                          isBusy
                            ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-60'
                            : 'border-white/10 bg-white/10 hover:bg-white/15'
                        )}
                      >
                        Choose Image
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={isBusy}
                          onChange={(e) => {
                            void handleImageChange(e.target.files?.[0] ?? null)
                            e.currentTarget.value = ''
                          }}
                        />
                      </label>

                      {selectedImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null)
                            setError('')
                          }}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                        >
                          Remove Selection
                        </button>
                      )}
                    </div>

                    {selectedImage && (
                      <p className="text-xs text-emerald-400">
                        Selected: {selectedImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-white/25 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Selling Price (₦) *
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
                  Cost Price (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  SKU (optional)
                </label>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. PROD-001"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Barcode (optional)
              </label>

              <div className="flex gap-2">
                <input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setScannerOpen(true)
                  }}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 transition hover:bg-cyan-500/15"
                  title="Scan barcode"
                >
                  <ScanLine className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                You can type manually, use a hardware scanner, or tap scan to use the camera.
              </p>
            </div>

            {type === 'product' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Track inventory</p>
                    <p className="text-xs text-gray-500">Monitor stock levels and get alerts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrackInv((v) => !v)}
                    className={cn(
                      'relative h-6 w-10 shrink-0 rounded-full border transition-all',
                      trackInv ? 'border-primary bg-primary' : 'border-white/20 bg-white/5'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                        trackInv ? 'left-4' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>

                {trackInv && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {editing ? 'Current Stock' : 'Opening Stock'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stockQty}
                        onChange={(e) => setStockQty(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={lowThreshold}
                        onChange={(e) => setLowThreshold(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {editing && (
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <p className="text-sm font-medium text-white">Active</p>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={cn(
                    'relative h-6 w-10 shrink-0 rounded-full border transition-all',
                    isActive ? 'border-primary bg-primary' : 'border-white/20 bg-white/5'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                      isActive ? 'left-4' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              {isPending || isUploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : editing ? (
                'Save Changes'
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </div>
      </div>

      <BarcodeScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onDetected={handleDetectedBarcode}
      />
    </>
  )
}