// app/api/ballots/route.ts
//
// Next.js App Router API route that stores setlist ballots as a single
// JSON file in S3 (ballots/all.json) and serves them back to the ballot
// page. Add this file to your existing Next.js repo at that exact path.
//
// Install the AWS SDK first:
//   npm install @aws-sdk/client-s3
//
// Required environment variables (set these in your hosting platform's
// environment settings — Vercel, Amplify, etc. — never in NEXT_PUBLIC_*
// vars, and never committed to the repo):
//   AWS_ACCESS_KEY_ID
//   AWS_SECRET_ACCESS_KEY
//   AWS_REGION            e.g. "us-east-1"
//   S3_BUCKET_NAME        e.g. "tbp-setlist-ballots"
//   BALLOT_ACCESS_KEY     same value as SHOW_PASSWORD in setlist-vote.html

import { NextRequest, NextResponse } from 'next/server';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

const BUCKET = process.env.S3_BUCKET_NAME!;
const KEY = 'ballots/all.json';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type Ballot = {
  name: string;
  songs: string[];
  request: { title: string; artist?: string } | null;
  ts: string;
};

function checkAuth(req: NextRequest): boolean {
  const key = req.headers.get('x-ballot-key');
  return !!key && key === process.env.BALLOT_ACCESS_KEY;
}

async function streamToString(body: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}

async function loadBallots(): Promise<Ballot[]> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    const text = await streamToString(res.Body);
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof NoSuchKey) return [];
    // Some SDK versions throw a generic error with this name instead of NoSuchKey
    if ((err as any)?.name === 'NoSuchKey') return [];
    throw err;
  }
}

async function saveBallots(ballots: Ballot[]): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: KEY,
    Body: JSON.stringify(ballots, null, 2),
    ContentType: 'application/json',
  }));
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ballots = await loadBallots();
  return NextResponse.json(ballots);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, songs, request } = body || {};

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!Array.isArray(songs) || !songs.every((s) => typeof s === 'string')) {
    return NextResponse.json({ error: 'songs must be an array of strings' }, { status: 400 });
  }

  const ballots = await loadBallots();
  const filtered = ballots.filter((b) => b.name.toLowerCase() !== name.trim().toLowerCase());
  filtered.push({
    name: name.trim(),
    songs,
    request: request && request.title ? { title: request.title, artist: request.artist || '' } : null,
    ts: new Date().toISOString(),
  });
  await saveBallots(filtered);

  return NextResponse.json(filtered);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const name = req.nextUrl.searchParams.get('name');
  if (name) {
    const ballots = await loadBallots();
    const filtered = ballots.filter((b) => b.name.toLowerCase() !== name.toLowerCase());
    await saveBallots(filtered);
    return NextResponse.json(filtered);
  }

  await saveBallots([]);
  return NextResponse.json([]);
}
