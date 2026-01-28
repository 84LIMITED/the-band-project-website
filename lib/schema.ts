export interface Show {
  id: string
  date: string // ISO date string
  venue: string
  city: string
  state: string
  address?: string // Full street address for calendar only; not displayed on site
  time?: string
  doors?: string
  ticketUrl?: string
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
}
