'use client'

import { motion } from 'framer-motion'
import { Show } from '@/lib/schema'

interface ShowCardProps {
  show: Show
  index?: number
}

export default function ShowCard({ show, index = 0 }: ShowCardProps) {
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

  // Convert single time from "8:00 PM" format to 24-hour "HH:MM"
  const convertTimeTo24Hour = (timeStr: string): string => {
    if (!timeStr) return '20:00'
    const cleaned = timeStr.trim().toUpperCase()
    if (cleaned.includes(':') && !cleaned.includes('AM') && !cleaned.includes('PM')) {
      return cleaned
    }
    const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (!match) return '20:00'
    let hours = parseInt(match[1], 10)
    const minutes = match[2]
    const period = match[3]?.toUpperCase() || ''
    if (period === 'PM' && hours !== 12) hours += 12
    else if (period === 'AM' && hours === 12) hours = 0
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }

  // Parse "8:00 PM – 11:00 PM" or "6:00 PM – 7:15 PM" into start/end 24h times
  const parseTimeRange = (timeStr: string): { start24: string; end24: string } | null => {
    if (!timeStr) return null
    const parts = timeStr.split(/[–\-]\s*/).map((s) => s.trim()).filter(Boolean)
    if (parts.length >= 2) {
      const start24 = convertTimeTo24Hour(parts[0])
      const end24 = convertTimeTo24Hour(parts[1])
      return { start24, end24 }
    }
    if (parts.length === 1) {
      const start24 = convertTimeTo24Hour(parts[0])
      return { start24, end24: start24 }
    }
    return null
  }

  const generateCalendarLink = (show: Show) => {
    try {
      const range = parseTimeRange(show.time || '')
      const start24 = range?.start24 ?? '20:00'
      const end24 = range?.end24 ?? '22:00'
      if (!show.date || !/^\d{4}-\d{2}-\d{2}$/.test(show.date)) return ''

      return generateICSContent(show, show.date, start24, end24)
    } catch (error) {
      console.error('Error generating calendar link:', error)
      return ''
    }
  }

  // Build ICS with times in Eastern (America/New_York) so calendar shows ET and correct duration
  const generateICSContent = (
    show: Show,
    dateStr: string,
    start24: string,
    end24: string
  ) => {
    const dateFmt = dateStr.replace(/-/g, '')
    const startFmt = `${dateFmt}T${start24.replace(':', '')}00`
    let endDateStr = dateStr
    let endFmt: string
    const [sh, sm] = start24.split(':').map(Number)
    const [eh, em] = end24.split(':').map(Number)
    const startMins = sh * 60 + (sm || 0)
    const endMins = eh * 60 + (em || 0)
    if (endMins <= startMins) {
      const next = new Date(dateStr)
      next.setDate(next.getDate() + 1)
      endDateStr = next.toISOString().slice(0, 10)
    }
    endFmt = `${endDateStr.replace(/-/g, '')}T${end24.replace(':', '')}00`

    const locationParts = [show.venue, show.city, show.state].filter(Boolean)
    const locationLine = show.address
      ? `${show.address}, ${locationParts.join(', ')}`
      : locationParts.join(', ')
    const descriptionLine = show.address
      ? `${show.address}\\n${show.venue}, ${show.city}, ${show.state}`
      : `${show.venue}, ${show.city}, ${show.state}`

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The Band Project//NONSGML v1.0//EN',
      'BEGIN:VTIMEZONE',
      'TZID:America/New_York',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:-0500',
      'TZOFFSETTO:-0400',
      'TZNAME:EDT',
      'DTSTART:19700308T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:-0400',
      'TZOFFSETTO:-0500',
      'TZNAME:EST',
      'DTSTART:19701101T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `DTSTART;TZID=America/New_York:${startFmt}`,
      `DTEND;TZID=America/New_York:${endFmt}`,
      `SUMMARY:The Band Project at ${show.venue}`,
      `DESCRIPTION:${descriptionLine}`,
      `LOCATION:${locationLine}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="border border-white/20 p-6 hover:border-white/40 transition-colors"
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

        <div className="flex flex-col sm:flex-row gap-3">
          {generateCalendarLink(show) && (
            <a
              href={generateCalendarLink(show)}
              download={`the-band-project-${show.date}.ics`}
              className="px-6 py-3 border border-white text-white font-medium uppercase tracking-wider text-sm text-center hover:bg-white hover:text-black transition-colors"
            >
              Add to Calendar
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}
