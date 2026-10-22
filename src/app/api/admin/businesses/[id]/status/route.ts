import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
 const { id } = await context.params
 return proxyRequest(req, `/admin/businesses/${id}/status`, 'PATCH')
}
