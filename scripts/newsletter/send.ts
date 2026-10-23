import { execFile } from 'child_process'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import readline from 'readline'
import { existsSync, readFileSync } from 'fs'
import { sendEmail, unsubscribeApiUrl, unsubscribePageUrl } from '../../lib/email'
import {
  CONFIGURATION_SET,
  fromEmailAddress,
  postalAddressIsSet,
  POSTAL_ADDRESS,
  siteBaseUrl,
} from '../../lib/newsletter-config'
import { listActive, markSent, type Subscriber } from '../../lib/subscribers'
import { latestIssuePath, loadIssue, renderIssue, type NewsletterIssue } from './render'

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

function argValue(flag: string): string | undefined {
  const args = process.argv
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index + 1]
    if (args[index] === flag && value && !value.startsWith('--')) return value
  }
  return undefined
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isThrottle(error: unknown): boolean {
  const name = error instanceof Error ? error.name : ''
  const status = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
  return (
    status === 429 ||
    name === 'TooManyRequestsException' ||
    name === 'Throttling' ||
    name === 'ThrottlingException' ||
    name === 'LimitExceededException'
  )
}

async function sendWithRetry(task: () => Promise<void>): Promise<void> {
  let delay = 400
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await task()
      return
    } catch (error) {
      if (!isThrottle(error) || attempt === 4) throw error
      await sleep(delay)
      delay *= 2
    }
  }
}

function ask(prompt: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

function renderedFor(issue: NewsletterIssue, email: string, token: string, subjectPrefix = '') {
  return renderIssue(issue, {
    unsubscribeUrl: unsubscribePageUrl(email, token),
    postalAddress: POSTAL_ADDRESS,
    subjectPrefix,
  })
}

async function main(): Promise<void> {
  loadLocalEnv()

  if (!postalAddressIsSet()) {
    console.error(
      'Refusing to run: set POSTAL_ADDRESS in lib/newsletter-config.ts to a real mailing address. CAN-SPAM requires one, and it is still TODO.'
    )
    process.exit(1)
  }

  const preview = process.argv.includes('--preview')
  const send = process.argv.includes('--send')
  const dryRun = process.argv.includes('--dry-run')
  const wantsTest = process.argv.includes('--test')
  const testAddress = argValue('--test')
  const modes = [preview, send, wantsTest].filter(Boolean).length
  if (modes !== 1) {
    console.error('Choose one of --preview, --test you@example.com, or --send')
    process.exit(1)
  }
  if (wantsTest && !testAddress) {
    console.error('Pass an address: npm run newsletter:test -- --test you@example.com')
    process.exit(1)
  }

  const issuePath = argValue('--issue') || latestIssuePath()
  const issue = loadIssue(issuePath)
  console.log(`Issue ${issue.id} (${issuePath})`)

  if (preview) {
    const rendered = renderedFor(issue, 'preview@example.com', 'preview-token')
    const previewPath = path.join(process.cwd(), 'newsletters', 'preview.html')
    mkdirSync(path.dirname(previewPath), { recursive: true })
    writeFileSync(previewPath, rendered.html)
    console.log(`Wrote ${previewPath}`)
    execFile('open', [previewPath], (error) => {
      if (error) console.error('Could not open the preview. Open the file manually.')
    })
    return
  }

  if (testAddress) {
    if (!fromEmailAddress()) {
      console.error('Set NEWSLETTER_FROM_EMAIL before sending a test.')
      process.exit(1)
    }
    const addresses = testAddress.split(',').map((item) => item.trim()).filter(Boolean)
    for (const address of addresses) {
      const rendered = renderedFor(issue, address, 'test-token', '[TEST] ')
      await sendWithRetry(() =>
        sendEmail({
          to: address,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          unsubscribeApiUrl: unsubscribeApiUrl(address, 'test-token'),
        })
      )
      console.log(`Test sent to ${address}`)
      await sleep(100)
    }
    return
  }

  const subscribers = await listActive()
  const pending = subscribers.filter((subscriber) => subscriber.lastIssueSent !== issue.id)
  const skipped = subscribers.length - pending.length
  console.log(`${pending.length} active subscribers will receive "${issue.subject}" (${skipped} already sent)`)

  if (dryRun) {
    pending.slice(0, 3).forEach((subscriber) => {
      console.log(unsubscribePageUrl(subscriber.email, subscriber.unsubscribeToken))
    })
    writeLog(issue.id, pending.map((subscriber) => `dry-run ${subscriber.email}`), [], [])
    console.log('Dry run: no email sent.')
    return
  }

  if (!fromEmailAddress()) {
    console.error('Set NEWSLETTER_FROM_EMAIL before sending.')
    process.exit(1)
  }

  if (pending.length === 0) {
    console.log('Nothing to send.')
    return
  }

  const typed = await ask(`Type ${pending.length} to send: `)
  if (typed !== String(pending.length)) {
    console.error('Count did not match. Nothing sent.')
    process.exit(1)
  }

  const sent: string[] = []
  const failed: string[] = []
  for (const subscriber of pending) {
    try {
      await deliver(issue, subscriber)
      await markSent(subscriber.email, issue.id)
      sent.push(subscriber.email)
      console.log(`Sent ${subscriber.email}`)
    } catch (error) {
      failed.push(subscriber.email)
      console.error(`Failed ${subscriber.email}`, error)
    }
    await sleep(100)
  }

  writeLog(
    issue.id,
    sent.map((email) => `sent ${email}`),
    subscribers.filter((subscriber) => subscriber.lastIssueSent === issue.id).map((subscriber) => `skipped ${subscriber.email}`),
    failed.map((email) => `failed ${email}`)
  )
  console.log(`Summary: sent ${sent.length}, skipped ${skipped}, failed ${failed.length}`)
  console.log(`Configuration set: ${CONFIGURATION_SET}`)
  console.log(`Links use ${siteBaseUrl()}`)
}

async function deliver(issue: NewsletterIssue, subscriber: Subscriber): Promise<void> {
  const rendered = renderedFor(issue, subscriber.email, subscriber.unsubscribeToken)
  await sendWithRetry(() =>
    sendEmail({
      to: subscriber.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      unsubscribeApiUrl: unsubscribeApiUrl(subscriber.email, subscriber.unsubscribeToken),
    })
  )
}

function writeLog(issueId: string, sent: string[], skipped: string[], failed: string[]): void {
  const dir = path.join(process.cwd(), 'newsletters', 'logs')
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.join(dir, `${issueId}-${stamp}.log`)
  writeFileSync(file, [...sent, ...skipped, ...failed].join('\n') + '\n')
  console.log(`Log: ${file}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
