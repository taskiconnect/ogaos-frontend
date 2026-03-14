'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createInvoice } from '@/lib/api/finance'
import { listCustomers } from '@/lib/api/business'
import { X, Plus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreateInvoiceRequest, CreateInvoiceItemRequest } from '@/lib/api/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PAYMENT_TERMS = ['Net 7', 'Net 15', 'Net 30', 'Net 60', 'Due on receipt']

function today() {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}
function addDays(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}

export default function CreateInvoiceModal({ open, onOpenChange, onSuccess }: Props) {
  const [customerId, setCustomerId]     = useState('')
  const [custSearch, setCustSearch]     = useState('')
  const [issueDate, setIssueDate]       = useState(today())
  const [dueDate, setDueDate]           = useState(addDays(30))
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [notes, setNotes]               = useState('')
  const [vatRate, setVatRate]           = useState(0)
  const [vatInclusive, setVatInclusive] = useState(false)
  const [items, setItems]               = useState<{ description: string; qty: string; unitPrice: string; discount: string }[]>([
    { description: '', qty: '1', unitPrice: '', discount: '0' }
  ])
  const [error, setError] = useState('')

  const { data: custData } = useQuery({
    queryKey: ['customers-search', custSearch],
    queryFn: () => listCustomers({ search: custSearch, limit: 10 }),
    enabled: custSearch.length > 0,
  })
  const customers = custData?.data ?? []

  const mut = useMutation({
    mutationFn: (req: CreateInvoiceRequest) => createInvoice(req),
    onSuccess: () => { onSuccess(); onOpenChange(false); reset() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to create invoice'),
  })

  function reset() {
    setCustomerId(''); setCustSearch(''); setIssueDate(today()); setDueDate(addDays(30))
    setPaymentTerms('Net 30'); setNotes(''); setVatRate(0); setVatInclusive(false)
    setItems([{ description: '', qty: '1', unitPrice: '', discount: '0' }]); setError('')
  }

  function addItem() { setItems(p => [...p, { description: '', qty: '1', unitPrice: '', discount: '0' }]) }
  function removeItem(i: number) { setItems(p => p.filter((_, idx) => idx !== i)) }
  function updateItem(i: number, field: string, val: string) {
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  // Calculate totals (in naira for display, kobo for submission)
  const lineItems = items.map(it => ({
    qty: parseFloat(it.qty) || 0,
    price: parseFloat(it.unitPrice) || 0,
    disc: parseFloat(it.discount) || 0,
    line: ((parseFloat(it.unitPrice) || 0) * (parseFloat(it.qty) || 0)) - (parseFloat(it.discount) || 0),
  }))
  const subTotal = lineItems.reduce((s, l) => s + l.line, 0)
  const vatAmt   = subTotal * (vatRate / 100)
  const total    = subTotal + vatAmt

  function handleSubmit() {
    setError('')
    if (!issueDate || !dueDate) { setError('Issue and due dates are required'); return }
    const validItems = items.filter(it => it.description.trim() && parseFloat(it.unitPrice) > 0)
    if (validItems.length === 0) { setError('Add at least one item with a price'); return }

    const req: CreateInvoiceRequest = {
      customer_id: customerId || undefined,
      issue_date: issueDate,
      due_date: dueDate,
      payment_terms: paymentTerms || undefined,
      notes: notes || undefined,
      vat_rate: vatRate,
      vat_inclusive: vatInclusive,
      items: validItems.map(it => ({
        description: it.description,
        unit_price: Math.round(parseFloat(it.unitPrice) * 100),
        quantity: parseFloat(it.qty) || 1,
        discount: Math.round(parseFloat(it.discount) * 100),
      } as CreateInvoiceItemRequest)),
    }
    mut.mutate(req)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">New Invoice</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Customer */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer (optional)</label>
            <input value={custSearch} onChange={e => { setCustSearch(e.target.value); setCustomerId('') }}
              placeholder="Search customer name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
            {customers.length > 0 && !customerId && (
              <div className="mt-1 bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden">
                {customers.map((c: any) => (
                  <button key={c.id} onClick={() => { setCustomerId(c.id); setCustSearch(`${c.first_name} ${c.last_name}`) }}
                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    {c.first_name} {c.last_name}
                    {c.phone_number && <span className="text-gray-500 ml-2 text-xs">{c.phone_number}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Issue Date</label>
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25" />
            </div>
          </div>

          {/* Payment terms */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Terms</label>
            <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
              {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</label>
              <button onClick={addItem} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-semibold">
                <Plus className="w-3 h-3" /> Add item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                  <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                    placeholder="Description..."
                    className="w-full bg-transparent border-b border-white/10 pb-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase">Qty</span>
                      <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none mt-1" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase">Unit Price (₦)</span>
                      <input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none mt-1" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase">Discount (₦)</span>
                      <input type="number" min="0" value={item.discount} onChange={e => updateItem(i, 'discount', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">
                      Line total: <span className="text-white font-semibold">
                        ₦{lineItems[i]?.line.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </span>
                    </span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VAT */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">VAT Rate (%)</label>
              <input type="number" min="0" max="100" value={vatRate} onChange={e => setVatRate(parseFloat(e.target.value)||0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={() => setVatInclusive(v => !v)}
                className={cn('w-10 h-6 rounded-full border transition-all relative', vatInclusive ? 'bg-primary border-primary' : 'bg-white/5 border-white/20')}>
                <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', vatInclusive ? 'left-4' : 'left-0.5')} />
              </button>
              <span className="text-xs text-gray-400">VAT inclusive</span>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span><span>₦{subTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            {vatRate > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>VAT ({vatRate}%)</span><span>₦{vatAmt.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
              <span>Total</span><span>₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Payment instructions, terms, etc."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25 resize-none" />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={mut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Invoice'}
          </button>

        </div>
      </div>
    </div>
  )
}
