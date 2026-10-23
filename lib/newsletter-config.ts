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
