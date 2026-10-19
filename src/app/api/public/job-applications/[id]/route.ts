import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

type Context = {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, context: Context) {
  const { id } = await context.params
  return proxyRequest(req, `/public/jobs/${id}/apply`, 'POST', { multipart: true })
}
