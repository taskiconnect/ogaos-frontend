// src/app/api/business/me/keywords/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/business/me/keywords', 'GET')
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, '/business/me/keywords', 'PUT')
}