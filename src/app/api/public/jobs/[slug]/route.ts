import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

type Context = {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, context: Context) {
  const { slug } = await context.params
  return proxyRequest(req, `/public/jobs/${slug}`, 'GET')
}
