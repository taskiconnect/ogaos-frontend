import { NextRequest, NextResponse } from 'next/server'
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export function backendBase() {
  const value = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
  if (!value && process.env.NODE_ENV === 'production') throw new Error('API_URL must be configured')
  return (value ?? 'http://127.0.0.1:8080/api/v1').replace(/\/+$/, '')
}
export function frontendCookie(cookie: string) {
  // Cookie paths belong to this application's public route space.
  return cookie.replace(/Path=\/api\/v1\/admin(?=;|$)/gi, 'Path=/api/admin')
}
export async function proxyRequest(
  req: NextRequest,
  path: string,
  method: HttpMethod = 'POST',
  { multipart = false }: { multipart?: boolean } = {},
) {
  try {
    const target = new URL(backendBase() + path)
    target.search = req.nextUrl.search
    const headers = new Headers()
    for (const name of ['authorization', 'cookie', 'accept', 'x-idempotency-key']) {
      const value = req.headers.get(name)
      if (value) headers.set(name, value)
    }
    let body: BodyInit | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      if (Number(req.headers.get('content-length') ?? 0) > 30 * 1024 * 1024)
        return NextResponse.json(
          { success: false, message: 'Upload exceeds 30 MB' },
          { status: 413 },
        )
      if (multipart) {
        const form = await req.formData()
        let size = 0
        for (const value of form.values())
          size += typeof value === 'string' ? value.length : value.size
        if (size > 30 * 1024 * 1024)
          return NextResponse.json(
            { success: false, message: 'Upload exceeds 30 MB' },
            { status: 413 },
          )
        body = form
      } else {
        headers.set('content-type', 'application/json')
        body = (await req.text()) || undefined
      }
    }
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(multipart ? 65_000 : 25_000)])
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      signal,
      cache: 'no-store',
      redirect: 'manual',
    })
    const output = new Headers({ 'cache-control': 'no-store' })
    for (const name of [
      'content-type',
      'content-disposition',
      'retry-after',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'location',
    ]) {
      const value = upstream.headers.get(name)
      if (value) output.set(name, value)
    }
    for (const cookie of upstream.headers.getSetCookie())
      output.append('set-cookie', frontendCookie(cookie))
    return new NextResponse(upstream.body, { status: upstream.status, headers: output })
  } catch (error) {
    const timedOut = error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)
    return NextResponse.json(
      {
        success: false,
        message: timedOut
          ? 'Request timed out. Check the transaction before retrying.'
          : 'The service is temporarily unavailable.',
      },
      { status: timedOut ? 504 : 502 },
    )
  }
}
