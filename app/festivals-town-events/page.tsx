import Link from 'next/link'

export default function FestivalsTownEventsPage() {
  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        {/* Hero */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase">Live Band for Festivals & Town Events in Northern NJ</h1>
          <p className="text-xl text-secondary mb-4">
            Broad appeal. Professional execution. A show that brings the community together.
          </p>
          <p className="text-secondary">
            The Band Project is commonly booked for town festivals, summer concert series, and local public events—delivering high-energy live music that works for mixed ages and big outdoor crowds across Northern NJ and the NYC tri-state area.
          </p>
        </header>

        {/* Where you fit */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">Great for</h2>
          <ul className="space-y-2 text-secondary list-disc list-inside">
            <li>Town days and street fairs</li>
            <li>Summer concert series and parks programs</li>
            <li>Community fundraisers and charity events</li>
            <li>Local festivals and seasonal celebrations</li>
            <li>Public outdoor events that need high-quality live entertainment</li>
          </ul>
        </section>

        {/* What organizers get */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">Easy coordination for organizers</h2>
          <p className="text-secondary mb-4">
            We keep communication clean and logistics straightforward—so you&apos;re not chasing a band the week of the event. We can share basic technical notes and coordinate timing so the day stays on schedule.
          </p>
          <p className="text-secondary font-medium mb-2">What we focus on:</p>
          <ul className="space-y-2 text-secondary list-disc list-inside">
            <li>Clear arrival/load-in timing</li>
            <li>A set that ramps energy and keeps crowds engaged</li>
            <li>A recognizable mix that plays well across generations</li>
            <li>Strong stage presence and crowd connection</li>
          </ul>
        </section>

        {/* Programming the set */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">A set built for public crowds</h2>
          <p className="text-secondary">
            Festival and town audiences are diverse, so we program for maximum &quot;everyone knows this&quot; moments—while keeping it fresh and high-energy. Expect timeless covers, crowd favorites, and the kind of pacing that works on a festival stage.
          </p>
          <p className="text-secondary mt-4 text-sm">
            <Link href="/setlist" className="text-white underline hover:no-underline">View our setlist</Link> and <Link href="/videos" className="text-white underline hover:no-underline">watch live clips</Link>.
          </p>
        </section>

        {/* CTA */}
        <section className="border-t border-white/20 pt-12">
          <h2 className="text-2xl font-bold mb-4 uppercase">Booking a town series or festival date?</h2>
          <p className="text-secondary mb-6">
            Send your date, location, performance window, and any production notes—and we&apos;ll respond promptly.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors"
          >
            Book for Your Event
          </Link>
        </section>
      </div>
    </div>
  )
}
