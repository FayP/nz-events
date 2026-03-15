"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SearchResponse } from '@/types'
import { formatEventDate } from '@/lib/utils/format-date'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSuggestions(data.suggestions?.map((s: any) => s.text) || [])
      } catch (error) {
        console.error('Autocomplete error:', error)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-black dark:text-zinc-50">
        Search Events
      </h1>

      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for events..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-black placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-400"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion)
                    performSearch(suggestion)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-black hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center text-zinc-600 dark:text-zinc-400">
          Searching...
        </div>
      )}

      {results && !loading && (
        <div>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Found {results.total} event{results.total !== 1 ? 's' : ''}
          </p>

          {results.results.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">
                No events found. Try a different search term.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.results.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
                    {event.highlight?.name ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: event.highlight.name[0],
                        }}
                      />
                    ) : (
                      event.name
                    )}
                  </h2>
                  {event.description && (
                    <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {event.highlight?.description ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: event.highlight.description[0],
                          }}
                        />
                      ) : (
                        event.description
                      )}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <span>{event.location}</span>
                    <span>•</span>
                    <span>
                      {formatEventDate(event.startDate, { month: 'short' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

