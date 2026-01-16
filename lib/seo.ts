import { Metadata } from 'next'

export interface PageSEO {
  title: string
  description: string
  path: string
}

export function generateMetadata(seo: PageSEO): Metadata {
  // In production, use env var. In local dev, default to localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = `${baseUrl}${seo.path}`

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
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  }
}

export function generateStructuredData(type: 'MusicGroup' | 'Event' | 'WebSite' | 'WebPage', data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thebandproject.com'

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
