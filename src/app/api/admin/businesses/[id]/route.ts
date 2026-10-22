// src/app/api/admin/businesses/[id]/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

// GET /api/admin/businesses/:id → business detail (owner, staff, subscription)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(req, `/admin/businesses/${id}`, 'GET')
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
 const { id } = await context.params
 return proxyRequest(req, `/admin/businesses/${id}`, 'DELETE')
}
