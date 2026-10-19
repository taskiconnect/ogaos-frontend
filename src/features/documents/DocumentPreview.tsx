'use client'
import { FileText, Image as ImageIcon, Printer, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { BusinessDocument } from './BusinessDocument'
import type { DocumentModel } from './model'
import { printBusinessDocument } from './print'
import { documentToImage, documentToPdf, downloadFile } from './sharePdf'
import { useDocumentDialog } from './useDocumentDialog'

type ShareKind = 'pdf' | 'image'

export function DocumentPreview({
  document,
  onClose,
  children,
  canPrint = true,
  share,
}: {
  document: DocumentModel
  onClose: () => void
  children?: React.ReactNode
  canPrint?: boolean
  /** Pass to show the WhatsApp PDF and Image buttons. Omit for invoices/statements. */
  share?: { caption: string; fallbackUrl: string }
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dialog = useDocumentDialog(onClose)
  const [error, setError] = useState('')
  const [sharing, setSharing] = useState<ShareKind | null>(null)
  // File already built but the browser asked for a fresh tap before sharing it
  const [pending, setPending] = useState<{ kind: ShareKind; file: File } | null>(null)

  async function shareWhatsApp(kind: ShareKind) {
    if (!ref.current || !share) return
    setError('')
    try {
      let file = pending?.kind === kind ? pending.file : null
      if (!file) {
        setSharing(kind)
        if (kind === 'pdf') {
          const blob = await documentToPdf(ref.current)
          file = new File([blob], `${document.reference}.pdf`, { type: 'application/pdf' })
        } else {
          const blob = await documentToImage(ref.current)
          file = new File([blob], `${document.reference}.png`, { type: 'image/png' })
        }
      }

      const isTouch = window.matchMedia('(pointer: coarse)').matches
      if (isTouch && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: share.caption })
          setPending(null)
        } catch (e) {
          const name = (e as DOMException).name
          if (name === 'AbortError') setPending(null) // user dismissed the sheet
          else if (name === 'NotAllowedError') setPending({ kind, file }) // needs a fresh tap
          else throw e
        }
        return
      }

      // Desktop fallback: save the file, open WhatsApp with the receipt text
      downloadFile(file)
      setPending(null)
      const win = window.open(share.fallbackUrl, '_blank', 'noopener,noreferrer')
      if (!win) setError('File saved. Allow pop-ups to open WhatsApp.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not prepare the file')
    } finally {
      setSharing(null)
    }
  }

  const shareBtn =
    'flex items-center gap-2 rounded-xl border border-emerald-400/40 px-3 py-2 text-sm font-medium text-emerald-300 disabled:opacity-50'

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Document preview"
      className="fixed inset-0 z-[70] flex flex-col bg-slate-950/95 p-3 sm:p-6"
    >
      <header className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 text-white">
        <div>
          <p className="font-semibold capitalize">{document.kind} preview</p>
          <p className="text-xs text-slate-400">A4 · Colour · Print or choose “Save as PDF”</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {children}
          {share && (
            <>
              <button
                disabled={!canPrint || sharing !== null}
                onClick={() => void shareWhatsApp('pdf')}
                className={shareBtn}
              >
                <FileText className="size-4" />
                {sharing === 'pdf'
                  ? 'Preparing PDF…'
                  : pending?.kind === 'pdf'
                    ? 'Tap to send PDF'
                    : 'WhatsApp PDF'}
              </button>
              <button
                disabled={!canPrint || sharing !== null}
                onClick={() => void shareWhatsApp('image')}
                className={shareBtn}
              >
                <ImageIcon className="size-4" />
                {sharing === 'image'
                  ? 'Preparing image…'
                  : pending?.kind === 'image'
                    ? 'Tap to send image'
                    : 'WhatsApp Image'}
              </button>
            </>
          )}
          <button
            disabled={!canPrint}
            onClick={() => {
              if (ref.current)
                void printBusinessDocument(ref.current, document.reference).catch((e) =>
                  setError(e.message),
                )
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Printer className="size-4" />
            Print / Save PDF
          </button>
          <button
            aria-label="Close document"
            onClick={onClose}
            className="rounded-xl border border-white/20 p-2"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>
      {error && (
        <p role="alert" className="mx-auto mb-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <div className="overflow-auto pb-10">
        <div ref={ref} className="mx-auto max-w-[850px]">
          <BusinessDocument document={document} />
        </div>
      </div>
    </div>
  )
}