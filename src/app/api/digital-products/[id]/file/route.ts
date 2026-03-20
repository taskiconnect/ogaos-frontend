import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  return proxyRequest(req, `/digital-products/${id}/file`, 'POST', { multipart: true })
}
