'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SIGNUP_PAGE_PATH } from '@/lib/newsletter-config'

export default function SignupNavLink({ className }: { className: string }) {
  const pathname = usePathname()
  const active = pathname === SIGNUP_PAGE_PATH

  return (
    <Link
      href={SIGNUP_PAGE_PATH}
      aria-current={active ? 'page' : undefined}
      className={active ? `${className} text-white` : className}
    >
      Sign Up for Show Alerts
    </Link>
  )
}
