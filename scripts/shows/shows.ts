import { existsSync, readFileSync, writeFileSync } from 'fs'
import readline from 'readline'
import path from 'path'
import { DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteCommand, DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import showsData from '../../content/shows.json'
import { readShowsTable, scanShowItems } from '../../lib/aws'
import type { Show } from '../../lib/schema'
import { isShowDateUpcoming } from '../../lib/shows'

const DEFAULT_TABLE = 'the-band-project-shows'
const DEFAULT_REGION = 'us-east-1'

function loadLocalEnv(): void {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = value
    }
  }
}

function tableName(): string {
  return process.env.SHOWS_TABLE?.trim() || DEFAULT_TABLE
}

function region(): string {
  return process.env.AMPLIFY_REGION?.trim() || DEFAULT_REGION
}

function fail(error: unknown): never {
  const name = error instanceof Error ? error.name : 'Error'
  const message = error instanceof Error ? error.message : String(error)
  if (name === 'ResourceNotFoundException') {
    console.error(`shows: table not found "${tableName()}" in ${region()}. ${name}: ${message}`)
  } else if (name === 'AccessDeniedException' || name === 'UnauthorizedException') {
    console.error(`shows: missing DynamoDB permission for "${tableName()}". ${name}: ${message}`)
  } else {
    console.error(`shows: ${name}: ${message}`)
  }
  process.exit(1)
}

function client(): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(new DynamoDBClient({ region: region() }))
}

async function partitionKeyName(): Promise<string> {
  const raw = new DynamoDBClient({ region: region() })
  try {
    const described = await raw.send(new DescribeTableCommand({ TableName: tableName() }))
    const hash = described.Table?.KeySchema?.find((key) => key.KeyType === 'HASH')
    if (!hash?.AttributeName) {
      console.error(`shows: table "${tableName()}" has no partition key`)
      process.exit(1)
    }
    return hash.AttributeName
  } catch (error) {
    fail(error)
  }
}

function venueSlug(venue: string): string {
  return venue
    .normalize('NFKD')
    .replace(/['’]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function assertDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`shows: invalid date "${date}". Use YYYY-MM-DD.`)
    process.exit(1)
  }
  const [year, month, day] = date.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    console.error(`shows: invalid date "${date}". That calendar day does not exist.`)
    process.exit(1)
  }
}

function requireText(flags: Record<string, string>, name: string): string {
  const value = flags[name]?.trim()
  if (!value) {
    console.error(`shows: --${name} is required`)
    process.exit(1)
  }
  return value
}

function parseFlags(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {}
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--') continue
    if (!arg.startsWith('--')) {
      console.error(`shows: unexpected argument "${arg}"`)
      process.exit(1)
    }
    const key = arg.slice(2)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      console.error(`shows: missing value for --${key}`)
      process.exit(1)
    }
    flags[key] = value
    index += 1
  }
  return flags
}

function showItem(show: Show, keyName: string): Record<string, unknown> {
  const item: Record<string, unknown> = {
    [keyName]: show.id,
    id: show.id,
    date: show.date,
    venue: show.venue,
    city: show.city,
    state: show.state,
    isUpcoming: isShowDateUpcoming(show),
  }
  if (show.address) item.address = show.address
  if (show.time) item.time = show.time
  if (show.doors) item.doors = show.doors
  if (show.ticketUrl) item.ticketUrl = show.ticketUrl
  return item
}

function printShow(show: Show): void {
  const status = isShowDateUpcoming(show) ? 'upcoming' : 'past'
  console.log(`${show.id}  ${show.date}  ${show.venue}  ${show.city}, ${show.state}  ${status}`)
  if (show.address) console.log(`  ${show.address}`)
  if (show.time) console.log(`  ${show.time}`)
  if (show.doors) console.log(`  doors ${show.doors}`)
}

async function list(): Promise<void> {
  const sorted = await readShowsTable(tableName())
  if (sorted.length === 0) {
    console.log(`No shows in ${tableName()}.`)
    return
  }
  console.table(
    sorted.map((show) => ({
      id: show.id,
      date: show.date,
      venue: show.venue,
      city: show.city,
      status: isShowDateUpcoming(show) ? 'upcoming' : 'past',
    }))
  )
}

async function add(flags: Record<string, string>): Promise<void> {
  const date = requireText(flags, 'date')
  assertDate(date)
  const venue = requireText(flags, 'venue')
  const city = requireText(flags, 'city')
  const state = requireText(flags, 'state')
  if (!/^[A-Za-z]{2}$/.test(state)) {
    console.error('shows: --state must be two letters')
    process.exit(1)
  }
  const address = requireText(flags, 'address')
  const time = requireText(flags, 'time')
  const doors = flags.doors?.trim()
  const slug = venueSlug(venue)
  if (!slug) {
    console.error('shows: --venue needs at least one letter or number')
    process.exit(1)
  }

  const show: Show = {
    id: `${date}-${slug}`,
    date,
    venue,
    city,
    state: state.toUpperCase(),
    address,
    time,
    ...(doors ? { doors } : {}),
    isUpcoming: isShowDateUpcoming({ date }),
  }
  const keyName = await partitionKeyName()
  const item = showItem(show, keyName)

  try {
    await client().send(
      new PutCommand({
        TableName: tableName(),
        Item: item,
        ConditionExpression: 'attribute_not_exists(#pk)',
        ExpressionAttributeNames: { '#pk': keyName },
      })
    )
  } catch (error) {
    const name = error instanceof Error ? error.name : 'Error'
    if (name === 'ConditionalCheckFailedException') {
      console.error(`shows: a show with id ${show.id} already exists. Not overwritten.`)
      process.exit(1)
    }
    fail(error)
  }

  console.log(JSON.stringify({ ...show, isUpcoming: isShowDateUpcoming(show) }, null, 2))
  console.log('Live on the site within about 5 minutes.')
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise<string>((resolve) => {
    rl.question(question, resolve)
  })
  rl.close()
  return answer.trim().toLowerCase() === 'y'
}

async function remove(flags: Record<string, string>): Promise<void> {
  const id = requireText(flags, 'id')
  const keyName = await partitionKeyName()
  const items = await scanShowItems(tableName())
  const item = items.find((entry) => entry.id === id || entry[keyName] === id)
  if (!item) {
    console.error(`shows: no show with id ${id} in ${tableName()}`)
    process.exit(1)
  }

  printShow({
    id: String(item.id ?? item[keyName]),
    date: String(item.date ?? ''),
    venue: String(item.venue ?? ''),
    city: String(item.city ?? ''),
    state: String(item.state ?? ''),
    address: typeof item.address === 'string' ? item.address : undefined,
    time: typeof item.time === 'string' ? item.time : undefined,
    doors: typeof item.doors === 'string' ? item.doors : undefined,
    isUpcoming: false,
  })

  const ok = await confirm('Delete this show? Type y to confirm: ')
  if (!ok) {
    console.log('Cancelled.')
    return
  }

  const keyValue = item[keyName]
  if (typeof keyValue !== 'string' || !keyValue) {
    console.error(`shows: item ${id} is missing partition key ${keyName}`)
    process.exit(1)
  }

  try {
    await client().send(
      new DeleteCommand({
        TableName: tableName(),
        Key: { [keyName]: keyValue },
      })
    )
  } catch (error) {
    fail(error)
  }
  console.log(`Deleted ${id}.`)
  console.log('Gone from the site within about 5 minutes.')
}

async function seed(): Promise<void> {
  const keyName = await partitionKeyName()
  const shows = showsData as Show[]
  for (const show of shows) {
    try {
      await client().send(
        new PutCommand({
          TableName: tableName(),
          Item: showItem(show, keyName),
        })
      )
      console.log(`seeded ${show.id}`)
    } catch (error) {
      fail(error)
    }
  }
  console.log(`Seeded ${shows.length} shows into ${tableName()}.`)
}

async function exportShows(): Promise<void> {
  const shows = await readShowsTable(tableName())
  const file = path.join(process.cwd(), 'content', 'shows.json')
  const payload = shows.map((show) => {
    const entry: Record<string, unknown> = {
      id: show.id,
      date: show.date,
      venue: show.venue,
      city: show.city,
      state: show.state,
    }
    if (show.address) entry.address = show.address
    if (show.time) entry.time = show.time
    if (show.doors) entry.doors = show.doors
    if (show.ticketUrl) entry.ticketUrl = show.ticketUrl
    entry.isUpcoming = isShowDateUpcoming(show)
    return entry
  })
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`Wrote ${shows.length} shows to content/shows.json`)
}

async function main(): Promise<void> {
  loadLocalEnv()
  const [command, ...rest] = process.argv.slice(2)
  const flags = parseFlags(rest)

  try {
    if (command === 'list') await list()
    else if (command === 'add') await add(flags)
    else if (command === 'remove') await remove(flags)
    else if (command === 'seed') await seed()
    else if (command === 'export') await exportShows()
    else {
      console.error('shows: use list, add, remove, seed, or export')
      process.exit(1)
    }
  } catch (error) {
    fail(error)
  }
}

main()
