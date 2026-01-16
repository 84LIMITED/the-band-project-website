import { NextResponse } from 'next/server'
import { getUpcomingShows } from '@/lib/aws'
import showsData from '@/content/shows.json'
import { Show } from '@/lib/schema'

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    new URL(request.url).origin

  try {
    // Fetch upcoming shows
    let shows: Show[] = []
    try {
      shows = await getUpcomingShows()
    } catch (error) {
      console.error('DynamoDB fetch failed, using static data:', error)
      shows = (showsData as Show[]).filter((show) => show.isUpcoming)
    }

    // Format shows for LLM consumption
    const formattedShows = shows.map((show) => ({
      date: show.date,
      venue: show.venue,
      city: show.city,
      state: show.state,
      time: show.time,
      ticketUrl: show.ticketUrl,
    }))

    const summary = {
      bandName: 'The Band Project',
      description: 'The Band Project NJ | Timeless Covers. Original Music. Always a Party.',
      genre: ['Rock', 'Jazz', 'Blues'],
      baseLocation: 'United States',
      influences: [
        'Pink Floyd',
        'The Beatles',
        'Miles Davis',
        'John Coltrane',
        'Led Zeppelin',
      ],
      upcomingShows: formattedShows,
      officialLinks: {
        website: baseUrl,
        contact: `${baseUrl}/contact`,
        shows: `${baseUrl}/shows`,
        background: `${baseUrl}/background`,
        gear: `${baseUrl}/gear`,
      },
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(summary, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating LLM summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
