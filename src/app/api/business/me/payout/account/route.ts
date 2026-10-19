// src/app/api/business/me/payout/account/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/payout/account', 'GET')
}
