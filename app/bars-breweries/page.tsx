import Link from 'next/link'

export default function BarsBreweriesPage() {
  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        {/* Hero */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase">The Band Project for Bars & Breweries in NJ</h1>
          <p className="text-xl text-secondary mb-4">
            High-energy covers. Strong crowd connection. Built for packed rooms.
          </p>
          <p className="text-secondary">
            The Band Project plays bars and breweries across Bergen County and the NYC tri-state area—bringing a show that keeps people in the room, boosts repeat visits, and turns a normal night into an event.
          </p>
        </header>

        {/* Why venues book you */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">Why venues bring us back</h2>
          <p className="text-secondary mb-4">
            A great bar night is more than good songs—it&apos;s pacing, interaction, and momentum. We build sets to keep the room moving, keep the bar busy, and keep people hanging for &quot;one more.&quot;
          </p>
          <p className="text-secondary font-medium mb-2">Venue-friendly approach:</p>
          <ul className="space-y-2 text-secondary list-disc list-inside">
            <li>Smooth load-in / load-out and clear communication</li>
            <li>Set pacing that builds energy through the night</li>
            <li>Flexible formats for early and late crowds</li>
            <li>Crowd-friendly favorites with enough edge to stay interesting</li>
          </ul>
        </section>

        {/* Promoting the gig */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">Promotion support</h2>
          <p className="text-secondary">
            If you&apos;re running weekly music or want to build a recurring series, we&apos;re happy to support promotion with what venues typically need: a short description, photos, and performance clips—plus consistent details for flyers and social posts.
          </p>
          <p className="text-secondary mt-4 text-sm">
            <Link href="/videos" className="text-white underline hover:no-underline">Watch our videos</Link> and <Link href="/shows" className="text-white underline hover:no-underline">see upcoming shows</Link>.
          </p>
        </section>

        {/* What to share for booking */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">Booking details (so we can confirm fast)</h2>
          <p className="text-secondary mb-2">For a quick yes/no and accurate details, send:</p>
          <ul className="space-y-1 text-secondary list-disc list-inside">
            <li>Date(s) you&apos;re considering</li>
            <li>Venue name + town</li>
            <li>Preferred set times / music window</li>
            <li>Any notes on volume, setup location, or special theme nights</li>
          </ul>
        </section>

        {/* CTA */}
        <section className="border-t border-white/20 pt-12">
          <h2 className="text-2xl font-bold mb-4 uppercase">Let&apos;s lock in a date</h2>
          <p className="text-secondary mb-6">
            Send the basics and we&apos;ll reply promptly.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors"
          >
            Inquire About Dates
          </Link>
        </section>
      </div>
    </div>
  )
}
