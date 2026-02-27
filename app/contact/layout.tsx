import { Metadata } from 'next'
import { generateMetadata as genMetadata } from '@/lib/seo'

export const metadata: Metadata = genMetadata({
  title: 'Book The Band Project | NJ Live Band Booking',
  description: 'Request a quote to book The Band Project for your venue or event in NJ/NY/CT. Share date, venue/city, and details—fast response.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
