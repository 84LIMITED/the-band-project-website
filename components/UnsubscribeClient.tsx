'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function UnsubscribeClient() {
  const params = useSearchParams()
  const email = params.get('e') || ''
  const token = params.get('t') || ''
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!email || !token) {
      setStatus('error')
      setMessage('This unsubscribe link is invalid.')
      return
    }

    let cancelled = false
    fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { message?: string }
        if (cancelled) return
        setMessage(data.message || '')
        setStatus(response.ok ? 'done' : 'error')
      })
      .catch(() => {
        if (cancelled) return
        setMessage('Something went wrong. Please try again.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [email, token])

  return (
    <main className="pt-32 pb-24 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-xl"
        aria-live="polite"
      >
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-6">Unsubscribe</h1>
        {status === 'working' && <p className="text-secondary">Removing you from the list…</p>}
        {status === 'done' && <p className="text-lg">{message || "You're unsubscribed."}</p>}
        {status === 'error' && <p className="text-white">{message}</p>}
        <p className="mt-10">
          <Link
            href="/shows#show-reminders"
            className="text-sm uppercase tracking-wider border-b border-white/40 hover:border-white"
          >
            Changed your mind? Sign up again
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
