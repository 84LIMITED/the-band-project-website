'use client'

import { useEffect, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { AnimatePresence, motion } from 'framer-motion'
interface SignupFormProps {
  source: 'footer' | 'shows'
  variant?: 'compact' | 'full'
}

const SUCCESS = 'Check your inbox to confirm your email.'

export default function SignupForm({ source, variant = 'compact' }: SignupFormProps) {
  const full = variant === 'full'
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [ts, setTs] = useState(0)
  const [token, setToken] = useState('')
  const [widgetError, setWidgetError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAFjD5OJhw9mKaFKK'

  useEffect(() => {
    setTs(Date.now())
  }, [])

  function resetWidget() {
    setToken('')
    turnstileRef.current?.reset()
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading || !token || widgetError) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          website,
          ts,
          turnstileToken: token,
          source,
        }),
      })
      const data = (await response.json()) as { message?: string }
      if (!response.ok) {
        setError(data.message || 'Enter a valid email address.')
        resetWidget()
        return
      }
      setSuccess(true)
      resetWidget()
    } catch {
      setError('Something went wrong. Please try again.')
      resetWidget()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div aria-live="polite">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.p
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-white"
          >
            ✓ {SUCCESS}
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            className={full ? 'max-w-xl' : ''}
          >
            {full ? (
              <>
                <h2 className="text-3xl md:text-4xl font-extrabold uppercase mb-3">Never miss a show.</h2>
                <p className="text-secondary mb-6">Get a heads-up before every upcoming show.</p>
              </>
            ) : (
              <p className="text-sm uppercase tracking-wider mb-3">Get show reminders</p>
            )}

            <label htmlFor={`signup-email-${source}`} className="sr-only">
              Email address
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id={`signup-email-${source}`}
                type="email"
                name="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/40 text-white placeholder:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              />
              <button
                type="submit"
                disabled={loading || !token || widgetError || ts === 0}
                className="px-6 py-3 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {loading ? 'Sending…' : full ? 'Join' : 'Notify'}
              </button>
            </div>

            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              className="absolute left-[-9999px] h-px w-px opacity-0"
            />

            {widgetError ? (
              <p className="text-sm text-secondary mt-3">Please refresh the page and try again.</p>
            ) : (
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                options={{ theme: 'dark', appearance: 'interaction-only' }}
                onSuccess={(value) => {
                  setToken(value)
                  setWidgetError(false)
                }}
                onExpire={() => setToken('')}
                onError={() => setWidgetError(true)}
                onUnsupported={() => setWidgetError(true)}
              />
            )}

            <p className="text-xs text-secondary mt-3">8-10 emails a year. Unsubscribe anytime.</p>
            {error && <p className="text-sm text-white mt-2">{error}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
