import { QueryClient } from '@tanstack/react-query'
let browserClient: QueryClient | undefined
export function getQueryClient() {
  const create = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          gcTime: 600_000,
          refetchOnWindowFocus: false,
          retry: (count, error) =>
            count < 1 && ![401, 402, 403, 404].includes((error as { status?: number }).status ?? 0),
        },
        // Financial writes must never be automatically replayed.
        mutations: { retry: false },
      },
    })
  if (typeof window === 'undefined') return create()
  return (browserClient ??= create())
}
export function clearPrivateCache() {
  if (browserClient) {
    void browserClient.cancelQueries()
    browserClient.clear()
  }
}
