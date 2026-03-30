// src/app/api/admin/auth/setup-password/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/admin/auth/setup-password', 'POST')
}