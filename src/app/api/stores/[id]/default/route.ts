import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return proxyRequest(req, `/stores/${id}/default`, 'PATCH')
}