// src/app/api/business/me/payout/verify/pending/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/payout/verify/pending', 'GET')
}