import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import showsData from '@/content/shows.json'
import { hasValidShowDate } from '@/lib/calendar'
import type { Show } from '@/lib/schema'
import { filterUpcomingShowsByDate, isShowDateUpcoming } from '@/lib/shows'

let documentClient: DynamoDBDocumentClient | undefined

function docClient(): DynamoDBDocumentClient {
  if (!documentClient) {
    documentClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: process.env.AMPLIFY_REGION || 'us-east-1',
      })
    )
  }
  return documentClient
}

const sesClient = new SESClient({
  region: process.env.AMPLIFY_REGION || 'us-east-1',
})

// DynamoDB table names
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'the-band-project-messages'

// Contact form email configuration
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'book@thebandproject.live'

function showsTableName(): string | undefined {
  const name = process.env.SHOWS_TABLE?.trim()
  return name || undefined
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function byDate(a: Show, b: Show): number {
  return a.date.localeCompare(b.date) || a.id.localeCompare(b.id)
}

function normalizeShow(item: object): Show | null {
  const record = item as Record<string, unknown>
  const id = text(record.id) ?? text(record['`id`'])
  const date = text(record.date)
  const venue = text(record.venue)
  const city = text(record.city)
  const state = text(record.state)
  if (!id || !date || !venue || !city || !state || !hasValidShowDate({ date })) return null

  const show: Show = {
    id,
    date,
    venue,
    city,
    state,
    isUpcoming: isShowDateUpcoming({ date }),
  }
  const address = text(record.address)
  const time = text(record.time)
  const doors = text(record.doors)
  const ticketUrl = text(record.ticketUrl)
  if (address) show.address = address
  if (time) show.time = time
  if (doors) show.doors = doors
  if (ticketUrl) show.ticketUrl = ticketUrl
  return show
}

function staticShows(): Show[] {
  return (showsData as Show[])
    .map((show) => normalizeShow(show))
    .filter((show): show is Show => show !== null)
    .sort(byDate)
}

/** Paginated table scan. Throws on permission, network, and missing-table errors. */
export async function scanShowItems(tableName: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = []
  let startKey: Record<string, unknown> | undefined

  do {
    const response = await docClient().send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: startKey,
      })
    )
    for (const item of response.Items ?? []) {
      items.push(item as Record<string, unknown>)
    }
    startKey = response.LastEvaluatedKey as Record<string, unknown> | undefined
  } while (startKey)

  return items
}

export async function readShowsTable(tableName: string): Promise<Show[]> {
  const items = await scanShowItems(tableName)
  return items.map((item) => normalizeShow(item)).filter((show): show is Show => show !== null).sort(byDate)
}

export async function getAllShows(): Promise<Show[]> {
  const table = showsTableName()
  if (!table) return staticShows()

  try {
    return await readShowsTable(table)
  } catch (error) {
    const name = error instanceof Error ? error.name : 'Error'
    const message = error instanceof Error ? error.message : String(error)
    console.error('shows: DynamoDB read failed', name, message)
    return staticShows()
  }
}

export async function getUpcomingShows(): Promise<Show[]> {
  return filterUpcomingShowsByDate(await getAllShows())
}

export async function getNextShow(): Promise<Show | null> {
  const upcoming = await getUpcomingShows()
  return upcoming[0] ?? null
}

export async function saveContactMessage(message: any): Promise<void> {
  try {
    const item = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...message,
      createdAt: new Date().toISOString(),
    }

    const command = new PutCommand({
      TableName: MESSAGES_TABLE,
      Item: item,
    })

    await docClient().send(command)
  } catch (error) {
    console.error('Error saving message:', error)
    throw error
  }
}

export async function sendContactEmail(message: any): Promise<void> {
  try {
    const emailBody = `
New contact form submission from The Band Project website:

Name: ${message.name}
Email: ${message.email}
${message.organization ? `Organization: ${message.organization}` : ''}
${message.eventDate ? `Event Date: ${message.eventDate}` : ''}
${message.location ? `Location: ${message.location}` : ''}

Message:
${message.message}
    `.trim()

    const command = new SendEmailCommand({
      Source: CONTACT_EMAIL,
      Destination: {
        ToAddresses: [CONTACT_EMAIL],
      },
      Message: {
        Subject: {
          Data: 'New Booking Request for The Band Project',
        },
        Body: {
          Text: {
            Data: emailBody,
          },
        },
      },
    })

    await sesClient.send(command)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
