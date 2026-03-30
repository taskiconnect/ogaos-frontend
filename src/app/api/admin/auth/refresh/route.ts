// src/app/api/admin/auth/refresh/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

// The admin_refresh_token cookie is httpOnly and same-origin to Next.js.
// This proxy route forwards it server-side to the Go backend so the browser
// never needs to touch the raw token value.
export async function POST(req: NextRequest) {
  return proxyRequest(req, '/admin/auth/refresh', 'POST')
}