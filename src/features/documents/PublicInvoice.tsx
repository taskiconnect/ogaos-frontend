'use client'
import type { Business, Invoice } from '@/lib/api/types'
import { useRef, useState } from 'react'
import { BusinessDocument } from './BusinessDocument'
import { invoiceDocument } from './model'
import { printBusinessDocument } from './print'
export function PublicInvoice({ invoice }: { invoice: Invoice & { business?: Business } }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-8">
      <div className="mx-auto mb-5 flex max-w-[850px] items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-700">Invoice {invoice.invoice_number}</p>
        <button
          onClick={() => {
            if (ref.current)
              void printBusinessDocument(ref.current, invoice.invoice_number).catch((e) =>
                setError(e.message),
              )
          }}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Print / Save PDF
        </button>
      </div>
      {error && (
        <p role="alert" className="mx-auto max-w-[850px] text-sm text-red-700">
          {error}
        </p>
      )}
      <div ref={ref} className="mx-auto max-w-[850px]">
        <BusinessDocument document={invoiceDocument(invoice, invoice.business)} />
      </div>
    </main>
  )
}
