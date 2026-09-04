// src/app/api/admin/businesses/[id]/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

// GET /api/admin/businesses/:id → business detail (owner, staff, subscription)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyRequest(req, `/admin/businesses/${id}`, 'GET')
}
