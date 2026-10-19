import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export async function GET(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  const { order_id } = await params
  return proxyRequest(req, `/public/digital-orders/${order_id}/fulfillment`, 'GET')
}
