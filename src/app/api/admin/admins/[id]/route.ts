import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/admin/admins/:id → get single admin
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  return proxyRequest(req, `/admin/admins/${id}`, 'GET')
}

// PATCH /api/admin/admins/:id → update role or is_active
export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  return proxyRequest(req, `/admin/admins/${id}`, 'PATCH')
}

// DELETE /api/admin/admins/:id → deactivate admin
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  return proxyRequest(req, `/admin/admins/${id}`, 'DELETE')
}