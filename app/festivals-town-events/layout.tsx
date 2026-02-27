import { Metadata } from 'next'
import { generateMetadata as genMetadata } from '@/lib/seo'

export const metadata: Metadata = genMetadata({
  title: 'Festival & Town Event Band NJ | The Band Project',
  description: 'Book The Band Project for town days, summer concert series, and local festivals in Northern NJ. High-energy crowd favorites, professional production, easy coordination.',
  path: '/festivals-town-events',
})

export default function FestivalsTownEventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
