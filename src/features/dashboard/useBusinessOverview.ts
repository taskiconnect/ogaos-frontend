'use client'
import { collectSales } from '@/lib/api/finance'
import { lagosDay, monthRange } from '@/lib/domain/dates'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
export function useBusinessOverview() {
  const user = useAuthStore((s) => s.user)
  const day = lagosDay()
  const year = Number(day.slice(0, 4)),
    month = Number(day.slice(5, 7))
  const monthly = useQuery({
    queryKey: ['sales', user?.id, 'overview-month', year, month],
    queryFn: () => collectSales(monthRange(year, month)),
    enabled: !!user,
    staleTime: 120_000,
  })
  const partial = useQuery({
    queryKey: ['sales', user?.id, 'overview-outstanding'],
    queryFn: () => collectSales({ status: 'partial' }),
    enabled: !!user,
    staleTime: 120_000,
  })
  const sales = (monthly.data?.data ?? []).filter((s) => s.status !== 'cancelled')
  const pending = partial.data?.data ?? []
  return {
    sales,
    pending,
    monthly,
    partial,
    complete: monthly.data?.complete !== false && partial.data?.complete !== false,
    paid: sales.reduce((sum, s) => sum + s.amount_paid, 0),
    billed: sales.reduce((sum, s) => sum + s.total_amount, 0),
    outstanding: pending.reduce((sum, s) => sum + s.balance_due, 0),
    loading: monthly.isPending || partial.isPending,
    error: monthly.isError || partial.isError,
  }
}
