import { Suspense } from 'react'
import Script from 'next/script'
import ShowCard from '@/components/ShowCard'
import ShowAlertsSignup from '@/components/ShowAlertsSignup'
import SignupForm from '@/components/SignupForm'
import {
  SIGNUP_PAGE_DESCRIPTION,
  SIGNUP_PAGE_PATH,
  SIGNUP_PAGE_TITLE,
  SITE_ORIGIN,
} from '@/lib/newsletter-config'
import { getNextShow } from '@/lib/aws'
import { generateMetadata as genMetadata } from '@/lib/seo'

const PAGE_URL = `${SITE_ORIGIN}${SIGNUP_PAGE_PATH}`

export const metadata = genMetadata({
  title: SIGNUP_PAGE_TITLE,
  description: SIGNUP_PAGE_DESCRIPTION,
  path: SIGNUP_PAGE_PATH,
  canonical: PAGE_URL,
  image: `${SITE_ORIGIN}/images/og-signup.png`,
})

const BENEFITS = [
  {
    lead: 'Show dates first.',
    text: 'Hear about every upcoming show before it hits social media.',
  },
  {
    lead: 'Venue and set times.',
    text: 'Address, doors, and when we hit the stage, all in one email.',
  },
  {
    lead: 'Friends and family welcome.',
    text: 'Forward the email to anyone who should be there.',
  },
]

const FAQ = [
  {
    question: 'How do I find out when The Band Project plays next?',
    answer:
      "Sign up on this page and we'll email you before every upcoming show. You can also see current dates on the Shows page.",
  },
  {
    question: 'How often will I get emails?',
    answer: 'About 8 to 10 times a year, only when there is a show or news worth sharing.',
  },
  {
    question: 'What kind of band is The Band Project?',
    answer:
      'A New Jersey cover band based in Wyckoff, playing timeless covers and original music at venues around Bergen and Passaic counties.',
  },
  {
    question: 'Where does The Band Project play?',
    answer:
      'Mostly northern New Jersey venues. Upcoming locations are listed on the Shows page and in every email.',
  },
  {
    question: 'Can I unsubscribe?',
    answer: 'Yes. Every email has a one-click unsubscribe link.',
  },
  {
    question: 'How do I book The Band Project?',
    answer: 'Use the contact form on the Contact page or email book@thebandproject.live.',
  },
]

function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        name: SIGNUP_PAGE_TITLE,
        description: SIGNUP_PAGE_DESCRIPTION,
        url: PAGE_URL,
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faq`,
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'MusicGroup',
        '@id': `${SITE_ORIGIN}/#musicgroup`,
        name: 'The Band Project',
        url: SITE_ORIGIN,
        genre: ['Rock', 'Pop', 'Cover Band', 'Party Band', 'Live Music'],
        location: {
          '@type': 'Place',
          name: 'Wyckoff, NJ',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Wyckoff',
            addressRegion: 'NJ',
            addressCountry: 'US',
          },
        },
        areaServed: {
          '@type': 'City',
          name: 'Wyckoff, NJ',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_ORIGIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Show Alerts',
            item: PAGE_URL,
          },
        ],
      },
    ],
  }
}

function FaqAnswer({ item }: { item: (typeof FAQ)[number] }) {
  if (item.question.startsWith('How do I find out')) {
    return (
      <p className="text-secondary mt-2">
        Sign up on this page and we&apos;ll email you before every upcoming show. You can also see current dates on the{' '}
        <a href="/shows" className="text-white underline hover:opacity-80">Shows page</a>.
      </p>
    )
  }
  if (item.question.startsWith('Where does')) {
    return (
      <p className="text-secondary mt-2">
        Mostly northern New Jersey venues. Upcoming locations are listed on the{' '}
        <a href="/shows" className="text-white underline hover:opacity-80">Shows page</a> and in every email.
      </p>
    )
  }
  if (item.question.startsWith('How do I book')) {
    return (
      <p className="text-secondary mt-2">
        Use the contact form on the{' '}
        <a href="/contact" className="text-white underline hover:opacity-80">Contact page</a> or email{' '}
        <a href="mailto:book@thebandproject.live" className="text-white underline hover:opacity-80">book@thebandproject.live</a>.
      </p>
    )
  }
  return <p className="text-secondary mt-2">{item.answer}</p>
}

export const revalidate = 300

export default async function ShowAlertsPage() {
  const show = await getNextShow()

  return (
    <>
      <Script
        id="show-alerts-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />

      <div className="px-4 pt-20 pb-24 md:pt-28">
        <div className="mx-auto max-w-[640px] [&_h1]:uppercase [&_h2]:uppercase [&_h3]:uppercase">
          <p className="text-xs tracking-[0.16em] text-secondary mb-3">THE BAND PROJECT · WYCKOFF, NJ</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-3">Don&apos;t miss a show.</h1>
          <p className="text-lg text-secondary mb-6">
            Sign up and we&apos;ll send you updates on upcoming events and shows.
          </p>

          <Suspense fallback={<SignupForm source="page" variant="compact" />}>
            <ShowAlertsSignup />
          </Suspense>

          <section className="mt-16" aria-labelledby="what-youll-get">
            <h2 id="what-youll-get" className="text-2xl font-bold uppercase mb-4">
              What you&apos;ll get
            </h2>
            <ul className="border-t border-white/20">
              {BENEFITS.map((item) => (
                <li key={item.lead} className="border-b border-white/20 py-4">
                  <p>
                    <span className="font-semibold">{item.lead}</span> {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16" aria-labelledby="about-the-band">
            <h2 id="about-the-band" className="text-2xl font-bold uppercase mb-4">
              About the band
            </h2>
            <p className="text-secondary">
              The Band Project is a cover band from Wyckoff, New Jersey. We play a few shows a year around northern New
              Jersey as a get-together for friends, family, and fans: timeless covers, original music, always a party.
            </p>
          </section>

          {show && (
            <section className="mt-16" aria-labelledby="next-up">
              <h2 id="next-up" className="text-2xl font-bold uppercase mb-4">
                Next up
              </h2>
              <ShowCard show={show} />
            </section>
          )}

          <section className="mt-16" aria-labelledby="show-alerts-faq">
            <h2 id="show-alerts-faq" className="text-2xl font-bold uppercase mb-4">
              FAQ
            </h2>
            <div className="border-t border-white/20">
              {FAQ.map((item) => (
                <article key={item.question} className="border-b border-white/20 py-4">
                  <h3 className="text-lg font-semibold uppercase">{item.question}</h3>
                  <FaqAnswer item={item} />
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
