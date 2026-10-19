import type { QueryClient } from '@tanstack/react-query'
export function invalidateFinancialData(client: QueryClient) {
  return Promise.all(
    [
      'sales',
      'sale',
      'sales-summary',
      'debts',
      'customers',
      'customers-picker',
      'products',
      'products-picker',
      'invoice',
      'invoices',
    ].map((key) => client.invalidateQueries({ queryKey: [key] })),
  )
}
