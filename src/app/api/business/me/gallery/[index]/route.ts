import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params
  return proxyRequest(req, `/business/me/gallery/${index}`, 'DELETE')
}
