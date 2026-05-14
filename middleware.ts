import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const GONE_EXACT = new Set([
  '/cart',
  '/account',
  '/search',
  '/checkout',
  '/wpm',
])

const GONE_PREFIXES = [
  '/products/',
  '/collections/',
  '/blogs/',
  '/pages/',
  '/checkouts/',
  '/orders/',
  '/v1/',
  '/cdn/',
]

function isGonePath(pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/'
  if (GONE_EXACT.has(path)) return true
  return GONE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export function middleware(request: NextRequest) {
  if (isGonePath(request.nextUrl.pathname)) {
    return new NextResponse('Gone', {
      status: 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/cart',
    '/account',
    '/search',
    '/checkout',
    '/wpm',
    '/products/:path*',
    '/collections/:path*',
    '/blogs/:path*',
    '/pages/:path*',
    '/checkouts/:path*',
    '/orders/:path*',
    '/v1/:path*',
    '/cdn/:path*',
  ],
}
