import { NextResponse } from 'next/server'
import { autocompleteSearch } from '@/lib/services/search-service'
import { initializeElasticsearchIndex } from '@/lib/elasticsearch'
import { getErrorMessage, parseBoundedInt } from '@/lib/api-validation'

export async function GET(request: Request) {
  try {
    await initializeElasticsearchIndex()

    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('q') || '').trim().slice(0, 200)
    const limit = parseBoundedInt(searchParams.get('limit'), 10, { max: 25 })

    if (!query) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await autocompleteSearch(query, limit)

    return NextResponse.json({ suggestions })
  } catch (error: unknown) {
    console.error('Autocomplete error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Autocomplete failed') },
      { status: 500 }
    )
  }
}
