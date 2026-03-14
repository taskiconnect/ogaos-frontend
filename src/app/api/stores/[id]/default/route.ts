import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const PATCH = (req: NextRequest, { params }: { params: { id: string } }) =>
  proxyRequest(req, `/stores/${params.id}/default`, 'PATCH')
