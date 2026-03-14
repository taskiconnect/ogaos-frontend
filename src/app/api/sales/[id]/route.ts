import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const GET = (req: NextRequest, { params }: { params: { id: string } }) =>
  proxyRequest(req, `/sales/${params.id}`, 'GET')
