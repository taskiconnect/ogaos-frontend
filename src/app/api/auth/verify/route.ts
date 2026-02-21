// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function GET(req: NextRequest) {
  // Forward query params (token)
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing verification token' }, { status: 400 })
  }

  return proxyRequest(req, `/auth/verify?token=${token}`, 'GET')
}