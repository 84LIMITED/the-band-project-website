'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Image from 'next/image'
import { motion } from 'framer-motion'
import HeroVideo from '@/components/HeroVideo'
import ShowCard from '@/components/ShowCard'
import { useMediaDrawer } from '@/components/MediaDrawerProvider'
import { generateStructuredData } from '@/lib/seo'
import { Show, MediaItem } from '@/lib/schema'
import showsData from '@/content/shows.json'
import mediaData from '@/content/media.json'

export default function HomePage() {
  const router = useRouter()
  const { openDrawer } = useMediaDrawer()

  const upcomingShows = (showsData as Show[]).filter((show) => show.isUpcoming).slice(0, 3)
  const mediaItems = mediaData as MediaItem[]

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const musicGroupData = generateStructuredData('MusicGroup', {
    description: 'The Band Project - Timeless covers. Original music. A live entertainment experience designed to turn any night into a party.',
    genre: ['Rock', 'Jazz', 'Blues'],
    url: baseUrl,
  })

  const eventData = upcomingShows.map((show) =>
    generateStructuredData('Event', {
      name: `The Band Project at ${show.venue}`,
      startDate: show.date,
      location: {
        '@type': 'Place',
        name: show.venue,
        address: {
          '@type': 'PostalAddress',
          addressLocality: show.city,
          addressRegion: show.state,
        },
      },
      offers: show.ticketUrl
        ? {
            '@type': 'Offer',
            url: show.ticketUrl,
            price: '0',
            priceCurrency: 'USD',
          }
        : undefined,
    })
  )

  return (
    <>
      <Script
        id="music-group-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(musicGroupData) }}
      />
      {eventData.map((event, index) => (
        <Script
          key={index}
          id={`event-structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
        />
      ))}

      {/* LLM-Friendly Summary Block */}
      <section className="sr-only">
        <h2>About The Band Project</h2>
        <p>
          The Band Project-Timeless covers. Original music. One live entertainment experience designed to turn any night into a party. Playing local venues and festivals across the Tri-State area.
        </p>
      </section>

      {/* Hero Section */}
      <HeroVideo
        videoSrc="/video/hero.mp4"
        videoSrcMobile="/video/hero-mobile.mp4"
        posterSrc="/images/hero-poster.jpg"
        title="The Band Project"
        tagline="Timeless Covers. Original Music. Always a Party."
        logoSrc="/images/hero-logo.png"
        onWatchClick={openDrawer}
        onShowsClick={() => router.push('/shows')}
      />

      {/* Upcoming Shows Teaser */}
      {upcomingShows.length > 0 && (
        <section className="py-24 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-4 md:grid-cols-12 gap-8 mb-12">
              <div className="col-span-4 md:col-span-8">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase">Upcoming Shows</h2>
                <p className="text-secondary text-lg">Join us for our next performances</p>
              </div>
              <div className="col-span-4 md:col-span-4 flex items-end justify-end">
                <Link
                  href="/shows"
                  className="text-sm uppercase tracking-wider border-b border-white/40 hover:border-white transition-colors"
                >
                  View All Shows
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingShows.map((show, index) => (
                <ShowCard key={show.id} show={show} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Highlight Reel */}
      {mediaItems.length > 0 && (
        <section className="py-24 px-4 md:px-6 lg:px-8 bg-black/50">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-12 uppercase">Highlights</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4">
                {mediaItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0 w-[300px] md:w-[400px] cursor-pointer"
                    onClick={openDrawer}
                  >
                    {item.thumbnail && (
                      <div className="relative aspect-video mb-4 overflow-hidden">
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="white"
                            className="opacity-80"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <h3 className="text-lg font-medium mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-secondary">{item.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Band Summary */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-8">
            <div className="col-span-4 md:col-span-8">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 uppercase">The Band Project</h2>
              <p className="text-lg text-secondary leading-relaxed mb-6">
              Blending timeless covers with original music, The Band Project creates a live entertainment experience that transforms any night into a party—playing venues and festivals across the tri-state area..
              </p>
              <Link
                href="/background"
                className="inline-block text-sm uppercase tracking-wider border-b border-white/40 hover:border-white transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gear Callout */}
      <section className="py-24 px-4 md:px-6 lg:px-8 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-8 items-center">
            <div className="col-span-4 md:col-span-8">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase">Gear & Merch</h2>
              <p className="text-lg text-secondary mb-6">
                Explore the instruments we play and shop our official merchandise.
              </p>
            </div>
            <div className="col-span-4 md:col-span-4 flex justify-end">
              <Link
                href="/gear"
                className="px-8 py-4 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors"
              >
                Visit Gear Store
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
