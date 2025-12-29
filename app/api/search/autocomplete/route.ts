import { NextResponse } from 'next/server'
import { autocompleteSearch } from '@/lib/services/search-service'
import { initializeElasticsearchIndex } from '@/lib/elasticsearch'

export async function GET(request: Request) {
  try {
    await initializeElasticsearchIndex()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await autocompleteSearch(query, limit)

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error('Autocomplete error:', error)
    return NextResponse.json(
      { error: error.message || 'Autocomplete failed' },
      { status: 500 }
    )
  }
}

