import { NextResponse } from 'next/server'
import { getUpcomingShows } from '@/lib/aws'
import showsData from '@/content/shows.json'
import { Show } from '@/lib/schema'

export async function GET() {
  try {
    // Try to fetch from DynamoDB first, fallback to static data
    let shows: Show[] = []
    
    try {
      shows = await getUpcomingShows()
    } catch (error) {
      console.error('DynamoDB fetch failed, using static data:', error)
    }

    // If no shows from DynamoDB, use static data
    if (shows.length === 0) {
      shows = (showsData as Show[]).filter((show) => show.isUpcoming)
    }

    // Sort by date (with validation)
    shows.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      // Handle invalid dates by putting them at the end
      if (isNaN(dateA) && isNaN(dateB)) return 0
      if (isNaN(dateA)) return 1
      if (isNaN(dateB)) return -1
      return dateA - dateB
    })

    return NextResponse.json(shows, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching shows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shows' },
      { status: 500 }
    )
  }
}
