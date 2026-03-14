import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const GET    = (req: NextRequest, { params }: { params: { id: string } }) => proxyRequest(req, `/expenses/${params.id}`, 'GET')
export const PATCH  = (req: NextRequest, { params }: { params: { id: string } }) => proxyRequest(req, `/expenses/${params.id}`, 'PATCH')
export const DELETE = (req: NextRequest, { params }: { params: { id: string } }) => proxyRequest(req, `/expenses/${params.id}`, 'DELETE')
