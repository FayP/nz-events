"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  slug: string
  eventType: string
  startDate: string
  location: string
  city: string
  region: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?status=PUBLISHED&limit=50')
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading events...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-black dark:text-zinc-50">
        All Events
      </h1>

      {events.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            No events found. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-2">
                <span className="rounded bg-black px-2 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                  {event.eventType}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

