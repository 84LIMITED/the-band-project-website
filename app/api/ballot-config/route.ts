// app/api/ballot-config/route.ts
//
// Stores and serves per-show ballot configuration — song list, max picks,
// and display title — as a single S3 object per show:
//   configs/{show}.json
//
// This is what lets one setlist-vote.html file serve every show and every
// round. Creating a new round means writing a new config object, not
// deploying new code. The in-page Admin tab does this through this route;
// it can also be done by uploading a JSON file directly to S3.
//
// Uses the same S3 client, auth header, and environment variables as
// app/api/ballots/route.ts — see S3-SETUP.md.

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand, NoSuchKey } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

const BUCKET = process.env.S3_BUCKET_NAME!;

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

type Song = {
  title: string;
  artist: string;
  decade?: string;
  genre?: string;
  onWebsite?: boolean;
};

type BallotConfig = {
  show: string;
  title: string;
  maxPicks: number;
  songs: Song[];
};

function checkAuth(req: NextRequest): boolean {
  const key = req.headers.get('x-ballot-key');
  return !!key && key === process.env.BALLOT_ACCESS_KEY;
}

function slugify(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function configKeyFor(show: string): string {
  return `configs/${slugify(show)}.json`;
}

async function streamToString(body: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const show = req.nextUrl.searchParams.get('show');
  if (!show) return NextResponse.json({ error: 'show query param is required' }, { status: 400 });

  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: configKeyFor(show) }));
    const text = await streamToString(res.Body);
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    if (err instanceof NoSuchKey || (err as any)?.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'No config found for this show' }, { status: 404 });
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { show, title, maxPicks, songs } = body || {};

  if (typeof show !== 'string' || !show.trim()) {
    return NextResponse.json({ error: 'show is required' }, { status: 400 });
  }
  if (typeof maxPicks !== 'number' || maxPicks < 1) {
    return NextResponse.json({ error: 'maxPicks must be a positive number' }, { status: 400 });
  }
  if (!Array.isArray(songs) || songs.length === 0) {
    return NextResponse.json({ error: 'songs must be a non-empty array' }, { status: 400 });
  }
  for (const s of songs) {
    if (typeof s.title !== 'string' || !s.title.trim()) {
      return NextResponse.json({ error: 'every song needs a title' }, { status: 400 });
    }
  }

  const config: BallotConfig = {
    show: slugify(show),
    title: typeof title === 'string' && title.trim() ? title.trim() : show,
    maxPicks,
    songs: songs.map((s: Song) => ({
      title: s.title.trim(),
      artist: (s.artist || '').trim(),
      decade: s.decade || undefined,
      genre: s.genre || undefined,
      onWebsite: !!s.onWebsite,
    })),
  };

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: configKeyFor(config.show),
    Body: JSON.stringify(config, null, 2),
    ContentType: 'application/json',
  }));

  return NextResponse.json(config);
}
