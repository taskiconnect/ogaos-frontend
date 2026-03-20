// src/lib/api/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

export async function proxyRequest(
  req: NextRequest,
  backendPath: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  try {
    // Safely parse body — some requests (e.g. /auth/refresh) send no body
    let body: string | undefined
    if (method !== 'GET') {
      try {
        const json = await req.json()
        body = JSON.stringify(json)
      } catch {
        body = undefined
      }
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${backendPath}`

    const headers = new Headers(req.headers)
    headers.delete('host')
    headers.delete('content-length')

    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))

    const nextResponse = NextResponse.json(data, { status: response.status })

    // Forward Set-Cookie so the browser stores the new refresh_token cookie
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      nextResponse.headers.set('Set-Cookie', setCookie)
    }

    return nextResponse
  } catch (err) {
    console.error(`[proxy] ${method} ${backendPath}:`, err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}