import { NextResponse } from 'next/server'
import { activateSubscriber, normalizeEmail } from '@/lib/subscribers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: { email?: string; token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'This confirmation link is invalid or has expired.' }, { status: 400 })
  }

  const email = normalizeEmail(typeof body.email === 'string' ? body.email : '')
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  if (!email || !token) {
    return NextResponse.json({ ok: false, message: 'This confirmation link is invalid or has expired.' }, { status: 400 })
  }

  try {
    const ok = await activateSubscriber(email, token)
    if (!ok) {
      return NextResponse.json(
        { ok: false, message: 'This confirmation link is invalid or has expired.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[newsletter] Confirm failed', error)
    return NextResponse.json({ ok: false, message: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "You're confirmed. We'll send show reminders a few times a year." })
}
