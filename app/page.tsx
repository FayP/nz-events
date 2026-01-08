"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getEventBadgeVariant, formatEventType } from '@/lib/utils'
import { Search, Calendar, MapPin, ArrowRight } from 'lucide-react'

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
  const [mounted, setMounted] = useState(false)

  // Local filter state - initialize with empty values to avoid hydration issues
  const [searchInput, setSearchInput] = useState('')
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedDistances, setSelectedDistances] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')

  // Sync state with URL params after mount (avoid hydration mismatch)
  useEffect(() => {
    setMounted(true)
    const searchQuery = searchParams.get('q') || ''
    const eventTypes = searchParams.get('eventTypes')?.split(',').filter(Boolean) || []
    const distances = searchParams.get('distances')?.split(',').filter(Boolean) || []
    const region = searchParams.get('region') || ''

    setSearchInput(searchQuery)
    setSelectedEventTypes(eventTypes)
    setSelectedDistances(distances)
    setSelectedRegion(region)
  }, [searchParams])

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8">
        <div className="mb-12">
          <h1 className="mb-3 text-5xl font-bold text-foreground tracking-tight">
            Discover Events
          </h1>
          <p className="text-lg text-muted-foreground">
            Running, cycling & triathlon events across New Zealand
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search events or locations..."
              className="h-14 pl-12 text-base bg-card border-border"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => {
                      setSearchInput(suggestion)
                      setSuggestions([])
                    }}
                    className="w-full justify-start text-foreground hover:bg-muted"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Horizontal Filter Chips */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Event Type Chips */}
            {filterOptions?.eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleEventType(type)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200 ease-in-out
                  ${
                    selectedEventTypes.includes(type)
                      ? getEventBadgeVariant(type) === 'running'
                        ? 'bg-[var(--event-running)] text-white shadow-md hover:shadow-lg'
                        : getEventBadgeVariant(type) === 'cycling'
                        ? 'bg-[var(--event-cycling)] text-white shadow-md hover:shadow-lg'
                        : getEventBadgeVariant(type) === 'triathlon'
                        ? 'bg-[var(--event-triathlon)] text-white shadow-md hover:shadow-lg'
                        : 'bg-primary text-white shadow-md hover:shadow-lg'
                      : 'bg-transparent border border-border text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-colors ${
                    getEventBadgeVariant(type) === 'running'
                      ? selectedEventTypes.includes(type) ? 'bg-white' : 'bg-[var(--event-running)]'
                      : getEventBadgeVariant(type) === 'cycling'
                      ? selectedEventTypes.includes(type) ? 'bg-white' : 'bg-[var(--event-cycling)]'
                      : getEventBadgeVariant(type) === 'triathlon'
                      ? selectedEventTypes.includes(type) ? 'bg-white' : 'bg-[var(--event-triathlon)]'
                      : 'bg-muted-foreground'
                  }`}
                />
                {formatEventType(type)}
              </button>
            ))}

            {/* Region Dropdown */}
            {filterOptions && (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedRegion || undefined}
                  onValueChange={(value) => setSelectedRegion(value)}
                >
                  <SelectTrigger className="w-[180px] h-10 bg-card border-border">
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
                    className="h-10 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                )}
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Distance Chips (when event type selected) */}
          {distanceOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 animate-slide-in">
              <span className="text-sm text-muted-foreground">Distances:</span>
              {distanceOptions.map((dist) => (
                <button
                  key={dist}
                  onClick={() => toggleDistance(dist)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-200 ease-in-out
                    ${
                      selectedDistances.includes(dist)
                        ? 'bg-secondary text-white shadow-md hover:shadow-lg'
                        : 'bg-transparent border border-border text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {dist}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Event Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${events.length} event${events.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-card border border-border p-6 animate-pulse">
                <div className="h-6 w-24 bg-muted rounded-full mb-4" />
                <div className="h-7 w-3/4 bg-muted rounded mb-4" />
                <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                <div className="h-4 w-2/3 bg-muted rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-6 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? 'No events found matching your filters. Try adjusting your search.'
                : 'No events found. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group rounded-xl bg-card border border-border p-6 transition-all duration-300 ease-in-out hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Event Type Badge */}
                <div className="mb-4">
                  <Badge variant={getEventBadgeVariant(event.eventType)} className="text-xs font-semibold">
                    {formatEventType(event.eventType).toUpperCase()}
                  </Badge>
                </div>

                {/* Event Title */}
                <h3 className="mb-3 text-xl font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight">
                  {event.name}
                </h3>

                {/* Date */}
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString('en-NZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Location */}
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}, {event.city}</span>
                </div>

                {/* Distances and Arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {event.distances && Array.isArray(event.distances) && event.distances.length > 0 && (
                      <>
                        {(event.distances as string[]).slice(0, 3).map((dist, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {dist}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
