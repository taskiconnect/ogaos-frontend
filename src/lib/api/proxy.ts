// src/lib/api/proxy.ts
// Server-side proxy used by all Next.js API routes.
//
// Security model:
//  - API_URL is a server-only env var (no NEXT_PUBLIC_ prefix).
//    The browser never sees the real backend address.
//  - The access token travels in the Authorization header, which this proxy
//    reads on the server and forwards — the browser sends it to /api/*, not
//    directly to the Go backend.
//  - HttpOnly refresh_token cookies are forwarded and returned intact so the
//    browser never touches the raw token value.

import { NextRequest, NextResponse } from 'next/server'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Server-only — never expose this in client code.
// Set API_URL (not NEXT_PUBLIC_API_URL) in your production environment.
const BACKEND = process.env.API_URL ?? 'http://localhost:8080/api/v1'

export async function proxyRequest(
  req: NextRequest,
  backendPath: string,
  method: HttpMethod = 'POST',
  { multipart = false }: { multipart?: boolean } = {}
) {
  try {
    // Build target URL and forward query string (?page=1&limit=20&search=...)
    const target = new URL(BACKEND + backendPath)
    req.nextUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v))

    // Build outbound headers
    const headers = new Headers()

    // Forward auth token (set by client.ts interceptor)
    const auth = req.headers.get('authorization')
    if (auth) headers.set('authorization', auth)

    // Forward httpOnly cookie (contains refresh_token)
    const cookie = req.headers.get('cookie')
    if (cookie) headers.set('cookie', cookie)

    // Build body
    let body: BodyInit | undefined

    if (method !== 'GET' && method !== 'DELETE') {
      if (multipart) {
        // File upload — forward FormData as-is; do NOT set Content-Type
        // (browser boundary is set automatically by the fetch runtime)
        body = await req.formData()
      } else {
        headers.set('content-type', 'application/json')
        const text = await req.text()
        if (text) body = text
      }
    }

    const response = await fetch(target.toString(), {
      method,
      headers,
      body,
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    const nextRes = NextResponse.json(data, { status: response.status })

    // Propagate Set-Cookie so the browser stores the rotated refresh token
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) nextRes.headers.set('set-cookie', setCookie)

    return nextRes
  } catch (err) {
    console.error(`[PROXY] ${method} ${backendPath} —`, err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
