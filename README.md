# The Band Project Website

A minimalist, cinematic website for The Band Project built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Minimalist Design**: Black & white color scheme with cinematic motion
- **Performance-First**: Optimized for speed and Core Web Vitals
- **SEO Optimized**: Comprehensive structured data (JSON-LD), sitemap, and semantic HTML
- **LLM Discovery**: AI-friendly content and `/llm-summary.json` endpoint
- **Responsive**: Mobile-first design with desktop enhancements
- **Accessible**: ARIA labels, keyboard navigation, and proper contrast ratios
- **Fan email list**: Double opt-in show reminders with one-click unsubscribe
- **HTML newsletter**: Sent through AWS SES a few times a year

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: AWS Lambda, API Gateway, DynamoDB, SES (contact form and the fan newsletter)
- **Infrastructure**: AWS S3, CloudFront CDN, Route 53, AWS Amplify

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- AWS Account (for production deployment - see AWS_SETUP.md)

### Installation & Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Open your browser:**
```
http://localhost:3000
```

**Note:** The site works locally without AWS configuration. It uses static data fallbacks. AWS services are only needed for production deployment. See `AWS_SETUP.md` for AWS configuration instructions.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
/app
  /api              # API routes, including /api/subscribe, /api/confirm, /api/unsubscribe
  /background       # Background page
  /shows            # Shows page
  /contact          # Contact page
  /gear             # Gear store page
  /newsletter/confirm  # Double opt-in confirmation page
  /unsubscribe      # One-click unsubscribe page
  layout.tsx        # Root layout
  page.tsx          # Home page
  globals.css       # Global styles
  sitemap.ts        # Sitemap generation
  robots.ts         # Robots.txt

/components
  Header.tsx        # Global navigation
  Footer.tsx        # Footer with structured data and signup form
  SignupForm.tsx    # Fan list signup (footer and shows)
  HeroVideo.tsx     # Hero video component
  ShowCard.tsx      # Show card component
  MediaDrawer.tsx   # Media drawer component

/lib
  aws.ts            # AWS service integrations
  subscribers.ts    # Fan list DynamoDB helpers and local JSON fallback
  email.ts          # Confirmation and newsletter sending via SES
  newsletter-config.ts  # From name, reply-to, and postal address
  schema.ts         # TypeScript interfaces
  seo.ts            # SEO utilities

/emails
  newsletter.html   # Newsletter HTML template
  newsletter.txt    # Plain-text twin

/newsletters
  /issues           # One JSON file per send
  /logs             # Send logs (gitignored)

/scripts/newsletter
  render.ts         # Merges an issue into the template
  send.ts           # Preview, test, dry-run, and send

/infra/newsletter
  template.yaml     # SAM: subscribers table, SES events, alarms
  /handler          # Bounce and complaint Lambda

/content
  shows.json        # Static shows data (fallback)
  media.json        # Static media data

/public
  /video            # Video assets
  /images           # Image assets
  /posters          # Video poster images
```

## AWS Setup

**📖 See [AWS_SETUP.md](./AWS_SETUP.md) for complete step-by-step instructions.**

Quick overview:
- DynamoDB tables for shows, messages, and newsletter subscribers (`band-project-subscribers`)
- AWS SES for the contact form and the fan newsletter (`news@thebandproject.live`)
- IAM roles and policies
- Environment variables in Amplify
- Route 53 DNS configuration

## Deployment

### Local Testing First

1. **Test locally:**
```bash
npm run dev
```

2. **Build for production test:**
```bash
npm run build
npm start
```

3. **Verify everything works** before deploying to cloud

### AWS Amplify Deployment

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your Git repository (GitHub, GitLab, etc.)

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Output directory: `.next`
   - Node version: `18.x` or `20.x`

3. **Set Environment Variables**
   - Go to App settings → Environment variables
   - Add all variables (see AWS_SETUP.md)
   - **Important:** Set `NEXT_PUBLIC_BASE_URL` to your production URL

4. **Attach IAM Role**
   - Go to App settings → General
   - Under "Service role", select the IAM role you created
   - See AWS_SETUP.md for role creation

5. **Deploy**
   - Click "Save and deploy"
   - Wait for build to complete
   - Test your live site!

### S3 + CloudFront (Static Export)

1. Update `next.config.js` to enable static export:
   ```js
   output: 'export'
   ```
2. Build the project: `npm run build`
3. Upload the `out` directory to S3
4. Configure CloudFront distribution
5. Set up Route 53 DNS

## Media Assets

Place your media files in the following directories:

- `/public/video/` - Video files (hero.mp4, highlights.mp4, etc.)
- `/public/images/` - Image files
- `/public/posters/` - Video poster images

### Video Requirements

- Hero video: 1080p (desktop), 720p (tablet), optimized for mobile
- All videos should include:
  - `playsInline` attribute
  - `muted` attribute
  - `loop` attribute
  - `poster` image

## Environment Variables (AWS Amplify)

Configure these in **AWS Amplify Console → App settings → Environment variables**:

| Variable | Description | Required | Default (Local) |
|----------|-------------|----------|----------------|
| `NEXT_PUBLIC_BASE_URL` | Base URL of the website | Production only | `http://localhost:3000` |
| `AMPLIFY_REGION` | AWS region for services | Production only | `us-east-1` |
| `SHOWS_TABLE` | DynamoDB shows table name | Production only | Uses static data |
| `MESSAGES_TABLE` | DynamoDB messages table name | Production only | Uses static data |
| `CONTACT_EMAIL` | Email for contact form submissions and newsletter replies | Production only | `book@thebandproject.live` |
| `SUBSCRIBERS_TABLE` | DynamoDB subscribers table name (`band-project-subscribers`) | Production only | Uses `.data/subscribers.json` |
| `NEWSLETTER_FROM_EMAIL` | Verified SES sender address (`news@thebandproject.live`) | Production only | Confirmation links print to the terminal |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key | Production only | `0x4AAAAAAFjD5OJhw9mKaFKK` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key (server-side verification) | Production only | Cloudflare always-pass test secret |

**Note:** The site works locally without these variables. They're only needed for production AWS integration. Signup still runs locally: subscribers are stored in `.data/subscribers.json`, and the confirmation link is printed in the terminal instead of being emailed.

## Spam Protection

Signup is protected in layers:

- A hidden honeypot field drops bots without an error
- Submissions faster than 2 seconds after the form renders are dropped
- Cloudflare Turnstile is checked before anything is written or emailed
- Each IP can try at most 5 signups an hour
- A subscriber is not emailed a show reminder until they confirm
- SES bounce and complaint alarms notify `book@thebandproject.live` if reputation slips

## Sending a Newsletter

1. Copy the latest file in `newsletters/issues/` to a new file and edit the fields.
2. `npm run newsletter:preview` and review it in the browser.
3. `npm run newsletter:test -- --test you@example.com` and check it in Gmail on phone and desktop.
4. `npm run newsletter:send -- --dry-run` to confirm the recipient count.
5. `npm run newsletter:send` and type the count to confirm.
6. Check the log in `newsletters/logs/`.

Set `POSTAL_ADDRESS` in `lib/newsletter-config.ts` before any of those commands. The script refuses to run while it is still `TODO`.

## Managing the Fan List

View subscribers in the AWS Console: DynamoDB → `band-project-subscribers` → Explore items.

Export the table:

```bash
aws dynamodb scan --table-name band-project-subscribers
```

To unsubscribe someone manually, open their item and set `status` to `unsubscribed`.

Local development works with no AWS configuration. Subscribers land in `.data/subscribers.json`, and confirmation links print in the `npm run dev` terminal.

## SEO & LLM Optimization

- All pages include structured data (JSON-LD)
- LLM-friendly summary blocks (visually hidden but crawlable)
- Clean, semantic HTML
- Comprehensive sitemap and robots.txt
- LLM discovery endpoint: `/llm-summary.json`

## Performance Optimization

- Lazy-loaded videos (except hero)
- Optimized images with Next.js Image component
- Static generation where possible
- CDN-ready asset structure

## License

Copyright © The Band Project. All rights reserved.
