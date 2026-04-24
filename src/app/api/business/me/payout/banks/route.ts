// src/app/api/business/me/payout/banks/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/payout/banks', 'GET')
}