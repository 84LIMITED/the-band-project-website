import HomePage from '@/components/HomePage'
import { getUpcomingShows } from '@/lib/aws'

export const revalidate = 300

export default async function Page() {
  const upcomingShows = (await getUpcomingShows()).slice(0, 3)
  return <HomePage upcomingShows={upcomingShows} />
}
