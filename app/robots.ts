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
          // Legacy Shopify-style paths (this site is not Shopify). Keep these specific —
          // never use a short prefix like /b (that blocks /background, /bars-breweries, etc.).
          '/blogs/',
          '/products/',
          '/pages/',
          '/collections/',
          '/cart',
          '/checkout',
          '/checkouts/',
          '/account',
          '/orders/',
          '/v1/',
          '/cdn/',
          '/wpm',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
