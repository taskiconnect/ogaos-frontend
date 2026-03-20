'use client'

import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateReceipt } from '@/lib/api/finance'
import { getBusiness } from '@/lib/api/business'
import { X, Printer, Mail, CheckCircle2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Sale } from '@/lib/api/types'

function naira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

interface Props {
  sale: Sale | null
  onClose: () => void
}

export default function ReceiptModal({ sale, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const [receiptGenerated, setReceiptGenerated] = useState(false)

  const { data: business } = useQuery({
    queryKey: ['business-me'],
    queryFn: getBusiness,
    enabled: !!sale,
    staleTime: 5 * 60 * 1000,
  })

  // Generates a receipt number on the backend (idempotent — safe to call multiple times)
  const receiptMutation = useMutation({
    mutationFn: () => generateReceipt(sale!.id),
    onSuccess: (updatedSale) => {
      setReceiptGenerated(true)
      qc.invalidateQueries({ queryKey: ['sales'] })
      toast.success(`Receipt ${updatedSale.receipt_number ?? ''} generated!`)
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? 'Failed to generate receipt'),
  })

  // ── Print ──────────────────────────────────────────────────────────────────
  function handlePrint() {
    if (!printRef.current) return
    const html = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=460,height=780')
    if (!win) return
    win.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>Receipt – ${sale?.sale_number ?? ''}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#fff;padding:24px;color:#111}
    .wrap{max-width:380px;margin:0 auto}
    @media print{body{padding:0}@page{margin:10mm}}
  </style>
</head><body>
  <div class="wrap">${html}</div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
</body></html>`)
    win.document.close()
  }

  // Email receipt — opens mail client with pre-filled body as fallback
  // (full backend email sending to be wired up separately)
  function handleEmailReceipt() {
    if (!sale || !customerEmail) return
    const subject = encodeURIComponent(`Receipt ${receiptRef} from ${bizName}`)
    const body = encodeURIComponent(
      `Hi ${customerName},\n\nPlease find your receipt for ${naira(sale.total_amount)} (${sale.payment_method}).\n\nReceipt No: ${receiptRef}\nDate: ${fmtDate(sale.created_at)}\n\nThank you for your business!\n\n${bizName}`
    )
    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`)
  }

  if (!sale) return null

  const customerName  = sale.customer
    ? `${sale.customer.first_name} ${sale.customer.last_name}`.trim()
    : 'Walk-in Customer'
  const customerPhone = sale.customer?.phone_number ?? null
  const customerEmail = sale.customer?.email ?? null

  const statusLabel = sale.balance_due === 0 ? 'PAID IN FULL'
    : sale.amount_paid > 0 ? 'PARTIAL PAYMENT'
    : 'PAYMENT PENDING'
  const statusColor = sale.balance_due === 0 ? '#16a34a'
    : sale.amount_paid > 0 ? '#d97706'
    : '#dc2626'

  const receiptRef = sale.receipt_number ?? sale.sale_number
  const logoUrl    = business?.logo_url ?? null
  const bizName    = business?.name ?? 'Business'
  const bizInitial = bizName[0]?.toUpperCase() ?? 'B'

  const R = {
    center:  { textAlign: 'center' as const },
    divider: { borderTop: '2px dashed #e5e7eb', margin: '14px 0' },
    label:   { fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '3px' },
    val:     { fontSize: '14px', fontWeight: 700, color: '#111827' },
    valSm:   { fontSize: '12px', color: '#374151', marginTop: '1px' },
    row:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid #f3f4f6' },
    rowName: { fontSize: '13px', fontWeight: 600, flex: 1 },
    rowDesc: { fontSize: '11px', color: '#6b7280', marginTop: '2px' },
    rowAmt:  { fontSize: '13px', fontWeight: 700, marginLeft: '10px', whiteSpace: 'nowrap' as const },
    totRow:  { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '5px' },
    totBold: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '5px' },
    paidRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' },
    balRow:  { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' },
    badge:   { display: 'inline-block', background: statusColor, color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', padding: '6px 18px', borderRadius: '100px' },
    footer:  { fontSize: '11px', color: '#9ca3af', textAlign: 'center' as const, marginTop: '14px', paddingTop: '14px', borderTop: '2px dashed #e5e7eb' },
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-dash-surface border border-dash-border rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-dash-border shrink-0">
            <h2 className="font-semibold text-foreground">Receipt Preview</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-dash-hover text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Receipt body (scrollable) */}
          <div className="overflow-y-auto flex-1 p-5">
            <div ref={printRef} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#111827' }}>

              {/* Business header */}
              <div style={{ ...R.center, paddingBottom: '16px', borderBottom: '2px dashed #e5e7eb', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt={bizName}
                      style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '12px' }} />
                  ) : (
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '12px',
                      background: 'linear-gradient(135deg,#002b9d,#3f9af5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '26px', fontWeight: 800,
                    }}>
                      {bizInitial}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '3px' }}>{bizName}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Receipt</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', fontFamily: 'monospace' }}>{receiptRef}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{fmtDate(sale.created_at)}</div>
              </div>

              {/* Customer */}
              <div style={{ marginBottom: '14px' }}>
                <div style={R.label}>Customer</div>
                <div style={R.val}>{customerName}</div>
                {customerPhone && <div style={R.valSm}>{customerPhone}</div>}
                {customerEmail && <div style={R.valSm}>{customerEmail}</div>}
              </div>

              {/* Staff */}
              {sale.staff_name && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={R.label}>Served by</div>
                  <div style={R.val}>{sale.staff_name}</div>
                </div>
              )}

              <div style={R.divider} />

              {/* Items */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ ...R.label, marginBottom: '8px' }}>Items</div>
                {(!sale.items || sale.items.length === 0) && (
                  <div style={R.valSm}>No items recorded</div>
                )}
                {sale.items?.map((item, idx) => (
                  <div key={item.id ?? idx} style={R.row}>
                    <div style={{ flex: 1 }}>
                      <div style={R.rowName}>{item.product_name}</div>
                      <div style={R.rowDesc}>
                        {naira(item.unit_price)} × {item.quantity}
                        {item.discount > 0 && ` − ${naira(item.discount)} disc.`}
                      </div>
                    </div>
                    <div style={R.rowAmt}>{naira(item.total_price)}</div>
                  </div>
                ))}
              </div>

              <div style={R.divider} />

              {/* Totals */}
              <div style={{ marginBottom: '14px' }}>
                {sale.discount_amount > 0 && (
                  <div style={R.totRow}>
                    <span>Discount</span><span>− {naira(sale.discount_amount)}</span>
                  </div>
                )}
                {sale.vat_amount > 0 && (
                  <div style={R.totRow}>
                    <span>VAT ({sale.vat_rate}%)</span><span>{naira(sale.vat_amount)}</span>
                  </div>
                )}
                <div style={R.totBold}>
                  <span>TOTAL</span><span>{naira(sale.total_amount)}</span>
                </div>
                <div style={R.paidRow}>
                  <span>Paid ({sale.payment_method})</span>
                  <span>{naira(sale.amount_paid)}</span>
                </div>
                {sale.balance_due > 0 && (
                  <div style={R.balRow}>
                    <span>Balance Due</span><span>{naira(sale.balance_due)}</span>
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div style={{ ...R.center, margin: '12px 0' }}>
                <span style={R.badge}>{statusLabel}</span>
              </div>

              {/* Footer */}
              <div style={R.footer}>
                <div>Thank you for your business!</div>
                <div style={{ marginTop: '4px', fontSize: '10px' }}>Powered by OgaOS</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-5 pb-5 pt-3 border-t border-dash-border shrink-0 space-y-2">

            {/* Generate receipt number if not done yet */}
            {!sale.receipt_number && !receiptGenerated && (
              <button
                onClick={() => receiptMutation.mutate()}
                disabled={receiptMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm border border-white/10 text-muted-foreground hover:bg-dash-hover transition-colors"
              >
                <Download className="w-4 h-4" />
                {receiptMutation.isPending ? 'Generating…' : 'Generate Receipt Number'}
              </button>
            )}

            {/* Print */}
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white text-sm transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>

            {/* Email */}
            {customerEmail ? (
              <button
                onClick={handleEmailReceipt}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm border border-dash-border text-foreground hover:bg-dash-hover transition-colors"
              >
                <Mail className="w-4 h-4" /> Email to {customerEmail}
              </button>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-1">
                No email on file — add one to the customer to enable email receipts
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}