import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'
export const PATCH = (req: NextRequest) => proxyRequest(req, '/business/me/visibility', 'PATCH')
