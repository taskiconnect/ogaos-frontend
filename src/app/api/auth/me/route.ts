// src/app/api/auth/me/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/api/v1/me', 'GET')
}