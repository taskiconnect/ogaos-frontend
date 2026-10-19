import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return proxyRequest(req, `/public/digital-store/${slug}/initialize-payment`, 'POST')
}
