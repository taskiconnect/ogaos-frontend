import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/subscriptions/me', 'GET')
}
