import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const GET    = (req: NextRequest, { params }: { params: { id: string } }) => proxyRequest(req, `/invoices/${params.id}`, 'GET')
export const DELETE = (req: NextRequest, { params }: { params: { id: string } }) => proxyRequest(req, `/invoices/${params.id}`, 'DELETE')
