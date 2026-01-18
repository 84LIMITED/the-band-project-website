import Script from 'next/script'
import { generateStructuredData } from '@/lib/seo'

export default function Footer() {
  // Use environment variable or default to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thebandproject.live'
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
                Always a Party. Book us for your next event.
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
                <li>
                  <a href="mailto:book@thebandproject.live" className="hover:text-white transition-colors">
                    Email
                  </a>
                </li>
              </ul>
              <div className="flex gap-4 mt-4">
                <a
                  href="https://www.facebook.com/people/The-Band-Project/61584822961295/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Facebook"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/thebandprojectnj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
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
