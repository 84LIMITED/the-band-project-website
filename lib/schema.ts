export interface Show {
  id: string
  date: string // ISO date string
  venue: string
  city: string
  state: string
  address?: string // Full street address, shown on the card and used in calendar files and event structured data
  time?: string
  doors?: string
  ticketUrl?: string
  /** Written on new items. Readers ignore it and compare `date` with today in America/New_York. */
  isUpcoming: boolean
}

export interface ContactMessage {
  id?: string
  name: string
  email: string
  organization?: string
  eventDate?: string
  location?: string
  message: string
  createdAt?: string
}

export interface MediaItem {
  id: string
  title: string
  type: 'video' | 'image'
  url: string
  thumbnail?: string
  description?: string
  orientation?: 'vertical' | 'landscape'
  showId?: string
  venue?: string
  city?: string
  state?: string
  date?: string
}
