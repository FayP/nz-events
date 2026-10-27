import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { escapeHtml } from '@/lib/api-validation'
import {
  REVIEW_TAG,
  assessEvent,
  buildVerificationPrompt,
  listedDate,
  mapWithConcurrency,
  VERIFICATION_SCHEMA,
  type AiVerification,
  type LinkCheck,
  type ListedEvent,
} from '@/lib/services/event-verification'

/**
 * Cron endpoint: weekly check that upcoming event details are still correct
 *
 * Searches the web for each published event in the next WINDOW_DAYS and
 * compares it with the listing: still running, date, location, distances,
 * and whether the website and registration links still work. Flagged events
 * get the REVIEW_TAG and are emailed to the site owner. Listings are never
 * edited or unpublished automatically.
 *
 * Vercel Cron: Sundays 7 PM UTC (Monday 8 AM NZDT)
 *
 * Manual test (no tags or email):
 *   curl "https://your-domain.com/api/cron/verify-events?dryRun=1" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

export const maxDuration = 300

const WINDOW_DAYS = 90
const CONCURRENCY = 4
// Stop starting new checks with enough time left to tag and email.
const TIME_BUDGET_MS = 240_000
const MODEL = process.env.EVENT_CHECK_MODEL || 'gpt-4.1'

async function checkLink(url: string): Promise<LinkCheck> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GoStrideBot/1.0; +https://www.gostride.co.nz)' },
    })
    return { url, status: res.status }
  } catch (error) {
    return { url, status: null, error: error instanceof Error ? error.message : String(error) }
  }
}

async function verifyWithWebSearch(event: ListedEvent): Promise<AiVerification | null> {
  // Imported lazily: lib/openai throws at import time without a key.
  const { openai } = await import('@/lib/openai')
  const response = await openai.responses.create({
    model: MODEL,
    tools: [{ type: 'web_search' }],
    input: buildVerificationPrompt(event),
    text: {
      format: {
        type: 'json_schema',
        name: 'event_verification',
        strict: true,
        schema: VERIFICATION_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  })
  return JSON.parse(response.output_text) as AiVerification
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'
  const started = Date.now()
  const now = new Date()
  const windowEnd = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000)

  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED', startDate: { gte: now, lte: windowEnd } },
    select: {
      id: true,
      name: true,
      slug: true,
      startDate: true,
      location: true,
      city: true,
      region: true,
      distances: true,
      website: true,
      registrationUrl: true,
      tags: true,
    },
    orderBy: { startDate: 'asc' },
  })

  const results = await mapWithConcurrency(events, CONCURRENCY, async (event) => {
    if (Date.now() - started > TIME_BUDGET_MS) {
      return { event, skipped: true as const, reasons: [] as string[], ai: null }
    }

    const urls = Array.from(new Set([event.website, event.registrationUrl].filter((u): u is string => !!u)))
    const [links, ai] = await Promise.all([
      Promise.all(urls.map(checkLink)),
      verifyWithWebSearch(event).catch((error) => {
        console.error(`Verification failed for ${event.slug}:`, error)
        return null
      }),
    ])

    return { event, skipped: false as const, reasons: assessEvent(event, ai, links), ai }
  })

  const checked = results.filter((r) => !r.skipped)
  const flagged = checked.filter((r) => r.reasons.length > 0)
  const skipped = results.filter((r) => r.skipped)

  if (!dryRun) {
    for (const r of checked) {
      const hasTag = r.event.tags.includes(REVIEW_TAG)
      const needsTag = r.reasons.length > 0
      if (hasTag === needsTag) continue
      await prisma.event.update({
        where: { id: r.event.id },
        data: {
          tags: needsTag
            ? [...r.event.tags, REVIEW_TAG]
            : r.event.tags.filter((tag) => tag !== REVIEW_TAG),
        },
      })
    }

    await sendReport(flagged, checked.length, skipped.map((r) => r.event.name))
  }

  console.log(`Event check: ${checked.length} checked, ${flagged.length} flagged, ${skipped.length} skipped`)

  return NextResponse.json({
    success: true,
    dryRun,
    checked: checked.length,
    flagged: flagged.map((r) => ({
      slug: r.event.slug,
      name: r.event.name,
      listedDate: listedDate(r.event),
      reasons: r.reasons,
      summary: r.ai?.summary ?? null,
      sources: r.ai?.sources ?? [],
    })),
    skipped: skipped.map((r) => r.event.slug),
    durationSeconds: Math.round((Date.now() - started) / 1000),
    timestamp: now.toISOString(),
  })
}

type Flagged = {
  event: { name: string; slug: string; startDate: Date }
  reasons: string[]
  ai: AiVerification | null
}

async function sendReport(flagged: Flagged[], checkedCount: number, skipped: string[]) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set; event check report not sent')
    return
  }

  const siteUrl = 'https://www.gostride.co.nz'
  const items = flagged
    .map((r) => {
      const reasons = r.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')
      const sources = (r.ai?.sources ?? [])
        .map((url) => `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`)
        .join('<br>')
      return `<h3><a href="${siteUrl}/events/${escapeHtml(r.event.slug)}">${escapeHtml(r.event.name)}</a> (${listedDate(r.event)})</h3>
<ul>${reasons}</ul>
${r.ai?.summary ? `<p>${escapeHtml(r.ai.summary)}</p>` : ''}
${sources ? `<p>Sources:<br>${sources}</p>` : ''}`
    })
    .join('')

  const skippedNote = skipped.length
    ? `<p>Not checked this week (ran out of time): ${skipped.map(escapeHtml).join(', ')}</p>`
    : ''

  const subject = flagged.length
    ? `[GoStride] ${flagged.length} event${flagged.length === 1 ? '' : 's'} need checking`
    : `[GoStride] All ${checkedCount} upcoming events checked out`

  const html = flagged.length
    ? `<p>The weekly check found ${flagged.length} of ${checkedCount} upcoming events that may be wrong. Nothing has been changed; each is tagged <code>${REVIEW_TAG}</code>. Archive any that are not running.</p>${items}${skippedNote}`
    : `<p>All ${checkedCount} events in the next ${WINDOW_DAYS} days matched their sources.</p>${skippedNote}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'GoStride Checks <onboarding@resend.dev>',
    to: [process.env.CONTACT_EMAIL || 'faypickering1@gmail.com'],
    subject,
    html,
  })
  if (error) console.error('Event check report failed to send:', error)
}

export async function POST(request: NextRequest) {
  return GET(request)
}
