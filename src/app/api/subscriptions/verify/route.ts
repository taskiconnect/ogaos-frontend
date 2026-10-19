// src/app/api/subscriptions/verify/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/subscriptions/verify', 'POST')
}
