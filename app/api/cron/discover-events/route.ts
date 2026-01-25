import { NextRequest, NextResponse } from 'next/server'
import { eventDiscoveryService } from '@/lib/services/event-discovery'

/**
 * Cron endpoint for automated event discovery
 * Called by Vercel Cron Jobs daily at 3 AM UTC (4 PM NZT)
 *
 * Security: Verifies CRON_SECRET header from Vercel
 *
 * Manual testing:
 * curl -X GET http://localhost:3000/api/cron/discover-events \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

// Vercel cron jobs should complete within function timeout
export const maxDuration = 300 // 5 minutes for Pro plan

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Check for Vercel's cron secret or our own auth header
    if (cronSecret) {
      const expectedAuth = `Bearer ${cronSecret}`
      if (authHeader !== expectedAuth) {
        console.error('Unauthorized cron request')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } else {
      // If no CRON_SECRET is set, only allow in development
      if (process.env.NODE_ENV === 'production') {
        console.error('CRON_SECRET not configured')
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        )
      }
    }

    console.log('Starting scheduled event discovery...')
    const startTime = Date.now()

    // Run the discovery process
    const result = await eventDiscoveryService.runFullDiscovery()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`Discovery completed in ${duration}s`)

    return NextResponse.json({
      success: true,
      message: 'Event discovery completed',
      discovered: result.discovered,
      saved: result.saved,
      skipped: result.discovered - result.saved,
      durationSeconds: parseFloat(duration),
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Discovery failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
