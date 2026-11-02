'use client'

import { motion } from 'framer-motion'
import { MediaItem, Show } from '@/lib/schema'
import mediaData from '@/content/media.json'
import AddToCalendar from '@/components/AddToCalendar'
import { useMediaDrawer } from '@/components/MediaDrawerProvider'

interface ShowCardProps {
  show: Show
  index?: number
}

export default function ShowCard({ show, index = 0 }: ShowCardProps) {
  const { openDrawer } = useMediaDrawer()
  const clips = (mediaData as MediaItem[]).filter((item) => item.showId === show.id)

  const formatDate = (dateString: string) => {
    // Parse as local date (YYYY-MM-DD) to avoid timezone shifting to previous day
    const [y, m, d] = dateString.split('-').map(Number)
    if (!y || !m || !d) return dateString
    const date = new Date(y, m - 1, d) // month is 0-indexed
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="relative z-10 flex h-full min-w-0 flex-col gap-6 border border-white/20 p-6 hover:z-20 hover:border-white/40 transition-colors"
    >
      <div className="flex w-full min-w-0 flex-col gap-4">
        <time className="block whitespace-nowrap text-3xl font-light lg:text-4xl" dateTime={show.date}>
          {formatDate(show.date)}
        </time>
        <h3 className="text-xl font-medium">{show.venue}</h3>
        <p className="text-secondary">
          {show.city}, {show.state}
        </p>
        {show.address && <p className="text-sm text-secondary">{show.address}</p>}
        {show.time && (
          <p className="text-sm text-secondary">
            {show.doors && `Doors: ${show.doors} | `}Show: {show.time}
          </p>
        )}
      </div>

      <div className="mt-auto flex w-full flex-col items-stretch gap-3 self-start md:w-auto md:items-start">
        {clips.length > 0 && (
          <button
            type="button"
            onClick={() => openDrawer(show.id)}
            aria-label={`Watch highlights from ${show.venue}`}
            className="w-full self-start px-6 py-3 border border-white text-white font-medium uppercase tracking-wider text-sm text-center hover:bg-white hover:text-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:w-auto"
          >
            Watch
          </button>
        )}
        <AddToCalendar show={show} />
      </div>
    </motion.article>
  )
}
