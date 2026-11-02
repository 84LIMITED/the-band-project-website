import ShowsListing from '@/components/ShowsListing'
import { getUpcomingShows } from '@/lib/aws'

export const revalidate = 300

export default async function ShowsPage() {
  const shows = await getUpcomingShows()
  return <ShowsListing shows={shows} />
}
