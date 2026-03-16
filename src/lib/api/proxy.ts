// src/lib/api/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

interface ProxyOptions {
  multipart?: boolean;
}

export async function proxyRequest(
  req: NextRequest,
  backendPath: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options?: ProxyOptions
) {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${backendPath}`

    const headers = new Headers(req.headers)
    headers.delete('host')

    let body: BodyInit | undefined

    if (method !== 'GET') {
      if (options?.multipart) {
        // For multipart/form-data, forward the original form data
        body = await req.formData()
        // Don't set Content-Type header for multipart; let fetch set it with the boundary
        headers.delete('content-type')
      } else {
        // For JSON requests
        body = JSON.stringify(await req.json())
        headers.set('content-type', 'application/json')
      }
    }

    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      credentials: 'include',
      cache: 'no-store',
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

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