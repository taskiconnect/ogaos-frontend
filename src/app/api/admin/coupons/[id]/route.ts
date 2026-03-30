// src/app/api/admin/coupons/[id]/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

// Define params type
type Params = Promise<{ id: string }>

// GET /api/admin/coupons/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params
  return proxyRequest(req, `/admin/coupons/${id}`, 'GET')
}

// PATCH /api/admin/coupons/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params
  return proxyRequest(req, `/admin/coupons/${id}`, 'PATCH')
}

// DELETE /api/admin/coupons/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params
  return proxyRequest(req, `/admin/coupons/${id}`, 'DELETE')
}