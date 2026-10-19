// src/app/api/admin/businesses/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

// GET /api/admin/businesses → list businesses (cursor-paginated, filterable)
// Query params (search, status, is_verified, plan, subscription_status,
// cursor, limit) are forwarded through untouched by proxyRequest.
export async function GET(req: NextRequest) {
  return proxyRequest(req, '/admin/businesses', 'GET')
}
