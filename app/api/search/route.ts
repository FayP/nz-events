import { NextResponse } from 'next/server'
import { searchEvents } from '@/lib/services/search-service'
import { initializeElasticsearchIndex } from '@/lib/elasticsearch'
import { checkRateLimit } from '@/lib/rate-limit'
import { getErrorMessage, parseBoundedInt } from '@/lib/api-validation'

export async function GET(request: Request) {
  // 60 searches per IP per minute
  const rateLimited = checkRateLimit(request, {
    id: 'search',
    limit: 60,
    windowSeconds: 60,
  })
  if (rateLimited) return rateLimited
  try {
    // Initialize index if it doesn't exist
    await initializeElasticsearchIndex()

    const { searchParams } = new URL(request.url)
    const options = {
      q: searchParams.get('q') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      region: searchParams.get('region') || undefined,
      city: searchParams.get('city') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      distance: searchParams.get('distance') || undefined,
      page: parseBoundedInt(searchParams.get('page'), 1, { max: 1000 }),
      limit: parseBoundedInt(searchParams.get('limit'), 20, { max: 100 }),
    }

    const results = await searchEvents(options)

    return NextResponse.json(results)
  } catch (error: unknown) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Search failed') },
      { status: 500 }
    )
  }
}
