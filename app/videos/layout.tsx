import { Metadata } from 'next'
import { generateMetadata as genMetadata } from '@/lib/seo'

export const metadata: Metadata = genMetadata({
  title: 'Videos | The Band Project Live Band NJ',
  description: 'Watch The Band Project live—high-energy performance clips from bars, festivals, and private parties across Northern NJ. Inquire about booking in minutes.',
  path: '/videos',
})

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return children
}
