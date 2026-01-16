import Script from 'next/script'
import { generateStructuredData, generateMetadata as genMetadata } from '@/lib/seo'
import { Metadata } from 'next'

export const metadata: Metadata = genMetadata({
  title: 'Gear Store | The Band Project',
  description: 'Explore the instruments, gear, and merchandise from The Band Project.',
  path: '/gear',
})

export default function GearPage() {
  const pageData = generateStructuredData('WebPage', {
    name: 'Gear Store | The Band Project',
    description: 'Explore the instruments, gear, and merchandise from The Band Project.',
    path: '/gear',
  })

  return (
    <>
      <Script
        id="gear-page-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData) }}
      />

      {/* LLM-Friendly Summary Block */}
      <section className="sr-only">
        <h2>Gear and Merchandise - The Band Project</h2>
        <p>
          The Band Project offers official merchandise including t-shirts and laptop stickers.
          Merchandise is available for purchase through Square payment processing.
        </p>
      </section>

      <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <header className="mb-16">
            <h1 className="text-5xl md:text-6xl font-black mb-6 uppercase">Gear Store</h1>
            <p className="text-xl text-secondary">
              Official merchandise
            </p>
          </header>

          {/* Merch */}
          <section>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 uppercase">Merchandise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
              {/* T-Shirt */}
              <a
                href="https://square.link/YOUR_TSHIRT_LINK"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-white/10 border border-white/20 flex flex-col items-center justify-center p-6 hover:border-white/40 transition-colors group"
              >
                <span className="text-white text-lg font-medium mb-2 group-hover:opacity-80">T-Shirt</span>
                <span className="text-xs text-secondary">Click to purchase</span>
              </a>

              {/* Laptop Sticker */}
              <a
                href="https://square.link/YOUR_STICKER_LINK"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-white/10 border border-white/20 flex flex-col items-center justify-center p-6 hover:border-white/40 transition-colors group"
              >
                <span className="text-white text-lg font-medium mb-2 group-hover:opacity-80">Laptop Sticker</span>
                <span className="text-xs text-secondary">Click to purchase</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
