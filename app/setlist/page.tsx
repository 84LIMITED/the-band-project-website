'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import setlistData from '@/content/setlist.json'

type SetlistItem = { title: string; artist: string; category: string }
const categories = ['All', 'Rock', 'Pop', 'Classics']

export default function SetlistPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const items = setlistData as SetlistItem[]
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.artist.toLowerCase().includes(search.toLowerCase())
      const matchCategory = category === 'All' || item.category === category
      return matchSearch && matchCategory
    })
  }, [items, search, category])

  return (
    <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase">Setlist</h1>
          <p className="text-secondary">
            Crowd favorites we play at bars, private parties, and local events. The setlist evolves and can be tailored to your event.
          </p>
        </header>

        {/* Search + filters - client-side enhancement; full list in HTML for SEO */}
        <div className="mb-10">
          <input
            type="search"
            placeholder="Search songs or artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-black border border-white/20 text-white placeholder:text-white/50 focus:border-white focus:outline-none mb-4"
            aria-label="Search setlist"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-sm uppercase tracking-wider border transition-colors ${
                  category === cat
                    ? 'bg-white text-black border-white'
                    : 'border-white/40 text-white hover:border-white/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Full setlist in HTML for SEO; filtered view for UX */}
        <section className="mb-12" aria-label="Setlist">
          <ul className="space-y-3 text-secondary">
            {filtered.map((item) => (
              <li key={`${item.title}-${item.artist}`} className="flex flex-wrap gap-x-2 gap-y-0">
                <span className="font-medium text-white">{item.title}</span>
                <span>({item.artist})</span>
                <span className="text-white/60 text-sm">— {item.category}</span>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="text-secondary">No songs match your search. Try a different term or category.</p>
          )}
        </section>

        <p className="text-secondary text-sm mb-10">
          Setlist evolves and can be tailored to your event.
        </p>

        <section className="border-t border-white/20 pt-12">
          <p className="text-secondary mb-6">
            Want us at your venue or party? Request a quote with your date and details.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors"
          >
            Book us
          </Link>
        </section>
      </div>
    </div>
  )
}
