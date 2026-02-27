import Link from 'next/link'
import { Metadata } from 'next'

export default function PrivatePartiesPage() {
  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        {/* Hero */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase">Live Band for Private Parties in Northern NJ</h1>
          <p className="text-xl text-secondary mb-4">
            Make it feel like a real night out—at your house, your venue, or your backyard.
          </p>
          <p className="text-secondary">
            The Band Project is a Wyckoff, NJ–based live band delivering timeless covers, original music, and an always-a-party vibe for private events across Bergen County and the NYC tri-state area.
          </p>
        </header>

        {/* Perfect for */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">Perfect for</h2>
          <ul className="space-y-2 text-secondary list-disc list-inside">
            <li>Birthdays and milestone celebrations</li>
            <li>Anniversaries and family gatherings</li>
            <li>Backyard parties and pool parties</li>
            <li>Graduation parties</li>
            <li>Block parties and community events</li>
            <li>&quot;Just because&quot; nights that turn into something bigger</li>
          </ul>
        </section>

        {/* The experience */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">What it&apos;s like to have us play your event</h2>
          <p className="text-secondary mb-4">
            We&apos;re built for the room—whether you want upbeat background music while people arrive, or a high-energy set that gets everyone singing and moving. We read the crowd, control volume appropriately, and keep the flow tight so the night keeps building.
          </p>
          <p className="text-secondary font-medium mb-2">Expect:</p>
          <ul className="space-y-2 text-secondary list-disc list-inside mb-4">
            <li>A setlist that&apos;s recognizable, crowd-friendly, and tailored to your vibe</li>
            <li>Tight transitions and pacing that keep guests engaged</li>
            <li>Professional communication before the event so there are no surprises</li>
          </ul>
          <p className="text-secondary text-sm">
            <Link href="/setlist" className="text-white underline hover:no-underline">See our setlist</Link> and <Link href="/videos" className="text-white underline hover:no-underline">watch videos</Link>.
          </p>
        </section>

        {/* Setup + logistics */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 uppercase">Setup, space, and timing</h2>
          <p className="text-secondary mb-4">
            We aim to make this easy for hosts. We can work with indoor or outdoor setups and coordinate around the schedule you already have (food, speeches, cake, etc.).
          </p>
          <p className="text-secondary mb-2">To quote quickly, we typically ask for:</p>
          <ul className="space-y-1 text-secondary list-disc list-inside">
            <li>Event date + start/end time window</li>
            <li>Venue/city (or home location)</li>
            <li>Indoor/outdoor details (and weather plan if outdoors)</li>
            <li>Approximate guest count and the general vibe you want</li>
          </ul>
        </section>

        {/* CTA */}
        <section className="border-t border-white/20 pt-12">
          <h2 className="text-2xl font-bold mb-4 uppercase">Ready to check availability?</h2>
          <p className="text-secondary mb-6">
            Tell us your date, venue/city, and what kind of night you&apos;re aiming for—and we&apos;ll respond promptly with next steps.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors"
          >
            Request a Quote
          </Link>
        </section>
      </div>
    </div>
  )
}
