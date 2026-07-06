// app/api/ballots/route.ts
//
// Next.js App Router API route that stores setlist ballots in S3 as one
// object per band member per show:
//   ballots/{show}/{name}.json
//
// This keeps every show's results as its own folder, and every member's
// results as their own file within it, so nothing gets overwritten across
// shows. Add this file to your existing Next.js repo at that exact path.
//
// Install the AWS SDK first:
//   npm install @aws-sdk/client-s3
//
// Required environment variables (set these in your hosting platform's
// environment settings — Vercel, Amplify, etc. — never in NEXT_PUBLIC_*
// vars, and never committed to the repo):
//   S3_ACCESS_KEY_ID
//   S3_SECRET_ACCESS_KEY
//   S3_REGION             e.g. "us-east-2"
//   S3_BUCKET_NAME        e.g. "tbp-setlist-ballots"
//   BALLOT_ACCESS_KEY     same value as SHOW_PASSWORD in setlist-vote.html
//
// Note: variable names starting with AWS_ (AWS_REGION, AWS_ACCESS_KEY_ID,
// AWS_SECRET_ACCESS_KEY) are reserved by the Lambda runtime that Amplify's
// Next.js SSR hosting runs on. Setting them as custom environment variables
// gets rejected or ignored, so this route reads the S3_-prefixed names
// above instead.
//
// Every request (GET/POST/DELETE) takes a `show` query param identifying
// which show's results to read or write, e.g. ?show=halloween. The ballot
// page sends this automatically based on its SHOW_ID config value.

import { NextRequest, NextResponse } from 'next/server';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  NoSuchKey,
} from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

const BUCKET = process.env.S3_BUCKET_NAME!;

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
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
  const expected = process.env.BALLOT_ACCESS_KEY;
  // TEMPORARY DEBUG — remove once the 401 is resolved. Logs lengths and a
  // match result only, never the actual header or env var values.
  console.log('[ballots-auth-debug]', {
    headerPresent: key !== null,
    headerLength: key ? key.length : 0,
    envPresent: expected !== undefined,
    envLength: expected ? expected.length : 0,
    isMatch: !!key && key === expected,
  });
  return !!key && key === expected;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getShow(req: NextRequest): string | null {
  const show = req.nextUrl.searchParams.get('show');
  if (!show || !show.trim()) return null;
  return slugify(show);
}

function keyFor(show: string, name: string): string {
  return `ballots/${show}/${slugify(name)}.json`;
}

function prefixFor(show: string): string {
  return `ballots/${show}/`;
}

async function streamToString(body: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}

async function getObjectJson(key: string): Promise<Ballot | null> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const text = await streamToString(res.Body);
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof NoSuchKey) return null;
    if ((err as any)?.name === 'NoSuchKey') return null;
    throw err;
  }
}

async function listShowBallots(show: string): Promise<Ballot[]> {
  const listed = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefixFor(show),
  }));
  const keys = (listed.Contents || []).map((o) => o.Key!).filter(Boolean);
  const ballots = await Promise.all(keys.map((k) => getObjectJson(k)));
  return ballots.filter((b): b is Ballot => b !== null);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const show = getShow(req);
  if (!show) return NextResponse.json({ error: 'show query param is required' }, { status: 400 });

  const ballots = await listShowBallots(show);
  return NextResponse.json(ballots);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const show = getShow(req);
  if (!show) return NextResponse.json({ error: 'show query param is required' }, { status: 400 });

  const body = await req.json();
  const { name, songs, request } = body || {};

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!Array.isArray(songs) || !songs.every((s) => typeof s === 'string')) {
    return NextResponse.json({ error: 'songs must be an array of strings' }, { status: 400 });
  }

  const ballot: Ballot = {
    name: name.trim(),
    songs,
    request: request && request.title ? { title: request.title, artist: request.artist || '' } : null,
    ts: new Date().toISOString(),
  };

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: keyFor(show, ballot.name),
    Body: JSON.stringify(ballot, null, 2),
    ContentType: 'application/json',
  }));

  const ballots = await listShowBallots(show);
  return NextResponse.json(ballots);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const show = getShow(req);
  if (!show) return NextResponse.json({ error: 'show query param is required' }, { status: 400 });

  const name = req.nextUrl.searchParams.get('name');
  if (name) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: keyFor(show, name) }));
    const ballots = await listShowBallots(show);
    return NextResponse.json(ballots);
  }

  // No name given — clear every ballot for this show.
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefixFor(show) }));
  const keys = (listed.Contents || []).map((o) => ({ Key: o.Key! })).filter((o) => o.Key);
  if (keys.length) {
    await s3.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: keys } }));
  }
  return NextResponse.json([]);
}
