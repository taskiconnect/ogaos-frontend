// src/app/api/admin/auth/logout/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/admin/auth/logout', 'POST')
}
