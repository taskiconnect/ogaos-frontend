// src/app/api/public/business/[slug]/keywords/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Context = {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, context: Context) {
  const { slug } = await context.params
  return proxyRequest(
    req,
    `/public/business/${encodeURIComponent(slug)}/keywords`,
    'GET'
  )
}