// src/app/api/business/me/payout/resolve/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/payout/resolve', 'POST')
}
