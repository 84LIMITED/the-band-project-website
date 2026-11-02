import { NextResponse } from 'next/server'
import { getUpcomingShows } from '@/lib/aws'
import { SIGNUP_PAGE_DESCRIPTION, SIGNUP_PAGE_PATH, SITE_ORIGIN } from '@/lib/newsletter-config'

export const revalidate = 300

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || SITE_ORIGIN

  try {
    const shows = await getUpcomingShows()

    // Format shows for LLM consumption
    const formattedShows = shows.map((show) => ({
      date: show.date,
      venue: show.venue,
      city: show.city,
      state: show.state,
      address: show.address,
      time: show.time,
      ticketUrl: show.ticketUrl,
    }))

    const summary = {
      bandName: 'The Band Project',
      description: 'The Band Project NJ | Timeless Covers. Original Music. Always a Party.',
      genre: ['Rock', 'Jazz', 'Blues'],
      baseLocation: 'Greater New York Tri-State Area (New York, New Jersey, Connecticut)',
      influences: [
        'Pink Floyd',
        'The Beatles',
        'Miles Davis',
        'John Coltrane',
        'Led Zeppelin',
      ],
      upcomingShows: formattedShows,
      signup: {
        description: "Sign up for email updates about The Band Project's upcoming shows and events.",
        url: `${SITE_ORIGIN}${SIGNUP_PAGE_PATH}`,
        cadence: '8-10 emails a year',
        details: SIGNUP_PAGE_DESCRIPTION,
      },
      officialLinks: {
        website: baseUrl,
        contact: `${baseUrl}/contact`,
        shows: `${baseUrl}/shows`,
        showAlerts: `${SITE_ORIGIN}${SIGNUP_PAGE_PATH}`,
        background: `${baseUrl}/background`,
        gear: `${baseUrl}/gear`,
      },
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(summary, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300',
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
