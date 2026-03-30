// src/app/api/admin/admins/invite/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

// POST /api/admin/admins/invite → create new platform admin + send setup email
export async function POST(req: NextRequest) {
  return proxyRequest(req, '/admin/admins/invite', 'POST')
}