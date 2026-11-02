const fs = require('fs')
const path = require('path')

function signupPagePath() {
  const source = fs.readFileSync(path.join(__dirname, 'lib/newsletter-config.ts'), 'utf8')
  const match = source.match(/export const SIGNUP_PAGE_PATH = '([^']+)'/)
  if (!match) throw new Error('SIGNUP_PAGE_PATH is missing from lib/newsletter-config.ts')
  return match[1]
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable static export if using S3 + CloudFront
  // output: 'export',
  async rewrites() {
    return [
      { source: '/setlist-vote', destination: '/setlist-vote.html' },
    ]
  },
  async redirects() {
    return [
      {
        source: '/join',
        destination: signupPagePath(),
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/calendar/:file*',
        headers: [
          { key: 'Content-Type', value: 'text/calendar; charset=utf-8' },
          { key: 'Content-Disposition', value: 'attachment' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
