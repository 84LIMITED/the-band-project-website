import { Metadata } from 'next'
import { showEventIsoRange } from '@/lib/calendar'
import type { Show } from '@/lib/schema'

/** Used for image alt text and video title attributes for SEO consistency */
export const IMAGE_VIDEO_ALT_TITLE = 'The Band Project | NJ | Live Music Entertainment'

export interface PageSEO {
  title: string
  description: string
  path: string
  /** Absolute canonical URL. Defaults to the site base plus path. */
  canonical?: string
  /** Absolute Open Graph and Twitter image URL. */
  image?: string
}

export function generateMetadata(seo: PageSEO): Metadata {
  // In production, use env var. In local dev, default to localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = seo.canonical || `${baseUrl}${seo.path}`
  const image = seo.image
    ? [{ url: seo.image, width: 1200, height: 630, alt: seo.title }]
    : undefined

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      type: 'website',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.image ? [seo.image] : undefined,
    },
  }
}

export function generateStructuredData(type: 'MusicGroup' | 'Event' | 'WebSite' | 'WebPage', data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thebandproject.live'

  switch (type) {
    case 'MusicGroup':
      return {
        '@context': 'https://schema.org',
        '@type': 'MusicGroup',
        name: 'The Band Project',
        url: baseUrl,
        ...data,
      }
    case 'Event':
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        ...data,
      }
    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'The Band Project',
        url: baseUrl,
        ...data,
      }
    case 'WebPage':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: `${baseUrl}${data.path}`,
        ...data,
      }
    default:
      return null
  }
}

function eventAddress(show: Show) {
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: show.city,
    addressRegion: show.state,
    addressCountry: 'US',
  }
  if (!show.address) return address

  const zip = show.address.match(/\b(\d{5})(?:-\d{4})?\s*$/)
  const cityAt = show.address.toLowerCase().lastIndexOf(show.city.toLowerCase())
  const street = cityAt > 0 ? show.address.slice(0, cityAt).replace(/[\s,]+$/, '') : show.address
  address.streetAddress = street
  if (zip) address.postalCode = zip[1]
  return address
}

/** Event JSON-LD with a zoned start, end, and street address when the show has them. */
export function generateShowEvent(show: Show) {
  const times = showEventIsoRange(show)
  return generateStructuredData('Event', {
    name: `The Band Project at ${show.venue}`,
    startDate: times?.startDate ?? show.date,
    ...(times ? { endDate: times.endDate } : {}),
    location: {
      '@type': 'Place',
      name: show.venue,
      address: eventAddress(show),
    },
    ...(show.ticketUrl
      ? {
          offers: {
            '@type': 'Offer',
            url: show.ticketUrl,
            price: '0',
            priceCurrency: 'USD',
          },
        }
      : {}),
  })
}
