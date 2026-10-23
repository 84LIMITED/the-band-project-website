'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ConfirmSubscription() {
  const params = useSearchParams()
  const email = params.get('e') || ''
  const token = params.get('t') || ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function confirm() {
    setStatus('loading')
    try {
      const response = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      })
      const data = (await response.json()) as { message?: string }
      setMessage(data.message || '')
      setStatus(response.ok ? 'done' : 'error')
    } catch {
      setMessage('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <main className="pt-32 pb-24 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-xl"
        aria-live="polite"
      >
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-6">Confirm subscription</h1>
        {status === 'done' ? (
          <p className="text-lg mb-8">{message}</p>
        ) : (
          <>
            <p className="text-secondary mb-8">
              Confirm your email to get show reminders from The Band Project.
            </p>
            {status === 'error' && <p className="text-white mb-6">{message}</p>}
            <button
              type="button"
              onClick={confirm}
              disabled={status === 'loading' || !email || !token}
              className="px-8 py-4 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {status === 'loading' ? 'Confirming…' : 'Confirm my subscription'}
            </button>
          </>
        )}
        <p className="mt-10">
          <Link href="/" className="text-sm uppercase tracking-wider border-b border-white/40 hover:border-white">
            Back home
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
