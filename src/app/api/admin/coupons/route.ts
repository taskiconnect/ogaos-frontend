// src/app/api/admin/coupons/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

// GET /api/admin/coupons — list all coupons
export async function GET(req: NextRequest) {
  return proxyRequest(req, '/admin/coupons', 'GET')
}

// POST /api/admin/coupons — create a coupon
export async function POST(req: NextRequest) {
  return proxyRequest(req, '/admin/coupons', 'POST')
}