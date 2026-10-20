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
      className="relative z-10 border border-white/20 p-6 hover:z-20 hover:border-white/40 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <time className="text-3xl font-light mb-2 block" dateTime={show.date}>
            {formatDate(show.date)}
          </time>
          <h3 className="text-xl font-medium mb-1">{show.venue}</h3>
          <p className="text-secondary">
            {show.city}, {show.state}
          </p>
          {show.time && (
            <p className="text-sm text-secondary mt-2">
              {show.doors && `Doors: ${show.doors} | `}Show: {show.time}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:min-w-[220px]">
          {clips.length > 0 && (
            <button
              type="button"
              onClick={() => openDrawer(show.id)}
              aria-label={`Watch highlights from ${show.venue}`}
              className="w-full px-6 py-3 border border-white text-white font-medium uppercase tracking-wider text-sm text-center hover:bg-white hover:text-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Watch
            </button>
          )}
          <AddToCalendar show={show} />
        </div>
      </div>
    </motion.article>
  )
}
