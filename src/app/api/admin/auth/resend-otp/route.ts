// src/app/api/admin/auth/resend-otp/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/admin/auth/resend-otp', 'POST')
}