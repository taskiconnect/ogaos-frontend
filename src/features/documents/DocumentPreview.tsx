'use client'
import { Printer, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { BusinessDocument } from './BusinessDocument'
import type { DocumentModel } from './model'
import { printBusinessDocument } from './print'
import { useDocumentDialog } from './useDocumentDialog'
export function DocumentPreview({
  document,
  onClose,
  children,
  canPrint = true,
}: {
  document: DocumentModel
  onClose: () => void
  children?: React.ReactNode
  canPrint?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dialog = useDocumentDialog(onClose)
  const [error, setError] = useState('')
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
        <div className="flex items-center gap-2">
          {children}
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
