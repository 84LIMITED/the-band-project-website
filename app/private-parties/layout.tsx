import { Metadata } from 'next'
import { generateMetadata as genMetadata } from '@/lib/seo'

export const metadata: Metadata = genMetadata({
  title: 'Private Party Band in Northern NJ | The Band Project',
  description: 'Book The Band Project for birthdays, anniversaries, backyard parties, and private events in Wyckoff and across Bergen County. High-energy covers, pro setup, fast booking.',
  path: '/private-parties',
})

export default function PrivatePartiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
