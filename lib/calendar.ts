import type { Show } from '@/lib/schema'

const TIME_ZONE = 'America/New_York'
const SITE_URL = 'https://thebandproject.live'
const DEFAULT_DURATION_MINUTES = 180

type CalendarShow = Pick<Show, 'id' | 'date' | 'venue' | 'city' | 'state' | 'address' | 'time'>

export function hasValidShowDate(show: { date?: string }): boolean {
  if (!show.date || !/^\d{4}-\d{2}-\d{2}$/.test(show.date)) return false
  const [year, month, day] = show.date.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  )
}

function parseClock(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i)
  if (!match) return null

  let hours = Number(match[1])
  const minutes = match[2] ? Number(match[2]) : 0
  const period = match[3]?.toUpperCase()
  if (minutes > 59 || hours > 23) return null

  if (period === 'PM' && hours < 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  if (period && (hours > 23 || Number(match[1]) > 12)) return null

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function parseTimeRange(time?: string): { start: string; end: string | null } | null {
  if (!time?.trim()) return null
  const parts = time.split(/\s*[–—-]\s*/).map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return null
  const start = parseClock(parts[0])
  if (!start) return null
  if (parts.length === 1) return { start, end: null }
  const end = parseClock(parts[1])
  return { start, end }
}

function addMinutes(dateStr: string, hhmm: string, minutesToAdd: number): { date: string; time: string } {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = hhmm.split(':').map(Number)
  const total = hours * 60 + minutes + minutesToAdd
  const dayDelta = Math.floor(total / 1440)
  const remainder = ((total % 1440) + 1440) % 1440
  const utc = new Date(Date.UTC(year, month - 1, day + dayDelta))
  return {
    date: utc.toISOString().slice(0, 10),
    time: `${String(Math.floor(remainder / 60)).padStart(2, '0')}:${String(remainder % 60).padStart(2, '0')}`,
  }
}

function resolveRange(show: CalendarShow): { allDay: true } | { allDay: false; start: { date: string; time: string }; end: { date: string; time: string } } | null {
  if (!hasValidShowDate(show)) return null
  const parsed = parseTimeRange(show.time)
  if (!parsed) return { allDay: true }

  const endClock = parsed.end
  const end = endClock
    ? (() => {
        const [startH, startM] = parsed.start.split(':').map(Number)
        const [endH, endM] = endClock.split(':').map(Number)
        if (endH * 60 + endM <= startH * 60 + startM) {
          return addMinutes(show.date, endClock, 24 * 60)
        }
        return { date: show.date, time: endClock }
      })()
    : addMinutes(show.date, parsed.start, DEFAULT_DURATION_MINUTES)

  return {
    allDay: false,
    start: { date: show.date, time: parsed.start },
    end,
  }
}

function timeZoneOffsetMs(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)
  const mapped = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const hour = mapped.hour === '24' ? 0 : Number(mapped.hour)
  const asUtc = Date.UTC(
    Number(mapped.year),
    Number(mapped.month) - 1,
    Number(mapped.day),
    hour,
    Number(mapped.minute),
    Number(mapped.second)
  )
  return asUtc - instant.getTime()
}

function zonedLocalToUtc(dateStr: string, hhmm: string, timeZone = TIME_ZONE): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = hhmm.split(':').map(Number)
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hours, minutes, 0)
  const firstOffset = timeZoneOffsetMs(timeZone, new Date(wallClockAsUtc))
  const refined = wallClockAsUtc - timeZoneOffsetMs(timeZone, new Date(wallClockAsUtc - firstOffset))
  return new Date(refined)
}

function formatUtcStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
}

function formatLocalStamp(dateStr: string, hhmm: string): string {
  return `${dateStr.replace(/-/g, '')}T${hhmm.replace(':', '')}00`
}

function formatDateStamp(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

function nextDate(dateStr: string): string {
  return addMinutes(dateStr, '00:00', 24 * 60).date
}

function locationLine(show: CalendarShow): string {
  if (show.address) return `${show.venue}, ${show.address}`
  return [show.venue, show.city, show.state].filter(Boolean).join(', ')
}

function descriptionText(show: CalendarShow): string {
  const place = [show.venue, show.city, show.state].filter(Boolean).join(', ')
  return [`The Band Project at ${place}.`, show.address, SITE_URL].filter(Boolean).join('\n')
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\n|\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function foldLine(line: string): string {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line

  const chunks: string[] = []
  let rest = line
  let limit = 75
  while (encoder.encode(rest).length > limit) {
    let bytes = 0
    let cut = 0
    for (const char of rest) {
      const size = encoder.encode(char).length
      if (bytes + size > limit) break
      bytes += size
      cut += char.length
    }
    if (cut === 0) break
    chunks.push(rest.slice(0, cut))
    rest = rest.slice(cut)
    limit = 74
  }
  if (rest) chunks.push(rest)
  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join('\r\n')
}

function vtimezone(): string[] {
  return [
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
  ]
}

export function buildIcs(show: CalendarShow): string | null {
  const range = resolveRange(show)
  if (!range) return null

  const summary = `The Band Project at ${show.venue}`
  const location = locationLine(show)
  const description = descriptionText(show)
  const uid = `${show.id}@thebandproject.live`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Band Project//thebandproject.live//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  if (range.allDay) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatUtcStamp(new Date())}`,
      `DTSTART;VALUE=DATE:${formatDateStamp(show.date)}`,
      `DTEND;VALUE=DATE:${formatDateStamp(nextDate(show.date))}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    )
  } else {
    lines.push(
      ...vtimezone(),
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatUtcStamp(new Date())}`,
      `DTSTART;TZID=${TIME_ZONE}:${formatLocalStamp(range.start.date, range.start.time)}`,
      `DTEND;TZID=${TIME_ZONE}:${formatLocalStamp(range.end.date, range.end.time)}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    )
  }

  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

export function buildGoogleCalendarUrl(show: CalendarShow): string | null {
  const range = resolveRange(show)
  if (!range) return null

  const dates = range.allDay
    ? `${formatDateStamp(show.date)}/${formatDateStamp(nextDate(show.date))}`
    : `${formatUtcStamp(zonedLocalToUtc(range.start.date, range.start.time))}/${formatUtcStamp(zonedLocalToUtc(range.end.date, range.end.time))}`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `The Band Project at ${show.venue}`,
    dates,
    details: descriptionText(show),
    location: locationLine(show),
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcs(show: CalendarShow): void {
  const ics = buildIcs(show)
  if (!ics || typeof document === 'undefined') return

  const filename = `the-band-project-${show.date}.ics`
  const file = new File([ics], filename, { type: 'text/calendar' })
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
