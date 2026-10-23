import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { mkdir, readFile, rename, writeFile } from 'fs/promises'
import path from 'path'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { awsRegion } from '@/lib/newsletter-config'

export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed' | 'bounced' | 'complained'

export interface Subscriber {
  email: string
  status: SubscriberStatus
  confirmToken?: string
  unsubscribeToken: string
  createdAt: string
  confirmedAt?: string
  unsubscribedAt?: string
  lastConfirmSentAt?: string
  source?: string
  lastIssueSent?: string
}

const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000
const CONFIRM_THROTTLE_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_SEC = 60 * 60
const DATA_FILE = path.join(process.cwd(), '.data', 'subscribers.json')

interface LocalStore {
  subscribers: Subscriber[]
}

export function subscribersTable(): string | undefined {
  const name = process.env.SUBSCRIBERS_TABLE?.trim()
  return name || undefined
}

export function newToken(): string {
  return randomBytes(32).toString('hex')
}

export function tokensMatch(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length === 0 || a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidEmail(value: string): boolean {
  if (value.length < 3 || value.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function confirmTokenFresh(subscriber: Subscriber, now = Date.now()): boolean {
  if (!subscriber.confirmToken || !subscriber.lastConfirmSentAt) return false
  const sent = Date.parse(subscriber.lastConfirmSentAt)
  if (Number.isNaN(sent)) return false
  return now - sent <= CONFIRM_TTL_MS
}

function confirmationIsThrottled(subscriber: Subscriber, now = Date.now()): boolean {
  if (!subscriber.lastConfirmSentAt) return false
  const sent = Date.parse(subscriber.lastConfirmSentAt)
  if (Number.isNaN(sent)) return false
  return now - sent < CONFIRM_THROTTLE_MS
}

let documentClient: DynamoDBDocumentClient | undefined

function db(): DynamoDBDocumentClient {
  if (!documentClient) {
    documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: awsRegion() }), {
      marshallOptions: { removeUndefinedValues: true },
    })
  }
  return documentClient
}

let writeChain: Promise<void> = Promise.resolve()

async function readLocal(): Promise<LocalStore> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw) as LocalStore
    return { subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [] }
  } catch {
    return { subscribers: [] }
  }
}

async function writeLocal(store: LocalStore): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true })
  const tmp = `${DATA_FILE}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(store, null, 2))
  await rename(tmp, DATA_FILE)
}

function withLocal<T>(fn: (store: LocalStore) => Promise<T> | T): Promise<T> {
  const run = writeChain.then(async () => {
    const store = await readLocal()
    const result = await fn(store)
    await writeLocal(store)
    return result
  })
  writeChain = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  const table = subscribersTable()
  if (!table) {
    const store = await readLocal()
    return store.subscribers.find((item) => item.email === email) ?? null
  }
  const result = await db().send(new GetCommand({ TableName: table, Key: { email } }))
  return (result.Item as Subscriber | undefined) ?? null
}

async function saveSubscriber(subscriber: Subscriber): Promise<void> {
  const table = subscribersTable()
  if (!table) {
    await withLocal((store) => {
      const index = store.subscribers.findIndex((item) => item.email === subscriber.email)
      if (index === -1) store.subscribers.push(subscriber)
      else store.subscribers[index] = subscriber
    })
    return
  }
  await db().send(new PutCommand({ TableName: table, Item: subscriber }))
}

export interface PreparedSubscription {
  subscriber: Subscriber
  send: boolean
}

/**
 * Create or refresh a pending subscription.
 * Returns send: false when no confirmation email should go out.
 */
export async function prepareSubscription(email: string, source: string): Promise<PreparedSubscription> {
  const existing = await getSubscriber(email)
  const now = new Date().toISOString()

  if (!existing) {
    const subscriber: Subscriber = {
      email,
      status: 'pending',
      confirmToken: newToken(),
      unsubscribeToken: newToken(),
      createdAt: now,
      source,
    }
    await saveSubscriber(subscriber)
    return { subscriber, send: true }
  }

  if (existing.status === 'active' || existing.status === 'bounced' || existing.status === 'complained') {
    return { subscriber: existing, send: false }
  }

  if (existing.status === 'pending' && confirmationIsThrottled(existing)) {
    return { subscriber: existing, send: false }
  }

  const subscriber: Subscriber = {
    ...existing,
    status: 'pending',
    confirmToken: newToken(),
    source: source || existing.source,
  }
  delete subscriber.lastConfirmSentAt
  await saveSubscriber(subscriber)
  return { subscriber, send: true }
}

export async function markConfirmationSent(email: string): Promise<void> {
  const now = new Date().toISOString()
  const table = subscribersTable()
  if (!table) {
    await withLocal((store) => {
      const item = store.subscribers.find((entry) => entry.email === email)
      if (item) item.lastConfirmSentAt = now
    })
    return
  }
  await db().send(
    new UpdateCommand({
      TableName: table,
      Key: { email },
      UpdateExpression: 'SET lastConfirmSentAt = :now',
      ExpressionAttributeValues: { ':now': now },
    })
  )
}

export async function activateSubscriber(email: string, token: string): Promise<boolean> {
  const subscriber = await getSubscriber(email)
  if (!subscriber?.confirmToken || !tokensMatch(subscriber.confirmToken, token) || !confirmTokenFresh(subscriber)) {
    return false
  }

  const now = new Date().toISOString()
  const table = subscribersTable()
  if (!table) {
    await withLocal((store) => {
      const item = store.subscribers.find((entry) => entry.email === email)
      if (!item?.confirmToken || !tokensMatch(item.confirmToken, token)) return
      item.status = 'active'
      item.confirmedAt = now
      delete item.confirmToken
    })
    return true
  }

  try {
    await db().send(
      new UpdateCommand({
        TableName: table,
        Key: { email },
        UpdateExpression: 'SET #status = :active, confirmedAt = :now REMOVE confirmToken',
        ConditionExpression: 'confirmToken = :token',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':active': 'active',
          ':now': now,
          ':token': token,
        },
      })
    )
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false
    throw error
  }
}

export async function unsubscribeSubscriber(email: string, token: string): Promise<boolean> {
  const subscriber = await getSubscriber(email)
  if (!subscriber?.unsubscribeToken || !tokensMatch(subscriber.unsubscribeToken, token)) return false

  const now = new Date().toISOString()
  const table = subscribersTable()
  if (!table) {
    await withLocal((store) => {
      const item = store.subscribers.find((entry) => entry.email === email)
      if (!item?.unsubscribeToken || !tokensMatch(item.unsubscribeToken, token)) return
      item.status = 'unsubscribed'
      item.unsubscribedAt = now
    })
    return true
  }

  try {
    await db().send(
      new UpdateCommand({
        TableName: table,
        Key: { email },
        UpdateExpression: 'SET #status = :status, unsubscribedAt = :now',
        ConditionExpression: 'unsubscribeToken = :token',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': 'unsubscribed',
          ':now': now,
          ':token': token,
        },
      })
    )
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false
    throw error
  }
}

export async function listActive(): Promise<Subscriber[]> {
  const table = subscribersTable()
  if (!table) {
    const store = await readLocal()
    return store.subscribers.filter((item) => item.status === 'active')
  }

  const items: Subscriber[] = []
  let startKey: Record<string, unknown> | undefined
  do {
    const result = await db().send(
      new ScanCommand({
        TableName: table,
        FilterExpression: '#status = :active',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':active': 'active' },
        ExclusiveStartKey: startKey,
      })
    )
    items.push(...((result.Items as Subscriber[] | undefined) ?? []))
    startKey = result.LastEvaluatedKey
  } while (startKey)
  return items
}

export async function markSent(email: string, issueId: string): Promise<void> {
  const table = subscribersTable()
  if (!table) {
    await withLocal((store) => {
      const item = store.subscribers.find((entry) => entry.email === email)
      if (item) item.lastIssueSent = issueId
    })
    return
  }
  await db().send(
    new UpdateCommand({
      TableName: table,
      Key: { email },
      UpdateExpression: 'SET lastIssueSent = :id',
      ConditionExpression: 'attribute_exists(email)',
      ExpressionAttributeValues: { ':id': issueId },
    })
  )
}

/** True when this IP is still under 5 subscribe attempts in the current hour. Local dev always allows. */
export async function allowSubscribeAttempt(ip: string): Promise<boolean> {
  const table = subscribersTable()
  if (!table) return true

  const hash = createHash('sha256').update(ip).digest('hex')
  const result = await db().send(
    new UpdateCommand({
      TableName: table,
      Key: { email: `rl#${hash}` },
      UpdateExpression: 'ADD #count :one SET expiresAt = if_not_exists(expiresAt, :exp)',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: {
        ':one': 1,
        ':exp': Math.floor(Date.now() / 1000) + RATE_LIMIT_WINDOW_SEC,
      },
      ReturnValues: 'UPDATED_NEW',
    })
  )
  const count = Number(result.Attributes?.count ?? 0)
  return count <= RATE_LIMIT_MAX
}
