import { NextResponse } from 'next/server'
import { searchEvents } from '@/lib/services/search-service'
import { initializeElasticsearchIndex } from '@/lib/elasticsearch'

export async function GET(request: Request) {
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
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    }

    const results = await searchEvents(options)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}

