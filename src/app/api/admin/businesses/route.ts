// src/app/api/admin/businesses/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

// GET /api/admin/businesses → list businesses (cursor-paginated, filterable)
// Query params (search, status, is_verified, plan, subscription_status,
// cursor, limit) are forwarded through untouched by proxyRequest.
export async function GET(req: NextRequest) {
  return proxyRequest(req, '/admin/businesses', 'GET')
}
