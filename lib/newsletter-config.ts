/** Production origin used for canonical URLs and share links. */
export const SITE_ORIGIN = 'https://thebandproject.live'

/** Canonical signup page. Rename this to move the page. */
export const SIGNUP_PAGE_PATH = '/show-alerts'

export const SIGNUP_PAGE_TITLE = 'Show Alerts: NJ Cover Band Updates | The Band Project'

export const SIGNUP_PAGE_DESCRIPTION =
  'Get show updates from The Band Project, a Wyckoff, NJ cover band. Sign up for dates, venues, and news on upcoming events. 8-10 emails a year.'

const SIGNUP_SOURCE_PATTERN = /^[a-z0-9_-]{1,20}$/

/** Keep `footer`, `shows`, `page`, `import`, and short `src` slugs. Anything else uses the fallback. */
export function resolveSubscriberSource(value: unknown, fallback = 'footer'): string {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toLowerCase()
  return SIGNUP_SOURCE_PATTERN.test(normalized) ? normalized : fallback
}

/** Display name on newsletter and confirmation messages. */
export const FROM_NAME = 'The Band Project'

/**
 * CAN-SPAM requires a real postal address in every commercial email.
 * Replace TODO with a PO box or the business address before sending.
 */
export const POSTAL_ADDRESS = 'The Band Project | 35 Manor Rd, Wyckoff, NJ 07481'

export const CONFIGURATION_SET = 'band-project-newsletter'

export const LOGO_URL = 'https://thebandproject.live/images/the-band-project-logo.png'

export function postalAddressIsSet(): boolean {
  const value = POSTAL_ADDRESS.trim()
  return value.length > 0 && !value.toUpperCase().includes('TODO')
}

export function replyToAddress(): string {
  return process.env.CONTACT_EMAIL?.trim() || 'book@thebandproject.live'
}

export function fromEmailAddress(): string | null {
  const value = process.env.NEWSLETTER_FROM_EMAIL?.trim()
  return value || null
}

export function siteBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  return (configured || 'http://localhost:3000').replace(/\/$/, '')
}

export function awsRegion(): string {
  return process.env.AMPLIFY_REGION?.trim() || process.env.AWS_REGION?.trim() || 'us-east-1'
}
