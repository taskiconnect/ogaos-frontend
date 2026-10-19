import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export async function PATCH(req: NextRequest) {
  return proxyRequest(req, `/business/me/storefront-video`, 'PATCH')
}
