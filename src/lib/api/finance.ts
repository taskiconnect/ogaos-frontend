// src/lib/api/finance.ts
import api from './client'
import type { ApiSuccess, ApiMessage, ApiCursorList } from './types'
import type {
  Sale, CreateSaleRequest, SaleListParams,
  Invoice, CreateInvoiceRequest, InvoiceListParams,
  Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseMonthlySummary, ExpenseListParams,
  Debt, CreateDebtRequest, RecordDebtPaymentRequest, DebtListParams,
} from './types'

// ─── Sales ────────────────────────────────────────────────────────────────────

export const createSale = (data: CreateSaleRequest) =>
  api.post<ApiSuccess<Sale>>('/sales', data).then((r) => r.data.data)

// listSales wraps the page/limit backend response into ApiCursorList shape
// so it works with useInfiniteQuery on the sales page.
export const listSales = async (params?: SaleListParams): Promise<ApiCursorList<Sale>> => {
  const p: Record<string, unknown> = { ...params }
  if (p.date_from && typeof p.date_from === 'string' && p.date_from.length === 10) {
    p.date_from = `${p.date_from}T00:00:00Z`
  }
  if (p.date_to && typeof p.date_to === 'string' && p.date_to.length === 10) {
    p.date_to = `${p.date_to}T23:59:59Z`
  }
  if (p.cursor && typeof p.cursor === 'string') {
    p.page = parseInt(p.cursor, 10) || 1
    delete p.cursor
  }

  const res = await api.get<{
    success: boolean
    data:    Sale[]
    meta:    { total: number; page: number; limit: number }
  }>('/sales', { params: p })

  const sales   = res.data.data ?? []
  const meta    = res.data.meta  ?? { page: 1, limit: 20, total: 0 }
  const hasMore = sales.length >= meta.limit

  return {
    success:     true,
    data:        sales,
    next_cursor: hasMore ? String(meta.page + 1) : null,
  }
}

export const getSale = (id: string) =>
  api.get<ApiSuccess<Sale>>(`/sales/${id}`).then((r) => r.data.data)

// cancelSale marks a sale as cancelled without deleting it.
// The backend reverses stock, customer stats, debt, and ledger in one transaction.
// An optional reason is recorded in the sale's notes for the audit trail.
export const cancelSale = (id: string, reason?: string) =>
  api
    .patch<ApiSuccess<Sale>>(`/sales/${id}/cancel`, { reason: reason ?? '' })
    .then((r) => r.data.data)

export const generateReceipt = (id: string) =>
  api.post<ApiSuccess<Sale>>(`/sales/${id}/receipt`).then((r) => r.data.data)

export interface RecordSalePaymentRequest {
  amount:          number
  payment_method?: string
  note?:           string
}
export const recordSalePayment = (id: string, data: RecordSalePaymentRequest) =>
  api.post<ApiSuccess<Sale>>(`/sales/${id}/payment`, data).then((r) => r.data.data)

// getSalesSummary fetches aggregated totals for a given month.
// Cancelled sales are excluded at the backend via status != 'cancelled'.
// Falls back gracefully by computing totals client-side if the endpoint
// isn't available yet.
export interface SalesMonthlySummary {
  year:             number
  month:            number
  total_revenue:    number   // kobo, cancelled sales excluded
  total_sales:      number   // count, cancelled sales excluded
  unique_customers: number
}

export const getSalesSummary = async (
  year: number,
  month: number,
): Promise<SalesMonthlySummary> => {
  try {
    const res = await api.get<ApiSuccess<SalesMonthlySummary>>('/sales/summary', {
      params: { year, month },
    })
    return res.data.data
  } catch {
    // Fallback: derive from the list, excluding cancelled sales
    const monthStr  = String(month).padStart(2, '0')
    const date_from = `${year}-${monthStr}-01T00:00:00Z`
    const date_to   = `${year}-${monthStr}-31T23:59:59Z`

    const res = await api.get<{
      success: boolean
      data:    Sale[]
      meta:    { total: number; page: number; limit: number }
    }>('/sales', { params: { date_from, date_to, limit: 500 } })

    const sales = (res.data.data ?? []).filter(s => s.status !== 'cancelled')
    const uniqueCustomers = new Set(
      sales.filter((s) => s.customer_id).map((s) => s.customer_id)
    ).size

    return {
      year,
      month,
      total_revenue:    sales.reduce((sum, s) => sum + s.total_amount, 0),
      total_sales:      sales.length,
      unique_customers: uniqueCustomers,
    }
  }
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const createInvoice = (data: CreateInvoiceRequest) =>
  api.post<ApiSuccess<Invoice>>('/invoices', data).then((r) => r.data.data)

export const listInvoices = (params?: InvoiceListParams) =>
  api.get<ApiCursorList<Invoice>>('/invoices', { params }).then((r) => r.data)

export const getInvoice = (id: string) =>
  api.get<ApiSuccess<Invoice>>(`/invoices/${id}`).then((r) => r.data.data)

export const sendInvoice = (id: string) =>
  api.post<ApiSuccess<Invoice>>(`/invoices/${id}/send`).then((r) => r.data.data)

export const recordInvoicePayment = (id: string, amount: number) =>
  api.post<ApiSuccess<Invoice>>(`/invoices/${id}/payment`, { amount }).then((r) => r.data.data)

export const cancelInvoice = (id: string) =>
  api.delete<ApiMessage>(`/invoices/${id}`).then(() => undefined)

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const createExpense = (data: CreateExpenseRequest) =>
  api.post<ApiSuccess<Expense>>('/expenses', data).then((r) => r.data.data)

export const listExpenses = (params?: ExpenseListParams) =>
  api.get<ApiCursorList<Expense>>('/expenses', { params }).then((r) => r.data)

export const getExpense = (id: string) =>
  api.get<ApiSuccess<Expense>>(`/expenses/${id}`).then((r) => r.data.data)

export const updateExpense = (id: string, data: UpdateExpenseRequest) =>
  api.patch<ApiSuccess<Expense>>(`/expenses/${id}`, data).then((r) => r.data.data)

export const deleteExpense = (id: string) =>
  api.delete<ApiMessage>(`/expenses/${id}`).then(() => undefined)

export const getExpenseSummary = (year: number, month: number) =>
  api
    .get<ApiSuccess<ExpenseMonthlySummary>>('/expenses/summary', { params: { year, month } })
    .then((r) => r.data.data)

// ─── Debts ────────────────────────────────────────────────────────────────────

export const createDebt = (data: CreateDebtRequest) =>
  api.post<ApiSuccess<Debt>>('/debts', data).then((r) => r.data.data)

export const listDebts = (params?: DebtListParams) =>
  api.get<ApiCursorList<Debt>>('/debts', { params }).then((r) => r.data)

export const getDebt = (id: string) =>
  api.get<ApiSuccess<Debt>>(`/debts/${id}`).then((r) => r.data.data)

export const recordDebtPayment = (id: string, data: RecordDebtPaymentRequest) =>
  api.post<ApiSuccess<Debt>>(`/debts/${id}/payment`, data).then((r) => r.data.data)