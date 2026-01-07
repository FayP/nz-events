"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getEventBadgeVariant, formatEventType } from '@/lib/utils'

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
  const eventTypes = searchParams.get('eventTypes')?.split(',').filter(Boolean) || []
  const distances = searchParams.get('distances')?.split(',').filter(Boolean) || []
  const region = searchParams.get('region') || ''

  // Local filter state
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(eventTypes)
  const [selectedDistances, setSelectedDistances] = useState<string[]>(distances)
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
    if (selectedDistances.length > 0) params.set('distances', selectedDistances.join(','))
    if (selectedRegion) params.set('region', selectedRegion)

    router.push(`/?${params.toString()}`)
  }, [searchInput, selectedEventTypes, selectedDistances, selectedRegion, router])

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
      // Add multiple distances as separate params or comma-separated
      if (selectedDistances.length > 0) {
        params.set('distances', selectedDistances.join(','))
      }

      // Use search API if there's a query, otherwise use events API
      let response
      let allEvents: Event[] = []

      if (searchInput.trim()) {
        params.set('q', searchInput)
        response = await fetch(`/api/search?${params.toString()}`)
        const data = await response.json()
        // Convert search results to event format
        allEvents = data.results?.map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug || r.id,
          eventType: r.eventType,
          startDate: r.startDate,
          location: r.location,
          city: r.city,
          region: r.region,
          distances: r.distances || [],
        })) || []
      } else {
        response = await fetch(`/api/events?${params.toString()}`)
        const data = await response.json()
        allEvents = data.events || []
      }

      // Client-side filtering for multiple distances if needed
      if (selectedDistances.length > 0) {
        allEvents = allEvents.filter((event) => {
          if (!event.distances || !Array.isArray(event.distances)) return false
          // Check if event has any of the selected distances
          return selectedDistances.some((dist) =>
            event.distances.includes(dist)
          )
        })
      }

      setEvents(allEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [searchInput, selectedEventTypes, selectedRegion, selectedDistances])

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
    // Clear distances if event type changes
    setSelectedDistances([])
  }

  // Toggle distance
  const toggleDistance = (distance: string) => {
    setSelectedDistances((prev) =>
      prev.includes(distance) ? prev.filter((d) => d !== distance) : [...prev, distance]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('')
    setSelectedEventTypes([])
    setSelectedDistances([])
    setSelectedRegion('')
  }

  const hasActiveFilters =
    searchInput || selectedEventTypes.length > 0 || selectedDistances.length > 0 || selectedRegion

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent dark:from-primary dark:via-accent dark:to-secondary">
          Discover Events in New Zealand
        </h1>
        <p className="text-lg text-muted-foreground">
          Find running, cycling, and triathlon events across New Zealand
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for events..."
            className="w-full text-lg"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-lg">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => {
                    setSearchInput(suggestion)
                    setSuggestions([])
                  }}
                  className="w-full justify-start"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filters</CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-0 text-sm"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!filterOptions ? (
                /* Loading Skeleton */
                <>
                  <div>
                    <div className="mb-3 h-4 w-20 bg-muted animate-pulse rounded"></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 h-4 w-16 bg-muted animate-pulse rounded"></div>
                    <div className="h-9 w-full bg-muted animate-pulse rounded-md"></div>
                  </div>
                </>
              ) : (
                <>
                  {/* Event Type Filter */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Event Type</h3>
                    <div className="space-y-2">
                      {filterOptions.eventTypes.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedEventTypes.includes(type)}
                            onChange={() => toggleEventType(type)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm">
                            {formatEventType(type)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Distance Filter (shows when Running or Triathlon selected) */}
                  {distanceOptions.length > 0 && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium">Distance</h3>
                        {selectedDistances.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDistances([])}
                            className="h-auto p-0 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {distanceOptions.map((dist) => (
                          <label key={dist} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedDistances.includes(dist)}
                              onChange={() => toggleDistance(dist)}
                              className="h-4 w-4 rounded border-input"
                            />
                            <span className="text-sm">{dist}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location Filter */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Location</h3>
                    <Select
                      value={selectedRegion || undefined}
                      onValueChange={(value) => setSelectedRegion(value || '')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.regions.map((reg) => (
                          <SelectItem key={reg} value={reg}>
                            {reg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedRegion && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRegion('')}
                        className="mt-2 h-auto p-0 text-xs"
                      >
                        Clear location
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
                  <Card key={event.id} className="group overflow-hidden">
                    <Link href={`/events/${event.slug}`} className="block">
                      <CardHeader>
                        <div className="mb-2">
                          <Badge variant={getEventBadgeVariant(event.eventType)}>
                            {formatEventType(event.eventType)}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{event.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString('en-NZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {event.location}, {event.region}
                        </p>
                        {event.distances && Array.isArray(event.distances) && event.distances.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(event.distances as string[]).slice(0, 3).map((dist, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {dist}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
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
