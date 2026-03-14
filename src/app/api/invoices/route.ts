import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const GET  = (req: NextRequest) => proxyRequest(req, '/invoices', 'GET')
export const POST = (req: NextRequest) => proxyRequest(req, '/invoices', 'POST')
