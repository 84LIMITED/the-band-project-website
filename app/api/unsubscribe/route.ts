import { NextResponse } from 'next/server'
import { normalizeEmail, unsubscribeSubscriber } from '@/lib/subscribers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function readIdentity(request: Request): Promise<{ email: string; token: string }> {
  const url = new URL(request.url)
  let email = url.searchParams.get('e') || ''
  let token = url.searchParams.get('t') || ''
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      const body = (await request.json()) as { email?: string; token?: string }
      if (typeof body.email === 'string') email = body.email
      if (typeof body.token === 'string') token = body.token
    } catch {
      // Query-string identity still applies for one-click clients.
    }
  }

  return { email: normalizeEmail(email), token: token.trim() }
}

export async function POST(request: Request) {
  const { email, token } = await readIdentity(request)
  if (!email || !token) {
    return NextResponse.json({ ok: false, message: 'This unsubscribe link is invalid.' }, { status: 400 })
  }

  try {
    const ok = await unsubscribeSubscriber(email, token)
    if (!ok) {
      return NextResponse.json({ ok: false, message: 'This unsubscribe link is invalid.' }, { status: 400 })
    }
  } catch (error) {
    console.error('[newsletter] Unsubscribe failed', error)
    return NextResponse.json({ ok: false, message: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "You're unsubscribed." })
}
