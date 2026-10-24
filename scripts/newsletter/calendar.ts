export interface NewsletterCalendar {
  title: string
  start: string
  end: string
  timezone: string
  address: string
  description: string
}

const SITE_ORIGIN = 'https://thebandproject.live'
const LOCAL_ISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

export function calendarIsComplete(calendar: Partial<NewsletterCalendar> | undefined): calendar is NewsletterCalendar {
  if (!calendar) return false
  return Boolean(
    calendar.title &&
      calendar.start &&
      calendar.end &&
      calendar.timezone &&
      calendar.address &&
      calendar.description &&
      LOCAL_ISO.test(calendar.start) &&
      LOCAL_ISO.test(calendar.end)
  )
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function encodeQuery(value: string): string {
  return encodeURIComponent(value).replace(/%2F/gi, '/')
}

function googleDetails(description: string): string {
  return description.replace(/ Show details: /, ' ')
}

function outlookBody(description: string): string {
  return description.replace(/\s*Show details:[\s\S]*$/, '').trim()
}

function localParts(isoLocal: string): { date: string; time: string; seconds: string; stamp: string } {
  const match = isoLocal.match(LOCAL_ISO)
  if (!match) throw new Error(`Calendar time must be local ISO without an offset: ${isoLocal}`)
  const date = `${match[1]}-${match[2]}-${match[3]}`
  const time = `${match[4]}:${match[5]}`
  const seconds = match[6] || '00'
  return {
    date,
    time,
    seconds,
    stamp: `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}${seconds}`,
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

function zonedLocalToUtc(dateStr: string, hhmm: string, timeZone: string): Date {
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

function offsetSuffix(dateStr: string, hhmm: string, timeZone: string): string {
  const utc = zonedLocalToUtc(dateStr, hhmm, timeZone)
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = hhmm.split(':').map(Number)
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hours, minutes, 0)
  const offsetMin = Math.round((wallClockAsUtc - utc.getTime()) / 60000)
  const sign = offsetMin >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  const hoursPart = String(Math.floor(abs / 60)).padStart(2, '0')
  const minutesPart = String(abs % 60).padStart(2, '0')
  return `${sign}${hoursPart}:${minutesPart}`
}

function outlookDateTime(isoLocal: string, timeZone: string): string {
  const parts = localParts(isoLocal)
  return `${parts.date}T${parts.time}:${parts.seconds}${offsetSuffix(parts.date, parts.time, timeZone)}`
}

export function googleCalendarUrl(calendar: NewsletterCalendar): string {
  const dates = `${localParts(calendar.start).stamp}/${localParts(calendar.end).stamp}`
  const query = [
    ['action', 'TEMPLATE'],
    ['text', encodeQuery(calendar.title)],
    ['dates', dates],
    ['ctz', encodeQuery(calendar.timezone)],
    ['location', encodeQuery(calendar.address)],
    ['details', encodeQuery(googleDetails(calendar.description))],
  ]
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return `https://calendar.google.com/calendar/render?${query}`
}

export function outlookCalendarUrl(calendar: NewsletterCalendar): string {
  const query = [
    ['path', '/calendar/action/compose'],
    ['rru', 'addevent'],
    ['subject', encodeQuery(calendar.title)],
    ['startdt', outlookDateTime(calendar.start, calendar.timezone)],
    ['enddt', outlookDateTime(calendar.end, calendar.timezone)],
    ['location', encodeQuery(calendar.address)],
    ['body', encodeQuery(outlookBody(calendar.description))],
  ]
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return `https://outlook.live.com/calendar/0/deeplink/compose?${query}`
}

export function icsUrl(issueId: string): string {
  return `${SITE_ORIGIN}/calendar/${issueId}.ics`
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\n|\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function alarmLabel(title: string): string {
  const prefix = 'The Band Project at '
  if (title.startsWith(prefix)) return `The Band Project tomorrow at ${title.slice(prefix.length)}`
  return title
}

export function buildNewsletterIcs(issueId: string, calendar: NewsletterCalendar, dtstamp = new Date()): string {
  const start = localParts(calendar.start)
  const end = localParts(calendar.end)
  const urlMatch = calendar.description.match(/https?:\/\/\S+/)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Band Project//Show Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${issueId}@thebandproject.live`,
    `DTSTAMP:${formatUtcStamp(dtstamp)}`,
    `DTSTART:${formatUtcStamp(zonedLocalToUtc(start.date, start.time, calendar.timezone))}`,
    `DTEND:${formatUtcStamp(zonedLocalToUtc(end.date, end.time, calendar.timezone))}`,
    `SUMMARY:${escapeIcsText(calendar.title)}`,
    `LOCATION:${escapeIcsText(calendar.address)}`,
    `DESCRIPTION:${escapeIcsText(calendar.description.replace(/\s*Show details:\s*/g, '\n'))}`,
    `URL:${urlMatch ? urlMatch[0] : `${SITE_ORIGIN}/shows`}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(alarmLabel(calendar.title))}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.join('\r\n')}\r\n`
}

export function calendarBlockHtml(issueId: string, calendar: NewsletterCalendar, buttonText: string): string {
  const buttonHref = escapeHtml(icsUrl(issueId))
  const googleHref = escapeHtml(googleCalendarUrl(calendar))
  const outlookHref = escapeHtml(outlookCalendarUrl(calendar))
  const label = escapeHtml(buttonText)
  return `<tr>
          <td align="center" bgcolor="#000000" style="padding:0;background-color:#000000;color:#FFFFFF;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px auto;">
              <tr>
                <td align="center" bgcolor="#000000" style="background-color:#000000;border:2px solid #BDBDBD;border-radius:4px;">
                  <a href="${buttonHref}" target="_blank" class="btn" style="display:inline-block;padding:12px 28px;font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;-webkit-text-fill-color:#FFFFFF;text-decoration:none;">
                    <span style="color:#FFFFFF;-webkit-text-fill-color:#FFFFFF;">${label}</span>
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px 0;font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#BDBDBD;background-color:#000000;">Or add to <a href="${googleHref}" target="_blank" style="color:#FFFFFF;background-color:#000000;text-decoration:underline;">Google Calendar</a> · <a href="${outlookHref}" target="_blank" style="color:#FFFFFF;background-color:#000000;text-decoration:underline;">Outlook</a></p>
          </td>
        </tr>`
}

export function calendarBlockText(issueId: string, calendar: NewsletterCalendar, buttonText: string): string {
  return `${buttonText}: ${icsUrl(issueId)}
Google Calendar: ${googleCalendarUrl(calendar)}
Outlook: ${outlookCalendarUrl(calendar)}
`
}
