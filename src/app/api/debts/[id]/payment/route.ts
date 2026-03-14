import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const POST = (req: NextRequest, { params }: { params: { id: string } }) =>
  proxyRequest(req, `/debts/${params.id}/payment`, 'POST')
