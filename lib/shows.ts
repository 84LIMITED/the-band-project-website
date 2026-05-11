import type { Show } from '@/lib/schema'

/** YYYY-MM-DD for "today" in America/New_York (band locale). String compare matches ISO show dates. */
export function getEasternCalendarDate(reference = new Date()): string {
  return reference.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

/** True if the show is today or a future calendar day in Eastern time. */
export function isShowDateUpcoming(show: Pick<Show, 'date'>, reference = new Date()): boolean {
  const today = getEasternCalendarDate(reference)
  return show.date >= today
}

export function filterUpcomingShowsByDate(shows: Show[], reference = new Date()): Show[] {
  return shows.filter((s) => isShowDateUpcoming(s, reference))
}
