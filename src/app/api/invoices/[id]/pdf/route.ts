import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(req, `/invoices/${id}/pdf`, 'GET')
}
