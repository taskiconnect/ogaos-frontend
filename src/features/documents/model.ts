import type { Business, Invoice, Sale } from '@/lib/api/types'
export type DocumentModel = {
  kind: 'invoice' | 'receipt' | 'statement'
  reference: string
  date: string
  dueDate?: string
  business: { name: string; logo?: string | null; address?: string; contact?: string }
  customer: { name: string; email?: string | null; phone?: string | null }
  status: string
  currency: string
  items: { description: string; quantity: number; unitPrice: number; total: number }[]
  subtotal: number
  discount: number
  vat: number
  vatRate: number
  vatInclusive: boolean
  wht: number
  total: number
  paid: number
  balance: number
  notes?: string | null
  terms?: string | null
  paymentMethod?: string
}
type Identity = Partial<Business> | null | undefined
function identity(b: Identity) {
  return {
    name: b?.name || 'Business',
    logo: b?.logo_url,
    address: [b?.street, b?.city_town, b?.state, b?.country].filter(Boolean).join(', '),
    contact: b?.website_url || undefined,
  }
}
export function saleDocument(sale: Sale, business?: Identity): DocumentModel {
  return {
    kind:
      sale.status !== 'cancelled' && sale.amount_paid > 0 && sale.receipt_number
        ? 'receipt'
        : 'statement',
    reference: sale.receipt_number || sale.sale_number,
    date: sale.created_at,
    business: identity(business),
    customer: {
      name: sale.customer
        ? `${sale.customer.first_name} ${sale.customer.last_name}`.trim()
        : 'Walk-in customer',
      email: sale.customer?.email,
      phone: sale.customer?.phone_number,
    },
    status:
      sale.status === 'cancelled'
        ? 'Cancelled'
        : sale.balance_due === 0
          ? 'Paid in full'
          : sale.amount_paid > 0
            ? 'Part payment'
            : 'Awaiting payment',
    currency: 'NGN',
    items: (sale.items ?? []).map((i) => ({
      description: i.product_name,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      total: i.total_price,
    })),
    subtotal: sale.sub_total + sale.discount_amount,
    discount: sale.discount_amount,
    vat: sale.vat_amount,
    vatRate: sale.vat_rate,
    vatInclusive: sale.vat_inclusive,
    wht: sale.wht_amount,
    total: sale.total_amount,
    paid: sale.amount_paid,
    balance: sale.balance_due,
    notes: sale.notes,
    paymentMethod: sale.payment_method,
  }
}
export function invoiceDocument(invoice: Invoice, business?: Identity): DocumentModel {
  return {
    kind: 'invoice',
    reference: invoice.invoice_number,
    date: invoice.issue_date,
    dueDate: invoice.due_date,
    business: identity(business),
    customer: {
      name: invoice.customer
        ? `${invoice.customer.first_name} ${invoice.customer.last_name}`.trim()
        : 'Customer',
      email: invoice.customer?.email,
      phone: invoice.customer?.phone_number,
    },
    status: invoice.status,
    currency: invoice.currency || 'NGN',
    items: (invoice.items ?? []).map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      total: i.total_price,
    })),
    subtotal: invoice.sub_total,
    discount: invoice.discount_amount,
    vat: invoice.vat_amount,
    vatRate: invoice.vat_rate,
    vatInclusive: invoice.vat_inclusive,
    wht: invoice.wht_amount,
    total: invoice.total_amount,
    paid: invoice.amount_paid,
    balance: invoice.balance_due,
    notes: invoice.notes,
    terms: invoice.payment_terms,
  }
}
