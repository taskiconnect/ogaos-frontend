import type { Debt, Sale } from '@/lib/api/types'
export function saleAsDebt(sale: Sale): Debt {
  return {
    id: sale.id,
    business_id: sale.business_id,
    direction: 'receivable',
    customer_id: sale.customer_id,
    supplier_name: null,
    supplier_phone: null,
    description: `Balance from sale ${sale.sale_number}`,
    total_amount: sale.total_amount,
    amount_paid: sale.amount_paid,
    amount_due: sale.balance_due,
    due_date: null,
    status: sale.amount_paid > 0 ? 'partial' : 'outstanding',
    notes: null,
    recorded_by: sale.recorded_by,
    created_at: sale.created_at,
    updated_at: sale.updated_at,
    customer: sale.customer,
    payment_source: 'sale',
    sale_id: sale.id,
  }
}
/** The original API has no sale_id on Debt. Never treat a debt UUID as a sale UUID. */
export function attachPaymentTarget(debt: Debt, sales: Sale[]): Debt {
  if (!debt.description.startsWith('Balance from sale '))
    return { ...debt, payment_source: 'manual' }
  const number = debt.description.slice('Balance from sale '.length).trim()
  const matches = sales.filter(
    (s) =>
      s.sale_number === number &&
      s.business_id === debt.business_id &&
      s.customer_id === debt.customer_id &&
      s.balance_due === debt.amount_due &&
      s.status !== 'cancelled',
  )
  if (matches.length !== 1) return { ...debt, payment_source: 'unresolved' }
  return { ...debt, payment_source: 'sale', sale_id: matches[0].id }
}
