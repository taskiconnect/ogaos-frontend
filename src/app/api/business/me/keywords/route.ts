// src/app/api/business/me/keywords/route.ts

import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/business/me/keywords', 'GET')
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, '/business/me/keywords', 'PUT')
}
