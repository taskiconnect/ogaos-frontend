import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  return proxyRequest(req, `/public/business/${slug}/full`, 'GET')
}