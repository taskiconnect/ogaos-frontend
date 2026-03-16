import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const POST = async (req: NextRequest) => {
  return proxyRequest(req, '/auth/resend-verification', 'POST')
}