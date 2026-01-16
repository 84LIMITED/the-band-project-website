import type { Metadata } from 'next'
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
  description: 'The Band Project NJ | Timeless Covers. Original Music. Always a Party.',
  keywords: ['band', 'live music', 'entertainment', 'concerts', 'shows'],
  authors: [{ name: 'The Band Project' }],
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
  openGraph: {
    title: 'The Band Project | Live Music Entertainment',
    description: 'The Band Project NJ | Timeless Covers. Original Music. Always a Party.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Band Project | Live Music Entertainment',
    description: 'The Band Project NJ | Timeless Covers. Original Music. Always a Party.',
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
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <MediaDrawerProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </MediaDrawerProvider>
      </body>
    </html>
  )
}
