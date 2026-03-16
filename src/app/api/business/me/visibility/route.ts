import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const PATCH = async (req: NextRequest) => {
  return proxyRequest(req, '/business/me/visibility', 'PATCH')
}