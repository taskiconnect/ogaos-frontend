'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  X,
  QrCode,
  Loader2,
  Download,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'

interface ProductQRCodePanelProps {
  open: boolean
  onClose: () => void
  productURL: string
  businessName: string
  productTitle: string
  productCode?: string
  businessLogoURL?: string
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  weight = 800
) {
  let size = initialSize
  while (size > minSize) {
    ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`
    if (ctx.measureText(text).width <= maxWidth) return size
    size -= 1
  }
  return minSize
}

function drawWrappedCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
      if (lines.length === maxLines - 1) break
    }
  }

  if (current && lines.length < maxLines) lines.push(current)

  if (lines.length === maxLines && words.join(' ') !== lines.join(' ')) {
    let last = lines[maxLines - 1]
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1)
    }
    lines[maxLines - 1] = `${last}…`
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, centerX, startY + index * lineHeight)
  })
}

function safeDomain(value: string) {
  try {
    return new URL(value).host
  } catch {
    return value
  }
}

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(logo, x, y, size, size)
  ctx.restore()

  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 1.5, 0, Math.PI * 2)
  ctx.stroke()
}

export default function ProductQRCodePanel({
  open,
  onClose,
  productURL,
  businessName,
  productTitle,
  productCode = '',
  businessLogoURL = '',
}: ProductQRCodePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const safeBusinessName = useMemo(
    () => businessName?.trim() || 'OgaOS Store',
    [businessName]
  )

  const safeProductTitle = useMemo(
    () => productTitle?.trim() || 'Digital Product',
    [productTitle]
  )

  const generateQR = useCallback(async () => {
    setGenerating(true)

    try {
      const QRCode = (await import('qrcode')).default
      const canvas = canvasRef.current
      if (!canvas) return

      const BRAND_BLUE = '#1C35EA'
      const BRAND_BLACK = '#000000'
      const WHITE = '#FFFFFF'
      const OFFWHITE = '#F8FAFC'
      const LIGHT_TEXT = '#DBEAFE'
      const DARK_TEXT = '#1E3A8A'
      const MUTED_TEXT = '#475569'
      const SUBTLE_TEXT = '#64748B'
      const DIVIDER = '#DBEAFE'

      const cardWidth = 1100
      const cardHeight = 1500
      const qrSize = 620
      const qrX = (cardWidth - qrSize) / 2
      const qrY = 360

      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, productURL, {
        width: qrSize,
        margin: 1,
        errorCorrectionLevel: 'H',
        color: {
          dark: BRAND_BLACK,
          light: WHITE,
        },
      })

      let logoImage: HTMLImageElement | null = null
      if (businessLogoURL.trim()) {
        try {
          logoImage = await loadImage(businessLogoURL.trim())
        } catch {
          logoImage = null
        }
      }

      canvas.width = cardWidth
      canvas.height = cardHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, cardWidth, cardHeight)

      ctx.fillStyle = BRAND_BLUE
      roundedRect(ctx, 0, 0, cardWidth, cardHeight, 46)
      ctx.fill()

      ctx.fillStyle = OFFWHITE
      roundedRect(ctx, 40, 40, cardWidth - 80, cardHeight - 80, 38)
      ctx.fill()

      ctx.fillStyle = BRAND_BLUE
      roundedRect(ctx, 70, 70, cardWidth - 140, 250, 30)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 2
      roundedRect(ctx, 70, 70, cardWidth - 140, 250, 30)
      ctx.stroke()

      ctx.fillStyle = 'rgba(255,255,255,0.90)'
      ctx.font = '700 24px Inter, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('DIGITAL PRODUCT', cardWidth / 2, 102)

      if (logoImage) {
        const logoSize = 74
        const gap = 18
        const textAvailableWidth = cardWidth - 140 - 120 - logoSize - gap
        const fontSize = fitText(ctx, safeBusinessName, textAvailableWidth, 40, 24, 800)
        ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`

        const textWidth = Math.min(ctx.measureText(safeBusinessName).width, textAvailableWidth)
        const totalWidth = logoSize + gap + textWidth
        const startX = Math.max(110, (cardWidth - totalWidth) / 2)
        const logoY = 150

        drawLogo(ctx, logoImage, startX, logoY, logoSize)

        ctx.fillStyle = WHITE
        ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          safeBusinessName,
          startX + logoSize + gap,
          logoY + logoSize / 2 + 2
        )
      } else {
        ctx.fillStyle = WHITE
        const titleSize = fitText(ctx, safeBusinessName, cardWidth - 250, 42, 24, 800)
        ctx.font = `800 ${titleSize}px Inter, Arial, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        drawWrappedCenteredText(
          ctx,
          safeBusinessName,
          cardWidth / 2,
          142,
          cardWidth - 250,
          Math.max(titleSize + 6, 32),
          2
        )
      }

      ctx.fillStyle = LIGHT_TEXT
      ctx.font = '600 24px Inter, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      drawWrappedCenteredText(ctx, safeProductTitle, cardWidth / 2, 238, cardWidth - 260, 30, 2)

      ctx.fillStyle = BRAND_BLACK
      roundedRect(ctx, qrX - 26, qrY - 26, qrSize + 52, qrSize + 52, 34)
      ctx.fill()

      ctx.fillStyle = WHITE
      roundedRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 24)
      ctx.fill()

      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize)

      const badgeText = productCode.trim() || 'PUBLIC LINK'
      ctx.fillStyle = BRAND_BLUE
      roundedRect(ctx, cardWidth / 2 - 150, 1025, 300, 54, 27)
      ctx.fill()

      ctx.fillStyle = WHITE
      ctx.font = '800 22px Inter, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(badgeText, cardWidth / 2, 1052)

      ctx.strokeStyle = DIVIDER
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(120, 1125)
      ctx.lineTo(cardWidth - 120, 1125)
      ctx.stroke()

      ctx.fillStyle = DARK_TEXT
      ctx.font = '800 28px Inter, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('Scan to open this product page', cardWidth / 2, 1160)

      ctx.fillStyle = MUTED_TEXT
      ctx.font = '600 20px Inter, Arial, sans-serif'
      drawWrappedCenteredText(ctx, safeDomain(productURL), cardWidth / 2, 1208, cardWidth - 220, 26, 2)

      ctx.fillStyle = SUBTLE_TEXT
      ctx.font = '500 18px Inter, Arial, sans-serif'
      drawWrappedCenteredText(
        ctx,
        'This QR code opens the public product page directly.',
        cardWidth / 2,
        1274,
        cardWidth - 260,
        24,
        2
      )

      ctx.fillStyle = BRAND_BLUE
      roundedRect(ctx, 120, 1360, cardWidth - 240, 78, 24)
      ctx.fill()

      ctx.fillStyle = WHITE
      ctx.font = '800 24px Inter, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Powered by OgaOS', cardWidth / 2, 1399)

      setGenerated(true)
    } catch (error) {
      console.error('QR generation failed', error)
    } finally {
      setGenerating(false)
    }
  }, [productURL, safeBusinessName, safeProductTitle, productCode, businessLogoURL])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(productURL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    const fileBase = slugifyFileName(safeProductTitle) || 'digital-product'
    link.download = `qr-${fileBase}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!open) return null

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#0f0f14]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
          <div>
            <h3 className="font-bold text-white">QR Code</h3>
            <p className="line-clamp-1 text-xs text-gray-500">{safeProductTitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {generated ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white p-3">
            <canvas ref={canvasRef} className="h-auto w-full rounded-xl" />
          </div>
        ) : (
          <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border"
              style={{ borderColor: 'rgba(28,53,234,0.25)', backgroundColor: 'rgba(28,53,234,0.08)' }}
            >
              <QrCode className="h-8 w-8" style={{ color: '#1C35EA' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Generate branded QR code</p>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Public URL
          </p>
          <p className="break-all text-xs leading-6 text-gray-300">{productURL}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {!generated ? (
            <button
              onClick={generateQR}
              disabled={generating}
              className="col-span-2 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: '#1C35EA' }}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleDownload}
                className="col-span-2 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white"
                style={{ background: '#1C35EA' }}
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>

              <button
                onClick={generateQR}
                disabled={generating}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/10"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                Refresh
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/10"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy URL'}
              </button>

              <a
                href={productURL}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4" />
                Open Public Page
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}