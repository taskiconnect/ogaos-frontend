// src/lib/hooks/useDashboard.ts
// Key fix: "Outstanding Debts" on dashboard now comes from sales with balance_due > 0
// (partial/pending sales), NOT from the /debts endpoint which requires a separate
// manual debt record. This matches what the user expects: when a sale has unpaid balance,
// it should show on the dashboard immediately.
import { useQueries } from '@tanstack/react-query'
import { listSales } from '@/lib/api/finance'
import { listCustomers } from '@/lib/api/business'
import type { Sale, Customer } from '@/lib/api/types'

export const fromKobo = (kobo: number) => Math.round(kobo / 100)

export const formatNaira = (kobo: number) =>
  `₦${fromKobo(kobo).toLocaleString('en-NG')}`

function todayNg(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
}

export interface MonthlyRevenue {
  month:    string
  revenue:  number  // naira
  expenses: number  // always 0 until expense chart is wired
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

export interface DashboardData {
  // KPI cards
  todaySalesTotal:      number   // naira
  todaySalesCount:      number
  outstandingDebtTotal: number   // naira — sum of balance_due on unpaid/partial sales
  outstandingDebtCount: number   // number of sales with balance still owed
  totalCustomers:       number

  // Widget data
  recentSales:     Sale[]
  topCustomers:    Customer[]
  monthlyRevenue:  MonthlyRevenue[]

  isLoading: boolean
  isError:   boolean
  refetch:   () => void
}

export function useDashboard(): DashboardData {
  const today = todayNg()

  const results = useQueries({
    queries: [
      // [0] Today's sales for KPI card
      {
        queryKey: ['sales', 'today', today],
        queryFn:  () => listSales({ date_from: today, date_to: today, limit: 100 }),
        staleTime: 1000 * 60 * 2,
      },
      // [1] Recent sales for RecentTransactions widget
      {
        queryKey: ['sales', 'recent'],
        queryFn:  () => listSales({ limit: 8 }),
        staleTime: 1000 * 60 * 2,
      },
      // [2] Partial/pending sales — for outstanding balance KPI
      // These are sales where customer has not paid in full
      {
        queryKey: ['sales', 'unpaid'],
        queryFn:  () => listSales({ status: 'partial', limit: 100 }),
        staleTime: 1000 * 60 * 3,
      },
      // [3] Top customers for widget
      {
        queryKey: ['customers', 'top'],
        queryFn:  () => listCustomers({ limit: 5 }),
        staleTime: 1000 * 60 * 5,
      },
      // [4] Full year sales for revenue chart
      {
        queryKey: ['sales', 'year-chart'],
        queryFn:  () => {
          const yearStart = `${new Date().getFullYear()}-01-01`
          return listSales({ date_from: yearStart, limit: 200 })
        },
        staleTime: 1000 * 60 * 10,
      },
    ],
  })

  const [todaySalesQ, recentSalesQ, unpaidSalesQ, customersQ, yearSalesQ] = results

  const isLoading = results.some(r => r.isLoading)
  const isError   = results.some(r => r.isError)

  // Today's revenue
  const todaySalesList  = todaySalesQ.data?.data ?? []
  const todaySalesTotal = fromKobo(
    todaySalesList
      .filter(s => s.status !== 'cancelled')
      .reduce((s, x) => s + (x.amount_paid ?? x.total_amount), 0)
  )
  const todaySalesCount = todaySalesList.filter(s => s.status !== 'cancelled').length

  // Outstanding balance = sum of balance_due on partial/pending sales
  // This shows money customers still owe from sales (not manual debt records)
  const unpaidSales        = unpaidSalesQ.data?.data ?? []
  const outstandingDebtTotal = fromKobo(
    unpaidSales.reduce((s, x) => s + (x.balance_due ?? 0), 0)
  )
  const outstandingDebtCount = unpaidSales.filter(s => (s.balance_due ?? 0) > 0).length

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
    isLoading,
    isError,
    refetch,
  }
}
