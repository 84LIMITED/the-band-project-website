'use client'

import { useState } from 'react'
import Script from 'next/script'
import ShowCard from '@/components/ShowCard'
import SignupForm from '@/components/SignupForm'
import { SIGNUP_PAGE_PATH } from '@/lib/newsletter-config'
import { generateShowEvent } from '@/lib/seo'
import { Show } from '@/lib/schema'

export default function ShowsListing({ shows }: { shows: Show[] }) {
  const [filter, setFilter] = useState<string>('all')

  const filteredShows = filter === 'all' 
    ? shows 
    : shows.filter((show) => show.state.toLowerCase() === filter.toLowerCase())

  const uniqueStates = Array.from(new Set(shows.map((show) => show.state))).sort()

  const eventData = filteredShows.map((show) => generateShowEvent(show))

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
          {filteredShows.length > 0 ? (
            <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
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

          <div id="show-reminders" className="mt-16">
            <SignupForm source="shows" variant="full" />
            <p className="mt-6 text-sm">
              <a href={SIGNUP_PAGE_PATH} className="text-white underline hover:opacity-80">
                Get show updates
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
