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

  // Convert time from "8:00 PM" format to 24-hour format
  const convertTimeTo24Hour = (timeStr: string): string => {
    if (!timeStr) return '20:00'
    
    // Remove spaces and convert to uppercase
    const cleaned = timeStr.trim().toUpperCase()
    
    // Check if already in 24-hour format (contains : and no AM/PM)
    if (cleaned.includes(':') && !cleaned.includes('AM') && !cleaned.includes('PM')) {
      return cleaned
    }
    
    // Parse 12-hour format
    const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (!match) return '20:00'
    
    let hours = parseInt(match[1], 10)
    const minutes = match[2]
    const period = match[3]?.toUpperCase() || ''
    
    if (period === 'PM' && hours !== 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }

  const generateCalendarLink = (show: Show) => {
    try {
      const time24 = convertTimeTo24Hour(show.time || '20:00')
      const dateTimeString = `${show.date}T${time24}:00`
      const startDate = new Date(dateTimeString)
      
      // Validate date
      if (isNaN(startDate.getTime())) {
        // Fallback: use date only with default time
        const fallbackDate = new Date(`${show.date}T20:00:00`)
        if (isNaN(fallbackDate.getTime())) {
          // If still invalid, return empty string to prevent error
          return ''
        }
        const endDate = new Date(fallbackDate.getTime() + 2 * 60 * 60 * 1000)
        return generateICSContent(fallbackDate, endDate, show)
      }
      
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
      return generateICSContent(startDate, endDate, show)
    } catch (error) {
      console.error('Error generating calendar link:', error)
      return ''
    }
  }

  const generateICSContent = (startDate: Date, endDate: Date, show: Show) => {
    const formatICSDate = (date: Date) => {
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    // Full address for calendar only (not displayed on site)
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
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
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
