import Link from 'next/link'
import mediaData from '@/content/media.json'
import { MediaItem } from '@/lib/schema'
import { IMAGE_VIDEO_ALT_TITLE } from '@/lib/seo'

export default function VideosPage() {
  const videos = (mediaData as MediaItem[]).filter((m) => m.type === 'video')

  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase">Live Performance Videos</h1>
          <p className="text-secondary">
            High-energy clips from bars, festivals, and private parties across Northern NJ. Inquire about booking for your venue or event.
          </p>
        </header>

        <section className="space-y-12 mb-16">
          {videos.map((item) => (
            <article key={item.id} className="border border-white/20 p-6">
              <div className="aspect-video relative bg-black mb-4">
                <video
                  src={item.url}
                  poster={item.thumbnail}
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                  title={IMAGE_VIDEO_ALT_TITLE}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <h2 className="text-xl font-bold mb-2">{item.title}</h2>
              <p className="text-secondary text-sm">
                {item.description || 'Live performance by The Band Project.'} Shot at a local venue in the Bergen County / tri-state area—the kind of high-energy set we bring to bars, private parties, and town events.
              </p>
            </article>
          ))}
        </section>

        <section className="border-t border-white/20 pt-12">
          <p className="text-secondary mb-6">
            Want to book The Band Project for your venue or event? Share your date and details for a fast response.
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
