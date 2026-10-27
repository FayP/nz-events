/**
 * Weekly check that published event details still match the organiser's
 * sources. Report-only: it tags events for review and never edits them.
 */

export const REVIEW_TAG = 'details-need-review'

// Statuses that mean the listing should come down or be re-dated.
const BLOCKING_STATUSES = new Set(['cancelled', 'postponed', 'not_found'])

export type VerificationStatus =
  | 'confirmed'
  | 'cancelled'
  | 'postponed'
  | 'details_changed'
  | 'not_found'

export interface VerificationIssue {
  field: string
  listed: string
  found: string
}

export interface AiVerification {
  status: VerificationStatus
  eventDate: string | null
  location: string | null
  issues: VerificationIssue[]
  sources: string[]
  summary: string
}

export interface LinkCheck {
  url: string
  status: number | null
  error?: string
}

export interface ListedEvent {
  name: string
  slug: string
  startDate: Date
  location: string
  city: string
  region: string
  distances: unknown
  website: string | null
  registrationUrl: string | null
}

/** The date the site shows for an event (pages render in UTC). */
export function listedDate(event: Pick<ListedEvent, 'startDate'>): string {
  return event.startDate.toISOString().slice(0, 10)
}

/**
 * 404/410/5xx and network failures mean the link is broken. 401/403/429 usually
 * mean the site blocks bots, which says nothing about the event.
 */
export function isDeadLink(check: LinkCheck): boolean {
  if (check.status === null) return true
  return check.status === 404 || check.status === 410 || check.status >= 500
}

/** Reasons an event needs a human to look at it; empty means it checked out. */
export function assessEvent(
  event: Pick<ListedEvent, 'startDate'>,
  ai: AiVerification | null,
  links: LinkCheck[]
): string[] {
  const reasons: string[] = []

  if (!ai) {
    reasons.push('Check failed: no verification result')
  } else {
    if (BLOCKING_STATUSES.has(ai.status)) {
      reasons.push(`Status: ${ai.status.replace('_', ' ')}`)
    }
    if (ai.eventDate && ai.eventDate !== listedDate(event)) {
      reasons.push(`Date: listed ${listedDate(event)}, sources say ${ai.eventDate}`)
    }
    for (const issue of ai.issues) {
      reasons.push(`${issue.field}: listed "${issue.listed}", sources say "${issue.found}"`)
    }
    if (ai.status === 'confirmed' && ai.sources.length === 0) {
      reasons.push('Confirmed without a cited source')
    }
  }

  for (const link of links) {
    if (isDeadLink(link)) {
      reasons.push(`Broken link: ${link.url} (${link.status ?? link.error ?? 'no response'})`)
    }
  }

  return reasons
}

export function buildVerificationPrompt(event: ListedEvent): string {
  const date = listedDate(event)
  const weekday = event.startDate.toLocaleString('en-NZ', { weekday: 'long', timeZone: 'UTC' })
  return `You are checking a listing on GoStride, a New Zealand endurance event directory.

Listed details:
- Name: ${event.name}
- Date: ${weekday} ${date}
- Location: ${event.location}, ${event.city}, ${event.region}
- Distances: ${JSON.stringify(event.distances ?? [])}
- Website: ${event.website ?? 'none'}
- Registration: ${event.registrationUrl ?? 'none'}

Search the web for this year's edition. Prefer the organiser's own site, the
registration platform, and recent news or social posts from the organiser.

Decide:
- "confirmed": an official source shows this edition going ahead on the listed date.
- "cancelled": an official source says it is cancelled, on hiatus, or not running this year.
- "postponed": it has moved to a later date that is not yet confirmed.
- "details_changed": it is going ahead but the date, location or distances differ.
- "not_found": you cannot find any current source showing this edition is scheduled.

Report an issue only when a source shows a different value. Ignore wording and
formatting differences. eventDate is the date this edition is on (YYYY-MM-DD),
or null if no source gives one. Cite the URLs you relied on.`
}

export const VERIFICATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'eventDate', 'location', 'issues', 'sources', 'summary'],
  properties: {
    status: {
      type: 'string',
      enum: ['confirmed', 'cancelled', 'postponed', 'details_changed', 'not_found'],
    },
    eventDate: { type: ['string', 'null'] },
    location: { type: ['string', 'null'] },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['field', 'listed', 'found'],
        properties: {
          field: { type: 'string' },
          listed: { type: 'string' },
          found: { type: 'string' },
        },
      },
    },
    sources: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
} as const

/** Run tasks with at most `limit` in flight, preserving input order. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index])
    }
  })
  await Promise.all(workers)
  return results
}
