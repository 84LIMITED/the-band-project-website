import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

export interface NewsletterShow {
  title: string
  date: string
  time: string
  location: string
  details: string
}

export interface NewsletterIssue {
  id: string
  subject: string
  preheader: string
  headline: string
  intro: string
  shows: NewsletterShow[]
  buttonText: string
  buttonUrl: string
  closing: string
}

const ISSUE_DIR = path.join(process.cwd(), 'newsletters', 'issues')

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function latestIssuePath(): string {
  const files = readdirSync(ISSUE_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(ISSUE_DIR, name))
  if (files.length === 0) {
    throw new Error('No issue files in newsletters/issues/')
  }
  files.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  return files[0]
}

export function loadIssue(filePath: string): NewsletterIssue {
  const issue = JSON.parse(readFileSync(filePath, 'utf8')) as NewsletterIssue
  if (!issue.id || !issue.subject || !Array.isArray(issue.shows)) {
    throw new Error(`Issue file is missing id, subject, or shows: ${filePath}`)
  }
  if (issue.buttonUrl && !/^https?:\/\//i.test(issue.buttonUrl)) {
    throw new Error('buttonUrl must start with http:// or https://')
  }
  return issue
}

function fillShows(template: string, shows: NewsletterShow[], escape: boolean): string {
  return template.replace(/\{\{#shows\}\}([\s\S]*?)\{\{\/shows\}\}/g, (_match, block: string) => {
    return shows
      .map((show) =>
        block.replace(/\{\{(\w+)\}\}/g, (_token, key: string) => {
          const value = String((show as unknown as Record<string, string>)[key] ?? '')
          return escape ? escapeHtml(value) : value
        })
      )
      .join('')
  })
}

function fill(template: string, values: Record<string, string>, escape: boolean): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_token, key: string) => {
    const value = values[key] ?? ''
    return escape ? escapeHtml(value) : value
  })
}

export function renderIssue(
  issue: NewsletterIssue,
  options: { unsubscribeUrl: string; postalAddress: string; subjectPrefix?: string }
): { subject: string; html: string; text: string } {
  const htmlTemplate = readFileSync(path.join(process.cwd(), 'emails', 'newsletter.html'), 'utf8')
  const textTemplate = readFileSync(path.join(process.cwd(), 'emails', 'newsletter.txt'), 'utf8')
  const fields = {
    subject: `${options.subjectPrefix || ''}${issue.subject}`,
    preheader: issue.preheader,
    headline: issue.headline,
    intro: issue.intro,
    buttonText: issue.buttonText,
    buttonUrl: issue.buttonUrl,
    closing: issue.closing,
    postalAddress: options.postalAddress,
    unsubscribeUrl: options.unsubscribeUrl,
  }

  const html = fill(fillShows(htmlTemplate, issue.shows, true), fields, true)
  const text = fill(fillShows(textTemplate, issue.shows, false), fields, false).replace(/\n{3,}/g, '\n\n')

  return { subject: fields.subject, html, text }
}
