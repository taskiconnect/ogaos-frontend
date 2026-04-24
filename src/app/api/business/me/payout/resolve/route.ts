// src/app/api/business/me/payout/resolve/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/payout/resolve', 'POST')
}