import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const POST = (req: NextRequest, { params }: { params: { id: string } }) =>
  proxyRequest(req, `/digital-products/${params.id}/cover`, 'POST', { multipart: true })
