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
  /show-alerts      # Dedicated show-alerts signup page
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
  SignupForm.tsx    # Fan list signup (footer, shows, and /show-alerts)
  ShowAlertsSignup.tsx  # Reads ?src= and renders the signup page form
  HeroVideo.tsx     # Hero video component
  ShowCard.tsx      # Show card component
  MediaDrawer.tsx   # Media drawer component

/lib
  aws.ts            # Shows table scan, contact form, and SES
  subscribers.ts    # Fan list DynamoDB helpers and local JSON fallback
  email.ts          # Confirmation and newsletter sending via SES
  newsletter-config.ts  # From name, reply-to, postal address, and signup page path
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

/scripts/shows
  shows.ts          # List, add, remove, seed, and export shows in DynamoDB

/infra/newsletter
  template.yaml     # SAM: subscribers table, SES events, alarms
  /handler          # Bounce and complaint Lambda

/content
  shows.json        # Fallback snapshot and local-dev shows. Production reads DynamoDB.
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
| `SHOWS_TABLE` | DynamoDB shows table name (`the-band-project-shows`) | Required in production | Unset. The site reads `content/shows.json` |
| `MESSAGES_TABLE` | DynamoDB messages table name | Production only | Uses static data |
| `CONTACT_EMAIL` | Email for contact form submissions and newsletter replies | Production only | `book@thebandproject.live` |
| `SUBSCRIBERS_TABLE` | DynamoDB subscribers table name (`band-project-subscribers`) | Production only | Uses `.data/subscribers.json` |
| `NEWSLETTER_FROM_EMAIL` | Verified SES sender address (`news@thebandproject.live`) | Production only | Confirmation links print to the terminal |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key | Production only | `0x4AAAAAAFjD5OJhw9mKaFKK` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key (server-side verification) | Production only | Cloudflare always-pass test secret |

**Note:** The site works locally without these variables. They're only needed for production AWS integration. Signup still runs locally: subscribers are stored in `.data/subscribers.json`, and the confirmation link is printed in the terminal instead of being emailed. Shows live in DynamoDB in production. `content/shows.json` is the local-dev list and the fallback snapshot if DynamoDB cannot be reached.

## Managing Shows

Shows are stored in the DynamoDB table `the-band-project-shows`. A new show is a CLI command. It does not need a code change or a deploy. The home page, `/shows`, `/show-alerts`, and `/llm-summary.json` revalidate every 5 minutes (`revalidate = 300`), so a table change shows up on the live site within about 5 minutes.

Amplify publishes the Next.js server build (`.next`, not a static export), so that revalidation runs on the host. `npm run dev` with no AWS variables still reads `content/shows.json` and does not log an error.

Upcoming vs past is the show date compared with today in America/New_York. The stored `isUpcoming` flag is ignored when reading.

Add a show (credentials from `aws configure`, table from `SHOWS_TABLE` or the default `the-band-project-shows`, region from `AMPLIFY_REGION` or `us-east-1`):

```bash
npm run shows:add -- --date 2027-09-18 --venue "The Venue" --city Mahwah --state NJ --address "1 Main St, Mahwah, NJ 07430" --time "8:00 PM – 11:00 PM"
```

Optional doors time: `--doors "7:00 PM"`. The id is `<date>-<venue-slug>`, and the command refuses to overwrite an existing id.

```bash
npm run shows:list
npm run shows:remove -- --id 2027-09-18-the-venue
```

`shows:remove` prints the show and deletes it only after you type `y`.

`content/shows.json` is not the live source. Before a deploy, if shows changed in the table, refresh the fallback snapshot and commit it:

```bash
npm run shows:export
```

`npm run shows:seed` loads `content/shows.json` into the table, overwriting items with the same id. Use it for a first-time load or to rebuild the table. The compute role needs `dynamodb:Scan` on the shows table; the policy is in `AWS_SETUP.md`. Mike attaches that policy. This repo does not change IAM.

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

## Signup page and short link

The dedicated signup page is `/show-alerts` (`SIGNUP_PAGE_PATH` in `lib/newsletter-config.ts`). Printed material and spoken mentions use `/join`, which permanently redirects (308) to `/show-alerts` and keeps the query string.

Track where a signup came from with `?src=`. Allowed values are lowercase letters, numbers, `_`, and `-`, up to 20 characters. Anything else is ignored and stored as `page`. Common values: `instagram`, `facebook`, `qr`, `flyer`.

Example share URL: `https://thebandproject.live/join?src=instagram`

The home-page footer signup stays at `/#email-list`.

## Managing the Fan List

Subscriber `source` is `footer`, `shows`, `page`, `import`, or a sanitized `src` value.

| Field | Note |
| --- | --- |
| `source` | `footer`, `shows`, `page`, `import`, or a sanitized `src` value (`[a-z0-9_-]`, max 20) |

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
