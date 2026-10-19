// src/app/api/admin/admins/route.ts
import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

// GET  /api/admin/admins        → list all admins
export async function GET(req: NextRequest) {
  return proxyRequest(req, '/admin/admins', 'GET')
}

// POST /api/admin/admins/invite → invite a new admin
// Note: invite has its own dedicated route below for clarity
