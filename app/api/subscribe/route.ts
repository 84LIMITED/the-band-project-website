import { NextResponse } from 'next/server'
import { sendConfirmationEmail } from '@/lib/email'
import { resolveSubscriberSource } from '@/lib/newsletter-config'
import {
  allowSubscribeAttempt,
  isValidEmail,
  markConfirmationSent,
  normalizeEmail,
  prepareSubscription,
} from '@/lib/subscribers'
import { verifyTurnstile } from '@/lib/turnstile'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUCCESS = { ok: true, message: 'Check your inbox to confirm your email.' }

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function POST(request: Request) {
  let body: { email?: string; website?: string; ts?: number; turnstileToken?: string; source?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(SUCCESS)
  }

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    console.log('subscribe: honeypot drop')
    return NextResponse.json(SUCCESS)
  }

  const renderedAt = Number(body.ts)
  if (!Number.isFinite(renderedAt) || Date.now() - renderedAt < 2000) {
    return NextResponse.json(SUCCESS)
  }

  const ip = clientIp(request)
  if (!(await allowSubscribeAttempt(ip))) {
    console.log('subscribe: rate-limit drop')
    return NextResponse.json(SUCCESS)
  }

  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : ''
  const turnstileOk = await verifyTurnstile(token, ip)
  console.log(`subscribe: turnstile ${turnstileOk ? 'pass' : 'fail'}`)
  if (!turnstileOk) {
    return NextResponse.json(SUCCESS)
  }

  const email = normalizeEmail(typeof body.email === 'string' ? body.email : '')
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'Enter a valid email address.' }, { status: 400 })
  }

  const source = resolveSubscriberSource(body.source, 'footer')

  try {
    const prepared = await prepareSubscription(email, source)
    if (prepared.created) {
      console.log('subscribe: record created')
    } else if (!prepared.send) {
      console.log(`subscribe: existing record skipped status=${prepared.subscriber.status}`)
    }
    if (prepared.send && prepared.subscriber.confirmToken) {
      const sent = await sendConfirmationEmail(
        email,
        prepared.subscriber.confirmToken,
        prepared.subscriber.unsubscribeToken
      )
      if (sent) await markConfirmationSent(email)
    }
  } catch (error) {
    console.error('[newsletter] Subscribe failed', error)
    return NextResponse.json({ ok: false, message: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return NextResponse.json(SUCCESS)
}
