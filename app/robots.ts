import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thebandproject.live'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          // Legacy/old platform paths that no longer exist (improves crawl efficiency)
          '/blogs/',
          '/products/',
          '/pages/',
          '/collections/',
          '/v1/',
          '/cdn',
          '/wpm',
          '/b',
          '/$', // e.g. /${t} or other malformed
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
