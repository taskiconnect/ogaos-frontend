import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> }
) => {
  const { id, index } = await params
  return proxyRequest(req, `/digital-products/${id}/gallery/${index}`, 'DELETE')
}