import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/platform']
const AUTH_PATHS      = ['/auth/login', '/auth/signup']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasSession = !!request.cookies.get('refresh_token')?.value

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPage  = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/platform/:path*',
    '/auth/:path*',
  ],
}