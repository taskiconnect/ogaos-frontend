import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  return proxyRequest(req, `/staff/${params.id}`, 'DELETE')
}