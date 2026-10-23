import { subscribersTable } from '@/lib/subscribers'

const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA'

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verify a Turnstile token. Returns false on a missing token, a failed check,
 * or a network error (fail closed). Local dev without a secret uses Cloudflare's
 * always-pass test secret. Production without a secret also fails closed.
 */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!token.trim()) return false

  const configured = process.env.TURNSTILE_SECRET_KEY?.trim()
  const secret = configured || (!subscribersTable() ? TURNSTILE_TEST_SECRET : '')
  if (!secret) {
    console.error('[newsletter] TURNSTILE_SECRET_KEY is unset; refusing the signup')
    return false
  }

  try {
    const response = await fetch(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    })
    if (!response.ok) return false
    const data = (await response.json()) as { success?: boolean }
    return data.success === true
  } catch (error) {
    console.error('[newsletter] Turnstile siteverify unreachable', error)
    return false
  }
}
