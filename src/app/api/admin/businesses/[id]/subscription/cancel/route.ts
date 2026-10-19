// src/app/api/admin/businesses/[id]/subscription/cancel/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

// POST /api/admin/businesses/:id/subscription/cancel → cancel the subscription
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(req, `/admin/businesses/${id}/subscription/cancel`, 'POST')
}
