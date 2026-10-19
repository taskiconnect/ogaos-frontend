import { PublicInvoice } from '@/features/documents/PublicInvoice'
import { backendBase } from '@/lib/api/proxy'
import { notFound } from 'next/navigation'
export const metadata = {
  title: 'Invoice | OgaOS',
  robots: { index: false, follow: false },
  referrer: 'no-referrer' as const,
}
export default async function InvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const res = await fetch(`${backendBase()}/public/invoices/${encodeURIComponent(token)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })
  if (res.status === 404) notFound()
  if (!res.ok) throw new Error('Invoice temporarily unavailable')
  const json = await res.json()
  return <PublicInvoice invoice={json.data} />
}
