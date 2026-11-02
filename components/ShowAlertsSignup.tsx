'use client'

import { useSearchParams } from 'next/navigation'
import SignupForm from '@/components/SignupForm'
import { resolveSubscriberSource } from '@/lib/newsletter-config'

export default function ShowAlertsSignup() {
  const params = useSearchParams()
  return (
    <SignupForm source={resolveSubscriberSource(params.get('src'), 'page')} variant="compact" />
  )
}
