// src/app/api/admin/businesses/[id]/verify/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

// PATCH /api/admin/businesses/:id/verify → toggle the verified badge
// Body: { is_verified: boolean }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(req, `/admin/businesses/${id}/verify`, 'PATCH')
}
