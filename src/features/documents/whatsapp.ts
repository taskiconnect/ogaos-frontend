import type { Sale } from '@/lib/api/types'

const naira = (kobo: number) =>
  `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Converts Nigerian-style numbers to wa.me format (digits only, country code first). */
export function toWhatsAppNumber(raw?: string | null): string | null {
  if (!raw) return null
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('0')) d = '234' + d.slice(1) // 0803... -> 234803...
  else if (d.length === 10) d = '234' + d // 803... -> 234803...
  return d.length >= 11 ? d : null
}

export function buildReceiptText(sale: Sale, businessName?: string): string {
  const date = new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(sale.created_at))

  const lines: string[] = []
  if (businessName) lines.push(`*${businessName}*`)
  lines.push(sale.receipt_number ? `Receipt: ${sale.receipt_number}` : `Sale: ${sale.sale_number}`)
  lines.push(date, '')

  lines.push('*Items*')
  for (const it of sale.items ?? []) {
    lines.push(`• ${it.product_name}`)
    lines.push(
      `   ${naira(it.unit_price)} × ${it.quantity}` +
        (it.discount > 0 ? ` (− ${naira(it.discount)})` : '') +
        ` = ${naira(it.total_price)}`,
    )
  }
  lines.push('')

  lines.push(`Subtotal: ${naira(sale.sub_total)}`)
  if (sale.discount_amount > 0) lines.push(`Discount: − ${naira(sale.discount_amount)}`)
  if (sale.vat_amount > 0) lines.push(`VAT (${sale.vat_rate}%): ${naira(sale.vat_amount)}`)
  lines.push(`*Total: ${naira(sale.total_amount)}*`)
  lines.push(`Paid: ${naira(sale.amount_paid)}`)
  if (sale.balance_due > 0) lines.push(`*Balance due: ${naira(sale.balance_due)}*`)
  lines.push('', `Payment: ${sale.payment_method}`, '', 'Thank you for your patronage!')

  return lines.join('\n')
}

export function whatsappUrl(sale: Sale, businessName?: string): string {
  const phone = toWhatsAppNumber(sale.customer?.phone_number)
  const text = encodeURIComponent(buildReceiptText(sale, businessName))
  return `https://wa.me/${phone ?? ''}?text=${text}`
}