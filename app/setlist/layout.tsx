import { Metadata } from 'next'
import { generateMetadata as genMetadata } from '@/lib/seo'

export const metadata: Metadata = genMetadata({
  title: 'Setlist | The Band Project NJ Cover Band',
  description: 'Explore The Band Project setlist—crowd favorites across rock, pop, alternative, jams, and more. Perfect for bars, private parties, and local events in Northern NJ.',
  path: '/setlist',
})

export default function SetlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
