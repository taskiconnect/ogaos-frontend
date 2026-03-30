// src/app/api/subscriptions/verify/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/subscriptions/verify', 'POST')
}