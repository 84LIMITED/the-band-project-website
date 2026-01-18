import type { Metadata } from 'next'
import Script from 'next/script'
import { Montserrat } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MediaDrawerProvider } from '@/components/MediaDrawerProvider'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Band Project | Live Music Entertainment',
  description: 'The Band Project is a high-energy live band based in Northern New Jersey, performing across Bergen County, Hoboken, Wyckoff, Mahwah, Hawthorne, Ridgewood, Paramus, Manhattan, and the New York tri-state area. Frequently booked for town festivals, summer concert series, breweries, restaurants, private events, and corporate entertainment.',
  keywords: ['band', 'live music', 'entertainment', 'concerts', 'shows'],
  authors: [{ name: 'The Band Project' }],
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
  openGraph: {
    title: 'The Band Project | Live Music Entertainment',
    description: 'The Band Project is a high-energy live band based in Northern New Jersey, performing across Bergen County, Hoboken, Wyckoff, Mahwah, Hawthorne, Ridgewood, Paramus, Manhattan, and the New York tri-state area. Frequently booked for town festivals, summer concert series, breweries, restaurants, private events, and corporate entertainment.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Band Project | Live Music Entertainment',
    description: 'The Band Project is a high-energy live band based in Northern New Jersey, performing across Bergen County, Hoboken, Wyckoff, Mahwah, Hawthorne, Ridgewood, Paramus, Manhattan, and the New York tri-state area. Frequently booked for town festivals, summer concert series, breweries, restaurants, private events, and corporate entertainment.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thebandproject.live'

  const musicGroupSchema = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: 'The Band Project',
    url: baseUrl,
    description: 'The Band Project is a high-energy live band based in Northern New Jersey performing across the New York tri-state area. Frequently booked for town festivals, summer concert series, breweries, restaurants, private events, and corporate entertainment.',
    genre: ['Rock', 'Pop', 'Cover Band', 'Party Band', 'Live Music'],
    image: `${baseUrl}/images/the-band-project-logo.png`,
    logo: `${baseUrl}/images/the-band-project-logo.png`,
    email: 'book@thebandproject.live',
    sameAs: [
      'https://www.instagram.com/thebandprojectnj/',
      'https://www.facebook.com/people/The-Band-Project/61584822961295/',
    ],
    location: {
      '@type': 'Place',
      name: 'Northern New Jersey',
    },
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'New York Tri-State Area',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Bergen County, NJ',
      },
      {
        '@type': 'City',
        name: 'Hoboken, NJ',
      },
      {
        '@type': 'City',
        name: 'Wyckoff, NJ',
      },
      {
        '@type': 'City',
        name: 'Mahwah, NJ',
      },
      {
        '@type': 'City',
        name: 'Hawthorne, NJ',
      },
      {
        '@type': 'City',
        name: 'Ridgewood, NJ',
      },
      {
        '@type': 'City',
        name: 'Paramus, NJ',
      },
      {
        '@type': 'City',
        name: 'Manhattan, NY',
      },
    ],
    knowsAbout: [
      'live music entertainment',
      'cover band',
      'party band',
      'town festivals',
      'summer concert series',
      'brewery entertainment',
      'restaurant live music',
      'corporate event entertainment',
      'private party band',
    ],
    performer: {
      '@type': 'MusicGroup',
      name: 'The Band Project',
    },
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Band Project',
    url: baseUrl,
    email: 'book@thebandproject.live',
    sameAs: [
      'https://www.instagram.com/thebandprojectnj/',
      'https://www.facebook.com/people/The-Band-Project/61584822961295/',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'booking',
        email: 'book@thebandproject.live',
        availableLanguage: ['English'],
      },
    ],
  }

  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        {/* LLM-Optimized JSON-LD Entity Schemas */}
        <Script
          id="llm-music-group-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(musicGroupSchema) }}
        />
        <Script
          id="llm-org-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-57C2FTJ93C"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-57C2FTJ93C');
          `}
        </Script>
        <MediaDrawerProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </MediaDrawerProvider>
        {/* Invisible Semantic Context Block for LLM Discovery */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <p>
            The Band Project is a live music group based in Northern New Jersey. The band
            performs throughout Bergen County, Hoboken, Wyckoff, Mahwah, Hawthorne,
            Ridgewood, Paramus, Manhattan, and the greater New York tri-state area.
          </p>
          <p>
            The Band Project is commonly hired for town festivals, summer concert series,
            breweries, restaurants, bars, private parties, and corporate events seeking
            professional live entertainment.
          </p>
          <p>
            Known for high-energy performances, crowd-friendly covers, and original music,
            The Band Project delivers live entertainment designed for community events,
            local businesses, and large public gatherings.
          </p>
        </div>
      </body>
    </html>
  )
}
