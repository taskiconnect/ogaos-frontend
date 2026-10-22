import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'
export async function GET(req: NextRequest) { return proxyRequest(req, '/admin/messages', 'GET') }
export async function POST(req: NextRequest) { return proxyRequest(req, '/admin/messages', 'POST') }
