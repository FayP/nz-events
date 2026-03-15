import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Cron endpoint: refresh stale event dates
 *
 * For annual recurring events, dates are stored as the most recent known
 * occurrence. Once that date passes, the event looks like it happened last
 * year and getNextOccurrenceDate() rolls it forward at render time —
 * but the stored date itself becomes misleading and may be wrong for
 * next year (e.g. a Saturday event that shifts by a day each year).
 *
 * This job finds published events whose stored startDate is more than
 * STALE_DAYS_THRESHOLD in the past, marks them for review, and
 * optionally attempts a best-effort year roll (preserving month/day)
 * so the site stays roughly correct while a human manually confirms.
 *
 * Vercel Cron: daily at 4 AM UTC (5 PM NZT)
 *
 * Manual test:
 *   curl -X GET https://your-domain.com/api/cron/refresh-event-dates \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

export const maxDuration = 60

// How many days past the event date before we consider it stale
const STALE_DAYS_THRESHOLD = 30

export async function GET(request: NextRequest) {
  // Auth
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  const now = new Date()
  const staleThreshold = new Date(now.getTime() - STALE_DAYS_THRESHOLD * 24 * 60 * 60 * 1000)

  // Find published events with a startDate older than the threshold
  const staleEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startDate: { lt: staleThreshold },
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      tags: true,
    },
    orderBy: { startDate: 'asc' },
  })

  if (staleEvents.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No stale events found',
      checked: 0,
      rolled: 0,
      timestamp: now.toISOString(),
    })
  }

  const rolled: string[] = []
  const skipped: string[] = []

  for (const event of staleEvents) {
    const original = event.startDate

    // Best-effort roll: advance startDate by exactly 1 year.
    // This keeps the stored date in the right ballpark while a human
    // can verify and correct the exact date (e.g. day-of-week shift).
    const nextYear = new Date(Date.UTC(
      original.getUTCFullYear() + 1,
      original.getUTCMonth(),
      original.getUTCDate(),
      0, 0, 0, 0,
    ))

    // Don't roll if it would produce a date in the past (already stale again)
    if (nextYear < now) {
      skipped.push(`${event.name} (would still be stale after roll)`)
      continue
    }

    await prisma.event.update({
      where: { id: event.id },
      data: {
        startDate: nextYear,
        // Add a tag so the admin dashboard can surface these for human review
        tags: Array.from(new Set([...event.tags, 'date-needs-review'])),
      },
    })

    rolled.push(
      `${event.name}: ${original.toISOString().substring(0, 10)} → ${nextYear.toISOString().substring(0, 10)}`
    )
  }

  console.log(`Stale event dates rolled: ${rolled.length}, skipped: ${skipped.length}`)
  rolled.forEach((r) => console.log('  rolled:', r))
  skipped.forEach((s) => console.log('  skipped:', s))

  return NextResponse.json({
    success: true,
    message: `Rolled ${rolled.length} stale event date(s)`,
    staleFound: staleEvents.length,
    rolled: rolled.length,
    skipped: skipped.length,
    details: { rolled, skipped },
    timestamp: now.toISOString(),
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
