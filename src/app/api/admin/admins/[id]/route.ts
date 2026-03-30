// src/app/api/admin/admins/[id]/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

// GET    /api/admin/admins/:id  → get single admin
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyRequest(req, `/admin/admins/${params.id}`, 'GET')
}

// PATCH  /api/admin/admins/:id  → update role or is_active
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyRequest(req, `/admin/admins/${params.id}`, 'PATCH')
}

// DELETE /api/admin/admins/:id  → deactivate admin
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyRequest(req, `/admin/admins/${params.id}`, 'DELETE')
}