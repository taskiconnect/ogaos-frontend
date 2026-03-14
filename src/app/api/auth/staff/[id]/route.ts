import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const DELETE = (req: NextRequest, { params }: { params: { id: string } }) =>
  proxyRequest(req, `/staff/${params.id}`, 'DELETE')
