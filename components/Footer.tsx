import Script from 'next/script'
import { generateStructuredData } from '@/lib/seo'

export default function Footer() {
  // Use environment variable or default to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thebandproject.com'
  const currentYear = new Date().getFullYear()

  const websiteStructuredData = generateStructuredData('WebSite', {
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  })

  return (
    <>
      <Script
        id="website-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <footer className="border-t border-white/10 mt-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-8">
            <div className="col-span-4 md:col-span-6">
              <h3 className="text-xl font-medium mb-4">The Band Project</h3>
              <p className="text-secondary text-sm max-w-md">
                A cinematic live music experience. Book us for your next event.
              </p>
            </div>
            <div className="col-span-4 md:col-span-3">
              <h4 className="text-sm uppercase tracking-wider mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-secondary">
                <li>
                  <a href="/background" className="hover:text-white transition-colors">
                    Background
                  </a>
                </li>
                <li>
                  <a href="/shows" className="hover:text-white transition-colors">
                    Shows
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/gear" className="hover:text-white transition-colors">
                    Gear Store
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-4 md:col-span-3">
              <h4 className="text-sm uppercase tracking-wider mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-secondary">
                {/* Add social links here */}
                <li>
                  <a href="mailto:contact@thebandproject.com" className="hover:text-white transition-colors">
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-secondary text-center">
            <p>&copy; {currentYear} The Band Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
