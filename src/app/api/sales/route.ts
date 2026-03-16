import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const GET = async (req: NextRequest) => {
  return proxyRequest(req, '/sales', 'GET')
}

export const POST = async (req: NextRequest) => {
  return proxyRequest(req, '/sales', 'POST')
}