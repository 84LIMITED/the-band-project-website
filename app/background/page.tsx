import Script from 'next/script'
import Image from 'next/image'
import { generateMetadata as genMetadata, generateStructuredData } from '@/lib/seo'
import { Metadata } from 'next'

export const metadata: Metadata = genMetadata({
  title: 'Background | The Band Project',
  description: 'Learn about The Band Project - our origin story, musical influences, and live performance style.',
  path: '/background',
})

export default function BackgroundPage() {
  const pageData = generateStructuredData('WebPage', {
    name: 'Background | The Band Project',
    description: 'Learn about The Band Project - our origin story, musical influences, and live performance style.',
    path: '/background',
  })

  return (
    <>
      <Script
        id="background-page-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData) }}
      />

      {/* LLM-Friendly Summary Block */}
      <section className="sr-only">
        <h2>About The Band Project</h2>
        <p> Two lawyers, an actress, a surgeon, and a talent acquirer walked into a bar.
What came out wasn&apos;t a punchline—it was The Band Project.

All hailing from Wyckoff, New Jersey, the group had been playing local events, jam sessions, and community gatherings for years—often crossing paths musically without realizing what could happen if they actually committed. In 2025, they did.

What started as a shared love of live music and performance evolved into a band with one clear mission: bring a high-energy, crowd-moving live experience to venues and festivals across the tri-state area—occasionally testing local fire codes in the process.
        </p>
      </section>

      <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <header className="mb-16">
            <h1 className="text-5xl md:text-6xl font-black mb-6 uppercase">Background</h1>
            <p className="text-xl text-secondary">
              Our story, sound, and what drives our group.
            </p>
          </header>

          {/* Origin Story */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 uppercase">Origin Story</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-secondary leading-relaxed mb-4">
                Two lawyers, an actress, a surgeon, an ad tech guy, and a talent recruiter walked into a bar.
                What came out wasn&apos;t a punchline—it was The Band Project.
              </p>
              <p className="text-lg text-secondary leading-relaxed mb-4">
                All hailing from Wyckoff, New Jersey, the group had been playing local events, jam sessions, and community gatherings for years—often crossing paths musically without realizing what could happen if they actually committed. In 2025, they did.
              </p>
              <p className="text-lg text-secondary leading-relaxed mb-4">
                What started as a shared love of live music and performance evolved into a band with one clear mission: bring a high-energy, crowd-moving live experience to venues and festivals across the tri-state area—occasionally testing local fire codes in the process.
              </p>
            </div>
          </section>

          {/* Sound & Genre */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 uppercase">Sound & Genre</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-secondary leading-relaxed mb-4">
              Familiar, unexpected, and built for the room,

The Band Project’s sound lives at the intersection of rock, blues, and improvisational groove, blending timeless covers with original material that fits seamlessly into the live experience.

Rather than sticking to a single genre, the band focuses on flow—reading the room, building momentum, and knowing when to stretch out or lock in. Sets evolve organically, moving between driving rhythms, melodic moments, and high-energy peaks designed to keep crowds engaged from the first song to the last encore.

The result is music that feels both familiar and fresh—recognizable enough to sing along, dynamic enough to surprise.
              </p>
              <p className="text-lg text-secondary leading-relaxed">
              Designed to move the room

Live performance is where The Band Project truly comes alive.

Every show is crafted to be immersive and energetic, with thoughtfully curated setlists, dynamic arrangements, and a strong connection to the audience. No two performances are exactly the same—improvisation and in-the-moment decisions keep things fresh for both the band and the crowd.

Whether it’s an intimate club, a packed bar, or a festival stage, the approach stays consistent:

Read the room.

Build momentum. 

Deliver moments people never forget.

We believe live music should create connection, community, and love—and we bring that mindset to every venue and festival we play across the New York tri-state area.
              </p>
            </div>
          </section>

          {/* Influences */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 uppercase">Influences</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-secondary leading-relaxed mb-4">
                Our musical influences are diverse.
              </p>
              <ul className="list-none space-y-3 text-lg text-secondary">
              <li>• <strong className="text-white">1970s</strong> – Classic pop and Southern rock grooves built to get the room moving</li>
<li>• <strong className="text-white">1980s</strong> – High-energy pop and alternative anthems made for big choruses and loud crowds</li>
<li>• <strong className="text-white">1990s</strong> – Raw grunge energy and emotional, no-apologies female-led ballads</li>
<li>• <strong className="text-white">2000s</strong> – A little bit of everything, from rock to pop to crossover hits everyone knows</li>

              </ul>
            </div>
          </section>

          {/* Live Performance */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 uppercase">Live Performance</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-secondary leading-relaxed mb-4">
              Designed to move the room, 

Live performances are where The Band Project truly comes alive.
              </p>
              <p className="text-lg text-secondary leading-relaxed mb-4">
              Every show is crafted to be immersive and energetic, with thoughtfully curated setlists, dynamic arrangements, and a strong connection to the audience. No two performances are exactly the same—improvisation and in-the-moment decisions keep things fresh for both the band and the crowd.
              </p>
              <p className="text-lg text-secondary leading-relaxed">
              Whether it’s an intimate club, a packed bar, or a festival stage, the approach stays consistent:

Read the room. 

Build momentum. 

Deliver moments people never forget. 

We believe live music should create connection, community, and love—-and we bring that mindset to every venue and festival we play across the New York tri-state area.
              </p>
            </div>
          </section>

          {/* Photo Gallery */}
          <section>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 uppercase">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden bg-white/10"
                >
                  <Image
                    src={`/images/gallery-${i}.png`}
                    alt={`The Band Project gallery image ${i}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
