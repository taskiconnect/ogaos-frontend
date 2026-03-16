import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const GET = async (req: NextRequest) => {
  return proxyRequest(req, '/customers', 'GET')
}

export const POST = async (req: NextRequest) => {
  return proxyRequest(req, '/customers', 'POST')
}