import { Metadata } from 'next'
import { generateMetadata as genMetadata } from '@/lib/seo'

export const metadata: Metadata = genMetadata({
  title: 'Bar & Brewery Cover Band NJ | The Band Project',
  description: 'High-energy NJ cover band for bars and breweries across Bergen County and the NYC area. Great crowd interaction, reliable load-in, and a setlist built for packed rooms.',
  path: '/bars-breweries',
})

export default function BarsBreweriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
