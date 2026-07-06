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
}

module.exports = nextConfig
