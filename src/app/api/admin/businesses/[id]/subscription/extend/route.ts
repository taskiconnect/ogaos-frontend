// src/app/api/admin/businesses/[id]/subscription/extend/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

// POST /api/admin/businesses/:id/subscription/extend → push period end forward
// Body: { days: number }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyRequest(req, `/admin/businesses/${id}/subscription/extend`, 'POST')
}
