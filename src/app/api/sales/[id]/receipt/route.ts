import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const sendEmail = req.nextUrl.searchParams.get('send_email')
  const path = sendEmail
    ? `/sales/${id}/receipt?send_email=${sendEmail}`
    : `/sales/${id}/receipt`
  return proxyRequest(req, path, 'POST')
}