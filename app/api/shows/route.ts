import { NextResponse } from 'next/server'
import { getUpcomingShows } from '@/lib/aws'

export const revalidate = 300

export async function GET() {
  const shows = await getUpcomingShows()

  return NextResponse.json(shows, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300',
    },
  })
}
