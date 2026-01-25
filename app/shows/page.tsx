'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'
import ShowCard from '@/components/ShowCard'
import { generateStructuredData } from '@/lib/seo'
import { Show } from '@/lib/schema'
import showsData from '@/content/shows.json'

// To update show dates/locations: edit content/shows.json (not this file).
// Use date format YYYY-MM-DD (e.g. "2026-05-09" for May 9). Display is in components/ShowCard.tsx.

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchShows() {
      try {
        const response = await fetch('/api/shows')
        if (response.ok) {
          const data = await response.json()
          setShows(data)
        } else {
          // Fallback to static data
          const allShows = showsData as Show[]
          setShows(allShows.filter((show) => show.isUpcoming))
        }
      } catch (error) {
        console.error('Error fetching shows:', error)
        // Fallback to static data
        const allShows = showsData as Show[]
        setShows(allShows.filter((show) => show.isUpcoming))
      } finally {
        setIsLoading(false)
      }
    }
    fetchShows()
  }, [])

  const filteredShows = filter === 'all' 
    ? shows 
    : shows.filter((show) => show.state.toLowerCase() === filter.toLowerCase())

  const uniqueStates = Array.from(new Set(shows.map((show) => show.state))).sort()

  const eventData = filteredShows.map((show) =>
    generateStructuredData('Event', {
      name: `The Band Project at ${show.venue}`,
      startDate: show.date,
      location: {
        '@type': 'Place',
        name: show.venue,
        address: {
          '@type': 'PostalAddress',
          addressLocality: show.city,
          addressRegion: show.state,
        },
      },
      offers: show.ticketUrl
        ? {
            '@type': 'Offer',
            url: show.ticketUrl,
            price: '0',
            priceCurrency: 'USD',
          }
        : undefined,
    })
  )

  return (
    <>
      {eventData.map((event, index) => (
        <Script
          key={index}
          id={`show-event-structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
        />
      ))}

      {/* LLM-Friendly Summary Block */}
      <section className="sr-only">
        <h2>Upcoming Shows - The Band Project</h2>
        <p>
          The Band Project has upcoming performances scheduled at venues across the greater New York Tri-State area (New York, New Jersey, and Connecticut).
           Each show includes specific date, time, venue name, and location information.
        </p>
      </section>

      <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-6 uppercase">Shows</h1>
            <p className="text-xl text-secondary">
              Upcoming performances in the greater New York Tri-State area
            </p>
          </header>

          {/* Filters (Desktop) */}
          {uniqueStates.length > 0 && (
            <div className="hidden md:flex gap-4 mb-12">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 text-sm uppercase tracking-wider border transition-colors ${
                  filter === 'all'
                    ? 'border-white bg-white text-black'
                    : 'border-white/40 text-white hover:border-white'
                }`}
              >
                All Shows
              </button>
              {uniqueStates.map((state) => (
                <button
                  key={state}
                  onClick={() => setFilter(state)}
                  className={`px-6 py-2 text-sm uppercase tracking-wider border transition-colors ${
                    filter === state
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 text-white hover:border-white'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          )}

          {/* Mobile Filter */}
          {uniqueStates.length > 0 && (
            <div className="md:hidden mb-8">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/40 text-white uppercase tracking-wider text-sm"
              >
                <option value="all">All Shows</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Shows Grid */}
          {isLoading ? (
            <div className="text-center py-24">
              <p className="text-secondary">Loading shows...</p>
            </div>
          ) : filteredShows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShows.map((show, index) => (
                <ShowCard key={show.id} show={show} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-xl text-secondary mb-4">No upcoming shows scheduled.</p>
              <p className="text-secondary">
                Check back soon or{' '}
                <a href="/contact" className="text-white underline hover:opacity-80">
                  contact us
                </a>{' '}
                to book a performance.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
