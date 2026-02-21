// src/lib/api/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

export async function proxyRequest(
  req: NextRequest,
  backendPath: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  try {
    const body = method !== 'GET' ? await req.json() : undefined

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${backendPath}`

    const headers = new Headers(req.headers)
    headers.delete('host') // avoid confusion

    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({})) // safe json parse

    const nextResponse = NextResponse.json(data, { status: response.status })

    // Forward Set-Cookie header (very important for httpOnly tokens)
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      nextResponse.headers.set('Set-Cookie', setCookie)
    }

    return nextResponse
  } catch (error) {
    console.error(`Proxy error (${backendPath}):`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}