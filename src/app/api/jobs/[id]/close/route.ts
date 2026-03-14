import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const PATCH = (req: NextRequest, { params }: { params: { id: string } }) =>
  proxyRequest(req, `/jobs/${params.id}/close`, 'PATCH')
