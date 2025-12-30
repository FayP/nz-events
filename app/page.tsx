"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

// Force dynamic rendering for search params
export const dynamic = 'force-dynamic'

interface Event {
  id: string
  name: string
  slug: string
  eventType: string
  startDate: string
  location: string
  city: string
  region: string
  distances?: any
}

interface FilterOptions {
  regions: string[]
  distances: {
    all: string[]
    running: string[]
    triathlon: string[]
    cycling: string[]
  }
  eventTypes: string[]
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // State
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Filters from URL
  const searchQuery = searchParams.get('q') || ''
  const eventTypes = searchParams.get('eventTypes')?.split(',') || []
  const distance = searchParams.get('distance') || ''
  const region = searchParams.get('region') || ''

  // Local filter state
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(eventTypes)
  const [selectedDistance, setSelectedDistance] = useState(distance)
  const [selectedRegion, setSelectedRegion] = useState(region)

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/events/filters')
        const data = await response.json()
        setFilterOptions(data)
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }
    fetchFilterOptions()
  }, [])

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (searchInput) params.set('q', searchInput)
    if (selectedEventTypes.length > 0) params.set('eventTypes', selectedEventTypes.join(','))
    if (selectedDistance) params.set('distance', selectedDistance)
    if (selectedRegion) params.set('region', selectedRegion)

    router.push(`/?${params.toString()}`)
  }, [searchInput, selectedEventTypes, selectedDistance, selectedRegion, router])

  // Fetch events with filters
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      // Build query params
      const params = new URLSearchParams()
      params.set('status', 'PUBLISHED')
      params.set('limit', '50')

      if (selectedEventTypes.length > 0) {
        // If multiple event types, we'll need to handle this differently
        // For now, use the first one (can enhance later)
        params.set('eventType', selectedEventTypes[0])
      }
      if (selectedRegion) params.set('region', selectedRegion)
      if (selectedDistance) params.set('distance', selectedDistance)

      // Use search API if there's a query, otherwise use events API
      let response
      if (searchInput.trim()) {
        params.set('q', searchInput)
        response = await fetch(`/api/search?${params.toString()}`)
        const data = await response.json()
        // Convert search results to event format
        setEvents(
          data.results?.map((r: any) => ({
            id: r.id,
            name: r.name,
            slug: r.slug || r.id, // Use slug from search results
            eventType: r.eventType,
            startDate: r.startDate,
            location: r.location,
            city: r.city,
            region: r.region,
            distances: r.distances || [],
          })) || []
        )
      } else {
        response = await fetch(`/api/events?${params.toString()}`)
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [searchInput, selectedEventTypes, selectedRegion, selectedDistance])

  // Fetch events when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents()
    }, 300) // Debounce

    return () => clearTimeout(timeoutId)
  }, [fetchEvents])

  // Autocomplete for search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchInput.length < 2) {
        setSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchInput)}`)
        const data = await response.json()
        setSuggestions(data.suggestions?.map((s: any) => s.text) || [])
      } catch (error) {
        console.error('Autocomplete error:', error)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timeoutId)
  }, [searchInput])

  // Get distance options based on selected event types
  const distanceOptions = useMemo(() => {
    if (!filterOptions) return []
    if (selectedEventTypes.includes('RUNNING')) {
      return filterOptions.distances.running
    }
    if (selectedEventTypes.includes('TRIATHLON')) {
      return filterOptions.distances.triathlon
    }
    if (selectedEventTypes.includes('BIKING')) {
      return filterOptions.distances.cycling
    }
    return []
  }, [filterOptions, selectedEventTypes])

  // Toggle event type
  const toggleEventType = (type: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    // Clear distance if event type changes
    setSelectedDistance('')
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('')
    setSelectedEventTypes([])
    setSelectedDistance('')
    setSelectedRegion('')
  }

  const hasActiveFilters =
    searchInput || selectedEventTypes.length > 0 || selectedDistance || selectedRegion

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50">
          Discover Events in New Zealand
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Find running, cycling, and triathlon events across New Zealand
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for events..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-black placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-400"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchInput(suggestion)
                    setSuggestions([])
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

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Event Type Filter */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Event Type
              </h3>
              <div className="space-y-2">
                {filterOptions?.eventTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEventTypes.includes(type)}
                      onChange={() => toggleEventType(type)}
                      className="mr-2 h-4 w-4 rounded border-zinc-300 text-black focus:ring-2 focus:ring-black dark:border-zinc-600 dark:focus:ring-zinc-400"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {type === 'BIKING' ? 'Cycling' : type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Distance Filter (shows when Running or Triathlon selected) */}
            {distanceOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Distance
                </h3>
                <select
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <option value="">All Distances</option>
                  {distanceOptions.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Location Filter */}
            {filterOptions && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Location
                </h3>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <option value="">All Regions</option>
                  {filterOptions.regions.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* Events Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="text-zinc-600 dark:text-zinc-400">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">
                {hasActiveFilters
                  ? 'No events found matching your filters. Try adjusting your search.'
                  : 'No events found. Check back soon!'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Showing {events.length} event{events.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="mb-2">
                      <span className="rounded bg-black px-2 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                        {event.eventType === 'BIKING' ? 'Cycling' : event.eventType}
                      </span>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
                      {event.name}
                    </h2>
                    <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(event.startDate).toLocaleDateString('en-NZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {event.location}, {event.region}
                    </p>
                    {event.distances && Array.isArray(event.distances) && event.distances.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(event.distances as string[]).slice(0, 3).map((dist, i) => (
                          <span
                            key={i}
                            className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {dist}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
