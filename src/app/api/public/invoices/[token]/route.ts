import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return proxyRequest(req, `/public/invoices/${encodeURIComponent(token)}`, 'GET')
}
