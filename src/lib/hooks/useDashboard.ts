// src/lib/hooks/useDashboard.ts
import { useQueries } from '@tanstack/react-query'
import { listSales, listDebts } from '@/lib/api/finance'
import { listCustomers } from '@/lib/api/business'
import type { Sale, Debt, Customer } from '@/lib/api/types'

export const fromKobo = (kobo: number) => Math.round(kobo / 100)

export const formatNaira = (kobo: number) =>
  `₦${fromKobo(kobo).toLocaleString('en-NG')}`

function todayNg(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
}

export interface MonthlyRevenue {
  month:    string
  revenue:  number  // naira
  expenses: number  // naira
}

function aggregateMonthly(sales: Sale[]): MonthlyRevenue[] {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const map: Record<number, number> = {}
  for (const s of sales) {
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
  todaySalesTotal:      number
  todaySalesCount:      number
  outstandingDebtTotal: number
  outstandingDebtCount: number
  totalCustomers:       number
  recentSales:          Sale[]
  overdueDebts:         Debt[]
  topCustomers:         Customer[]
  monthlyRevenue:       MonthlyRevenue[]
  isLoading:            boolean
  isError:              boolean
  refetch:              () => void
}

export function useDashboard(): DashboardData {
  const today = todayNg()

  const results = useQueries({
    queries: [
      {
        queryKey: ['sales', 'today', today],
        queryFn:  () => listSales({ date_from: today, date_to: today, limit: 100 }),
        staleTime: 1000 * 60 * 2,
      },
      {
        queryKey: ['sales', 'recent'],
        queryFn:  () => listSales({ limit: 8 }),
        staleTime: 1000 * 60 * 2,
      },
      {
        queryKey: ['debts', 'outstanding'],
        queryFn:  () => listDebts({ status: 'outstanding', limit: 5 }),
        staleTime: 1000 * 60 * 3,
      },
      {
        queryKey: ['customers', 'top'],
        queryFn:  () => listCustomers({ limit: 5 }),
        staleTime: 1000 * 60 * 5,
      },
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

  const [todaySalesQ, recentSalesQ, debtsQ, customersQ, yearSalesQ] = results

  const isLoading = results.some(r => r.isLoading)
  const isError   = results.some(r => r.isError)

  const todaySalesList     = todaySalesQ.data?.data ?? []
  const todaySalesTotal    = fromKobo(todaySalesList
    .filter(s => s.status !== 'cancelled')
    .reduce((s, x) => s + (x.amount_paid ?? x.total_amount), 0))
  const todaySalesCount    = todaySalesList.filter(s => s.status !== 'cancelled').length

  const debtList             = debtsQ.data?.data ?? []
  const outstandingDebtTotal = fromKobo(debtList.reduce((s, d) => s + d.amount_due, 0))
  const outstandingDebtCount = debtList.length

  const monthlyRevenue = aggregateMonthly(yearSalesQ.data?.data ?? [])

  function refetch() { results.forEach(r => r.refetch()) }

  return {
    todaySalesTotal,
    todaySalesCount,
    outstandingDebtTotal,
    outstandingDebtCount,
    totalCustomers: (customersQ.data as any)?.total_count ?? customersQ.data?.data?.length ?? 0,
    recentSales:    recentSalesQ.data?.data ?? [],
    overdueDebts:   debtList,
    topCustomers:   customersQ.data?.data ?? [],
    monthlyRevenue,
    isLoading,
    isError,
    refetch,
  }
}
