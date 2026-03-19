// src/lib/hooks/useDashboard.ts
import { useQueries } from '@tanstack/react-query'
import { listSales, listDebts } from '@/lib/api/finance'
import { listCustomers } from '@/lib/api/business'
import type { Sale, Customer, Debt } from '@/lib/api/types'

export const fromKobo = (kobo: number) => Math.round(kobo / 100)

export const formatNaira = (kobo: number) =>
  `₦${fromKobo(kobo).toLocaleString('en-NG')}`

function todayNg(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
}

export interface MonthlyRevenue {
  month:    string
  revenue:  number
  expenses: number
}

function aggregateMonthly(sales: Sale[]): MonthlyRevenue[] {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const map: Record<number, number> = {}
  for (const s of sales) {
    if (s.status === 'cancelled') continue
    const m = new Date(s.created_at).getMonth()
    map[m] = (map[m] ?? 0) + (s.amount_paid ?? s.total_amount)
  }
  return MONTHS.map((month, i) => ({
    month,
    revenue:  fromKobo(map[i] ?? 0),
    expenses: 0,
  }))
}

// Convert a partial Sale into a Debt shape so OutstandingDebts widget can display it.
// This handles cases where no debt record was auto-created (e.g. walk-in customers).
function saleToDebt(sale: Sale): Debt {
  return {
    id:            sale.id,
    business_id:   sale.business_id,
    direction:     'receivable',
    customer_id:   sale.customer_id,
    supplier_name: null,
    supplier_phone: null,
    description:   `Balance from sale ${sale.sale_number}`,
    total_amount:  sale.total_amount,
    amount_paid:   sale.amount_paid,
    amount_due:    sale.balance_due,
    due_date:      null,
    status:        'outstanding',
    notes:         null,
    recorded_by:   sale.recorded_by,
    created_at:    sale.created_at,
    updated_at:    sale.updated_at,
    customer:      sale.customer,
  }
}

export interface DashboardData {
  todaySalesTotal:      number
  todaySalesCount:      number
  outstandingDebtTotal: number
  outstandingDebtCount: number
  totalCustomers:       number
  recentSales:          Sale[]
  topCustomers:         Customer[]
  monthlyRevenue:       MonthlyRevenue[]
  overdueDebts:         Debt[]
  isLoading:            boolean
  isError:              boolean
  refetch:              () => void
}

export function useDashboard(): DashboardData {
  const today = todayNg()

  const results = useQueries({
    queries: [
      // [0] Today's sales — KPI card
      {
        queryKey: ['sales', 'today', today],
        queryFn:  () => listSales({ date_from: today, date_to: today, limit: 100 }),
        staleTime: 1000 * 60 * 2,
      },
      // [1] Recent sales — RecentTransactions widget
      {
        queryKey: ['sales', 'recent'],
        queryFn:  () => listSales({ limit: 8 }),
        staleTime: 1000 * 60 * 2,
      },
      // [2] Partial/unpaid sales — both for KPI and OutstandingDebts widget
      {
        queryKey: ['sales', 'unpaid'],
        queryFn:  () => listSales({ status: 'partial', limit: 20 }),
        staleTime: 1000 * 60 * 3,
      },
      // [3] Top customers
      {
        queryKey: ['customers', 'top'],
        queryFn:  () => listCustomers({ limit: 5 }),
        staleTime: 1000 * 60 * 5,
      },
      // [4] Full year sales — RevenueChart
      {
        queryKey: ['sales', 'year-chart'],
        queryFn:  () => {
          const yearStart = `${new Date().getFullYear()}-01-01`
          return listSales({ date_from: yearStart, limit: 200 })
        },
        staleTime: 1000 * 60 * 10,
      },
      // [5] Manual receivable debts (recorded via Debts page)
      {
        queryKey: ['debts', 'dashboard'],
        queryFn:  () => listDebts({ direction: 'receivable', limit: 10 }),
        staleTime: 1000 * 60 * 3,
      },
    ],
  })

  const [todaySalesQ, recentSalesQ, unpaidSalesQ, customersQ, yearSalesQ, debtsQ] = results

  const isLoading = results.some(r => r.isLoading)
  const isError   = results.some(r => r.isError)

  // KPI: today's revenue
  const todaySalesList  = todaySalesQ.data?.data ?? []
  const todaySalesTotal = fromKobo(
    todaySalesList
      .filter(s => s.status !== 'cancelled')
      .reduce((s, x) => s + (x.amount_paid ?? x.total_amount), 0)
  )
  const todaySalesCount = todaySalesList.filter(s => s.status !== 'cancelled').length

  // Unpaid sales with balance remaining
  const unpaidSales = (unpaidSalesQ.data?.data ?? []).filter(s => (s.balance_due ?? 0) > 0)

  // KPI: total outstanding from partial sales
  const outstandingDebtTotal = fromKobo(unpaidSales.reduce((s, x) => s + (x.balance_due ?? 0), 0))
  const outstandingDebtCount = unpaidSales.length

  // Manual debt records from /debts endpoint
  const manualDebts = debtsQ.data?.data ?? []

  // Combine: convert partial sales to Debt shape + manual debts
  // Deduplicate: a sale auto-creates a debt record, so if a sale's ID appears
  // in both lists we prefer the actual debt record.
  const debtSaleIds = new Set(
    manualDebts
      .map(d => d.description)
      .filter(desc => desc?.startsWith('Balance from sale '))
      .map(desc => desc.replace('Balance from sale ', ''))
  )

  const saleDerivedDebts = unpaidSales
    .filter(s => !debtSaleIds.has(s.sale_number))
    .map(saleToDebt)

  // Show manual debts first, then sale-derived ones, limit to 8 for the widget
  const overdueDebts = [...manualDebts, ...saleDerivedDebts].slice(0, 8)

  const monthlyRevenue = aggregateMonthly(yearSalesQ.data?.data ?? [])

  function refetch() { results.forEach(r => r.refetch()) }

  return {
    todaySalesTotal,
    todaySalesCount,
    outstandingDebtTotal,
    outstandingDebtCount,
    totalCustomers: (customersQ.data as any)?.total_count ?? customersQ.data?.data?.length ?? 0,
    recentSales:    recentSalesQ.data?.data ?? [],
    topCustomers:   customersQ.data?.data ?? [],
    monthlyRevenue,
    overdueDebts,
    isLoading,
    isError,
    refetch,
  }
}
