// src/hooks/useDashboard.ts
import { useQueries } from '@tanstack/react-query'
import { listSales, listDebts } from '@/lib/api/finance'
import { listCustomers } from '@/lib/api/business'
import type { Sale, Debt, Customer } from '@/lib/api/types'

export const fromKobo = (k: number) => Math.round(k / 100)
export const formatNaira = (k: number) => `₦${fromKobo(k).toLocaleString('en-NG')}`

function todayNg(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  expenses: number
}

function aggregateMonthly(sales: Sale[]): MonthlyRevenue[] {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const map: Record<number, number> = {}

  for (const s of sales) {
    if (s.status === 'cancelled') continue

    const m = new Date(s.created_at).getMonth()
    map[m] = (map[m] ?? 0) + (s.amount_paid ?? s.total_amount)
  }

  return MONTHS.map((month, i) => ({
    month,
    revenue: fromKobo(map[i] ?? 0),
    expenses: 0,
  }))
}

export interface DashboardData {
  todaySalesTotal: number
  todaySalesCount: number
  todayFullyPaid: number
  todayPartial: number
  todayOutstanding: number
  todayRevenue: number
  outstandingDebtTotal: number
  outstandingDebtCount: number
  totalCustomers: number
  recentSales: Sale[]
  overdueDebts: Debt[]
  topCustomers: Customer[]
  monthlyRevenue: MonthlyRevenue[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useDashboard(): DashboardData {
  const today = todayNg()

  const results = useQueries({
    queries: [
      {
        queryKey: ['sales', 'today', today],
        queryFn: () => listSales({ date_from: today, date_to: today, limit: 100 }),
        staleTime: 1000 * 60 * 2,
      },
      {
        queryKey: ['sales', 'recent'],
        queryFn: () => listSales({ limit: 8 }),
        staleTime: 1000 * 60 * 2,
      },

      // Fetch all open receivable debts for dashboard widget/totals
      {
        queryKey: ['debts', 'dashboard-open-receivables'],
        queryFn: async () => {
          const [outstandingRes, partialRes, overdueRes] = await Promise.all([
            listDebts({ direction: 'receivable', status: 'outstanding', limit: 100 }),
            listDebts({ direction: 'receivable', status: 'partial', limit: 100 }),
            listDebts({ direction: 'receivable', status: 'overdue', limit: 100 }),
          ])

          const combined = [
            ...(outstandingRes.data ?? []),
            ...(partialRes.data ?? []),
            ...(overdueRes.data ?? []),
          ]

          const seen = new Set<string>()
          const unique = combined.filter((debt) => {
            if (seen.has(debt.id)) return false
            seen.add(debt.id)
            return true
          })

          return {
            success: true as const,
            data: unique,
            next_cursor: null,
          }
        },
        staleTime: 1000 * 60 * 3,
      },

      {
        queryKey: ['customers', 'top'],
        queryFn: () => listCustomers({ limit: 5 }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['sales', 'year-chart'],
        queryFn: () => {
          const yearStart = `${new Date().getFullYear()}-01-01`
          return listSales({ date_from: yearStart, limit: 200 })
        },
        staleTime: 1000 * 60 * 10,
      },
      {
        queryKey: ['sales', 'partial-dashboard'],
        queryFn: () => listSales({ status: 'partial', limit: 100 }),
        staleTime: 1000 * 60 * 3,
      },
    ],
  })

  const [todaySalesQ, recentSalesQ, debtsQ, customersQ, yearSalesQ, partialSalesQ] = results

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const todaySalesListRaw = todaySalesQ.data?.data ?? []
  const todaySalesList = todaySalesListRaw.filter((s) => s.status !== 'cancelled')

  const todaySalesTotal = todaySalesList.reduce((sum, sale) => sum + (sale.total_amount ?? 0), 0)
  const todayRevenue = todaySalesList.reduce((sum, sale) => sum + (sale.amount_paid ?? 0), 0)
  const todaySalesCount = todaySalesList.length
  const todayFullyPaid = todaySalesList.filter((s) => s.status === 'completed').length
  const todayPartial = todaySalesList.filter((s) => s.status === 'partial' || s.status === 'pending').length

  const todayOutstanding = todaySalesList
    .filter((s) => s.status === 'partial' || s.status === 'pending')
    .reduce((sum, s) => sum + (s.balance_due ?? 0), 0)

  const debtList = (debtsQ.data?.data ?? []).filter(
    (d) => d.direction === 'receivable' && d.status !== 'settled' && (d.amount_due ?? 0) > 0
  )

  const partialSales = (partialSalesQ.data?.data ?? []).filter((s) => s.status !== 'cancelled')

  const linkedSaleNumbers = new Set(
    debtList
      .filter((d) => d.description.startsWith('Balance from sale '))
      .map((d) => d.description.replace('Balance from sale ', '').trim())
  )

  const unlinkedPartialSales = partialSales.filter(
    (s) => !linkedSaleNumbers.has(s.sale_number) && (s.balance_due ?? 0) > 0
  )

  const unlinkedPartialBalance = unlinkedPartialSales.reduce(
    (sum, s) => sum + (s.balance_due ?? 0),
    0
  )

  const debtRecordBalance = debtList.reduce((sum, d) => sum + (d.amount_due ?? 0), 0)

  const outstandingDebtTotal = debtRecordBalance + unlinkedPartialBalance
  const outstandingDebtCount = debtList.length + unlinkedPartialSales.length

  const monthlyRevenue = aggregateMonthly(yearSalesQ.data?.data ?? [])

  function refetch() {
    results.forEach((r) => r.refetch())
  }

  return {
    todaySalesTotal: fromKobo(todaySalesTotal),
    todaySalesCount,
    todayFullyPaid,
    todayPartial,
    todayOutstanding: fromKobo(todayOutstanding),
    todayRevenue: fromKobo(todayRevenue),
    outstandingDebtTotal: fromKobo(outstandingDebtTotal),
    outstandingDebtCount,
    totalCustomers: customersQ.data?.data?.length ?? 0,
    recentSales: (recentSalesQ.data?.data ?? []).filter((s) => s.status !== 'cancelled'),
    overdueDebts: debtList,
    topCustomers: customersQ.data?.data ?? [],
    monthlyRevenue,
    isLoading,
    isError,
    refetch,
  }
}