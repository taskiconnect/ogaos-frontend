// src/lib/api/finance.ts
import api from './client'
import type {
  ApiSuccess, ApiMessage, ApiCursorList,
  Sale, CreateSaleRequest, SaleListParams,
  Invoice, CreateInvoiceRequest, InvoiceListParams,
  Expense, CreateExpenseRequest, UpdateExpenseRequest,
  ExpenseMonthlySummary, ExpenseListParams,
  Debt, CreateDebtRequest, RecordDebtPaymentRequest, DebtListParams,
} from './types'

// ─── Sales ────────────────────────────────────────────────────────────────────

export const createSale = (data: CreateSaleRequest) =>
  api.post<ApiSuccess<Sale>>('/sales', data).then(r => r.data.data)

export const listSales = (params?: SaleListParams) =>
  api.get<ApiCursorList<Sale>>('/sales', { params }).then(r => r.data)

export const getSale = (id: string) =>
  api.get<ApiSuccess<Sale>>(`/sales/${id}`).then(r => r.data.data)

// sendEmail=true → backend also emails the receipt to the customer
export const generateReceipt = (id: string, sendEmail = false) =>
  api
    .post<ApiSuccess<Sale>>(
      `/sales/${id}/receipt`,
      {},
      sendEmail ? { params: { send_email: 'true' } } : undefined,
    )
    .then(r => r.data.data)

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const createInvoice  = (data: CreateInvoiceRequest) =>
  api.post<ApiSuccess<Invoice>>('/invoices', data).then(r => r.data.data)

export const listInvoices   = (params?: InvoiceListParams) =>
  api.get<ApiCursorList<Invoice>>('/invoices', { params }).then(r => r.data)

export const getInvoice     = (id: string) =>
  api.get<ApiSuccess<Invoice>>(`/invoices/${id}`).then(r => r.data.data)

export const sendInvoice    = (id: string) =>
  api.post<ApiSuccess<Invoice>>(`/invoices/${id}/send`).then(r => r.data.data)

export const recordInvoicePayment = (id: string, amount: number) =>
  api.post<ApiSuccess<Invoice>>(`/invoices/${id}/payment`, { amount }).then(r => r.data.data)

export const cancelInvoice  = (id: string) =>
  api.delete<ApiMessage>(`/invoices/${id}`).then(() => undefined)

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const createExpense  = (data: CreateExpenseRequest) =>
  api.post<ApiSuccess<Expense>>('/expenses', data).then(r => r.data.data)

export const listExpenses   = (params?: ExpenseListParams) =>
  api.get<ApiCursorList<Expense>>('/expenses', { params }).then(r => r.data)

export const getExpense     = (id: string) =>
  api.get<ApiSuccess<Expense>>(`/expenses/${id}`).then(r => r.data.data)

export const updateExpense  = (id: string, data: UpdateExpenseRequest) =>
  api.patch<ApiSuccess<Expense>>(`/expenses/${id}`, data).then(r => r.data.data)

export const deleteExpense  = (id: string) =>
  api.delete<ApiMessage>(`/expenses/${id}`).then(() => undefined)

export const getExpenseSummary = (year: number, month: number) =>
  api.get<ApiSuccess<ExpenseMonthlySummary>>('/expenses/summary', { params: { year, month } })
    .then(r => r.data.data)

// ─── Debts ────────────────────────────────────────────────────────────────────

export const createDebt      = (data: CreateDebtRequest) =>
  api.post<ApiSuccess<Debt>>('/debts', data).then(r => r.data.data)

export const listDebts       = (params?: DebtListParams) =>
  api.get<ApiCursorList<Debt>>('/debts', { params }).then(r => r.data)

export const getDebt         = (id: string) =>
  api.get<ApiSuccess<Debt>>(`/debts/${id}`).then(r => r.data.data)

export const recordDebtPayment = (id: string, data: RecordDebtPaymentRequest) =>
  api.post<ApiSuccess<Debt>>(`/debts/${id}/payment`, data).then(r => r.data.data)
