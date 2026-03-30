// src/app/api/admin/auth/verify-otp/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/admin/auth/verify-otp', 'POST')
}