// src/app/api/sales/[id]/receipt/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const POST = (req: NextRequest, { params }: { params: { id: string } }) => {
  const sendEmail = req.nextUrl.searchParams.get('send_email')
  const path = sendEmail
    ? `/sales/${params.id}/receipt?send_email=${sendEmail}`
    : `/sales/${params.id}/receipt`
  return proxyRequest(req, path, 'POST')
}
