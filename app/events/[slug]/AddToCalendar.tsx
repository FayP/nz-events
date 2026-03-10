'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

interface AddToCalendarProps {
  eventName: string
  startDate: string
  endDate?: string
  location: string
  city: string
  region: string
  description?: string
  url?: string
}

export default function AddToCalendar({
  eventName,
  startDate,
  endDate,
  location,
  city,
  region,
  description,
  url,
}: AddToCalendarProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const isLikelyDateOnly = (dateStr: string) => {
    const isoTime = new Date(dateStr).toISOString().slice(11, 16)
    return isoTime === '00:00' || isoTime === '12:00'
  }

  const getNZDateKey = (dateStr: string, addDays = 0) => {
    const date = new Date(dateStr)
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date)

    const year = Number(parts.find((p) => p.type === 'year')?.value)
    const month = Number(parts.find((p) => p.type === 'month')?.value)
    const day = Number(parts.find((p) => p.type === 'day')?.value)

    const utcDate = new Date(Date.UTC(year, month - 1, day + addDays))
    const y = utcDate.getUTCFullYear().toString()
    const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
    const d = String(utcDate.getUTCDate()).padStart(2, '0')
    return `${y}${m}${d}`
  }

  const formatDateForICS = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const formatDateForGoogle = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const fullLocation = `${location}, ${city}, ${region}, New Zealand`
  const eventDescription = description
    ? `${description}${url ? `\n\nMore info: ${url}` : ''}`
    : url ? `More info: ${url}` : ''

  const generateICSFile = () => {
    const dateOnly = isLikelyDateOnly(startDate)
    const start = dateOnly ? getNZDateKey(startDate) : formatDateForICS(startDate)
    const end = dateOnly
      ? getNZDateKey(endDate || startDate, 1)
      : endDate
        ? formatDateForICS(endDate)
        : formatDateForICS(new Date(new Date(startDate).getTime() + 8 * 60 * 60 * 1000).toISOString())

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GoStride//Event Calendar//EN',
      'BEGIN:VEVENT',
      dateOnly ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
      dateOnly ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
      `SUMMARY:${eventName}`,
      `LOCATION:${fullLocation}`,
      `DESCRIPTION:${eventDescription.replace(/\n/g, '\\n')}`,
      `URL:${url || ''}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowDropdown(false)
  }

  const openGoogleCalendar = () => {
    const dateOnly = isLikelyDateOnly(startDate)
    const start = dateOnly ? getNZDateKey(startDate) : formatDateForGoogle(startDate)
    const end = dateOnly
      ? getNZDateKey(endDate || startDate, 1)
      : endDate
        ? formatDateForGoogle(endDate)
        : formatDateForGoogle(new Date(new Date(startDate).getTime() + 8 * 60 * 60 * 1000).toISOString())

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventName,
      dates: `${start}/${end}`,
      location: fullLocation,
      details: eventDescription,
    })

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank')
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all"
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1c] border border-white/[0.1] rounded-xl shadow-xl z-50 overflow-hidden">
            <button
              onClick={openGoogleCalendar}
              className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/[0.05] hover:text-white transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25z"/>
              </svg>
              Google Calendar
            </button>
            <button
              onClick={generateICSFile}
              className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/[0.05] hover:text-white transition-colors flex items-center gap-3 border-t border-white/[0.05]"
            >
              <Calendar className="w-4 h-4" />
              Download .ics
            </button>
          </div>
        </>
      )}
    </div>
  )
}
