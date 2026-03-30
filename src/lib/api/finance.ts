import api from './client'
import type { ApiSuccess, ApiMessage, ApiCursorList } from './types'
import type {
  Sale, CreateSaleRequest, SaleListParams,
  Invoice, CreateInvoiceRequest, InvoiceListParams,
  Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseMonthlySummary, ExpenseListParams,
  Debt, CreateDebtRequest, RecordDebtPaymentRequest, DebtListParams,
} from './types'

function handleApiError(error: any): never {
  const status = error?.response?.status
  const data = error?.response?.data

  if (status === 402 && data?.upgrade_required) {
    throw {
      type: 'subscription',
      status,
      ...data,
    }
  }

  throw {
    type: 'api',
    status,
    message: data?.message || 'Something went wrong',
  }
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export const createSale = async (data: CreateSaleRequest, idempotencyKey?: string) => {
  try {
    const res = await api.post<ApiSuccess<Sale>>('/sales', data, {
      headers: idempotencyKey
        ? { 'X-Idempotency-Key': idempotencyKey }
        : undefined,
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

// listSales wraps the page/limit backend response into ApiCursorList shape
// so it works with useInfiniteQuery on the sales page.
export const listSales = async (params?: SaleListParams): Promise<ApiCursorList<Sale>> => {
  try {
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
      data: Sale[]
      meta: { total: number; page: number; limit: number }
    }>('/sales', { params: p })

    const sales = res.data.data ?? []
    const meta = res.data.meta ?? { page: 1, limit: 20, total: 0 }
    const hasMore = sales.length >= meta.limit

    return {
      success: true,
      data: sales,
      next_cursor: hasMore ? String(meta.page + 1) : null,
    }
  } catch (error) {
    handleApiError(error)
  }
}

export const getSale = async (id: string) => {
  try {
    const res = await api.get<ApiSuccess<Sale>>(`/sales/${id}`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

// cancelSale marks a sale as cancelled without deleting it.
// The backend reverses stock, customer stats, debt, and ledger in one transaction.
// An optional reason is recorded in the sale's notes for the audit trail.
export const cancelSale = async (id: string, reason?: string) => {
  try {
    const res = await api.patch<ApiSuccess<Sale>>(`/sales/${id}/cancel`, {
      reason: reason ?? '',
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const generateReceipt = async (id: string) => {
  try {
    const res = await api.post<ApiSuccess<Sale>>(`/sales/${id}/receipt`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export interface RecordSalePaymentRequest {
  amount: number
  payment_method?: string
  note?: string
}

export const recordSalePayment = async (id: string, data: RecordSalePaymentRequest) => {
  try {
    const res = await api.post<ApiSuccess<Sale>>(`/sales/${id}/payment`, data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

// getSalesSummary fetches aggregated totals for a given month.
// Cancelled sales are excluded at the backend via status != 'cancelled'.
// Falls back gracefully by computing totals client-side if the endpoint
// isn't available yet.
export interface SalesMonthlySummary {
  year: number
  month: number
  total_revenue: number
  total_sales: number
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
    const monthStr = String(month).padStart(2, '0')
    const date_from = `${year}-${monthStr}-01T00:00:00Z`
    const date_to = `${year}-${monthStr}-31T23:59:59Z`

    const res = await api.get<{
      success: boolean
      data: Sale[]
      meta: { total: number; page: number; limit: number }
    }>('/sales', { params: { date_from, date_to, limit: 500 } })

    const sales = (res.data.data ?? []).filter((s) => s.status !== 'cancelled')
    const uniqueCustomers = new Set(
      sales.filter((s) => s.customer_id).map((s) => s.customer_id)
    ).size

    return {
      year,
      month,
      total_revenue: sales.reduce((sum, s) => sum + s.total_amount, 0),
      total_sales: sales.length,
      unique_customers: uniqueCustomers,
    }
  }
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const createInvoice = async (data: CreateInvoiceRequest) => {
  try {
    const res = await api.post<ApiSuccess<Invoice>>('/invoices', data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const listInvoices = async (params?: InvoiceListParams) => {
  try {
    const res = await api.get<ApiCursorList<Invoice>>('/invoices', { params })
    return res.data
  } catch (error) {
    handleApiError(error)
  }
}

export const getInvoice = async (id: string) => {
  try {
    const res = await api.get<ApiSuccess<Invoice>>(`/invoices/${id}`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const sendInvoice = async (id: string) => {
  try {
    const res = await api.post<ApiSuccess<Invoice>>(`/invoices/${id}/send`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const recordInvoicePayment = async (id: string, amount: number) => {
  try {
    const res = await api.post<ApiSuccess<Invoice>>(`/invoices/${id}/payment`, { amount })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const cancelInvoice = async (id: string) => {
  try {
    await api.delete<ApiMessage>(`/invoices/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const createExpense = async (data: CreateExpenseRequest) => {
  try {
    const res = await api.post<ApiSuccess<Expense>>('/expenses', data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const listExpenses = async (params?: ExpenseListParams) => {
  try {
    const res = await api.get<ApiCursorList<Expense>>('/expenses', { params })
    return res.data
  } catch (error) {
    handleApiError(error)
  }
}

export const getExpense = async (id: string) => {
  try {
    const res = await api.get<ApiSuccess<Expense>>(`/expenses/${id}`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const updateExpense = async (id: string, data: UpdateExpenseRequest) => {
  try {
    const res = await api.patch<ApiSuccess<Expense>>(`/expenses/${id}`, data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const deleteExpense = async (id: string) => {
  try {
    await api.delete<ApiMessage>(`/expenses/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}

export const getExpenseSummary = async (year: number, month: number) => {
  try {
    const res = await api.get<ApiSuccess<ExpenseMonthlySummary>>('/expenses/summary', {
      params: { year, month },
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

// ─── Debts ────────────────────────────────────────────────────────────────────

export const createDebt = async (data: CreateDebtRequest) => {
  try {
    const res = await api.post<ApiSuccess<Debt>>('/debts', data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const listDebts = async (params?: DebtListParams) => {
  try {
    const res = await api.get<ApiCursorList<Debt>>('/debts', { params })
    return res.data
  } catch (error) {
    handleApiError(error)
  }
}

export const getDebt = async (id: string) => {
  try {
    const res = await api.get<ApiSuccess<Debt>>(`/debts/${id}`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const recordDebtPayment = async (id: string, data: RecordDebtPaymentRequest) => {
  try {
    const res = await api.post<ApiSuccess<Debt>>(`/debts/${id}/payment`, data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}