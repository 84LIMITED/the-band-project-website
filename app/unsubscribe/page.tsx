import type { Metadata } from 'next'
import { Suspense } from 'react'
import UnsubscribeClient from '@/components/UnsubscribeClient'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<main className="pt-32 pb-24 px-4 text-secondary">Loading…</main>}>
      <UnsubscribeClient />
    </Suspense>
  )
}
