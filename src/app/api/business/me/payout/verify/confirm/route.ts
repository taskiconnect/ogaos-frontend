// src/app/api/business/me/payout/verify/confirm/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/payout/verify/confirm', 'POST')
}
