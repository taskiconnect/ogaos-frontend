'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Copy, CheckCircle2, MessageCircle, Twitter } from 'lucide-react'
import type { PublicBusiness } from '@/components/public/public-profile-shared'

interface Props {
  biz: PublicBusiness
  onClose: () => void
}

function QRCode({ url }: { url: string }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}&bgcolor=0c0c12&color=ffffff&margin=6`

  return (
    <Image
      src={src}
      alt="QR code"
      width={160}
      height={160}
      className="mx-auto rounded-xl border border-white/10"
      unoptimized
    />
  )
}

export function ShareModal({ biz, onClose }: Props) {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm sm:items-center"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm space-y-5 rounded-3xl border border-white/10 bg-[#0e0e18] p-6"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Share {biz.name}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl bg-black/40 p-4">
            <QRCode url={url} />
            <p className="mt-2 text-center text-xs text-gray-500">Scan to visit this page</p>
          </div>

          <button
            onClick={copy}
            className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-gray-400" />
            )}

            <span className="flex-1 truncate text-left text-sm text-white">{url}</span>
            <span className="shrink-0 text-xs text-gray-500">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${biz.name} on OgaOS: ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/15 py-2.5 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/25"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${biz.name} on OgaOS`)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Twitter className="h-4 w-4" />
              Share
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}