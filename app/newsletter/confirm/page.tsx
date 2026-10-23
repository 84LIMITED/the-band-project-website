import type { Metadata } from 'next'
import { Suspense } from 'react'
import ConfirmSubscription from '@/components/ConfirmSubscription'

export const metadata: Metadata = {
  title: 'Confirm your subscription',
  robots: { index: false, follow: false },
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<main className="pt-32 pb-24 px-4 text-secondary">Loading…</main>}>
      <ConfirmSubscription />
    </Suspense>
  )
}
