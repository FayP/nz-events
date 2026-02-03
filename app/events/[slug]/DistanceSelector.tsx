'use client'

import { useState } from 'react'
import { useEventColors } from '@/lib/hooks/use-event-colors'
import { DistanceDetail } from '@/types'

interface DistanceSelectorProps {
  distances?: DistanceDetail[]
  eventType: string
  compact?: boolean
}

// Get icon and label for triathlon disciplines
const getTriathlonDiscipline = (name: string): { icon: string; label: string; color: string } => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('swim')) {
    return { icon: '🏊', label: 'SWIM', color: '#06b6d4' } // cyan
  }
  if (nameLower.includes('bike') || nameLower.includes('cycle')) {
    return { icon: '🚴', label: 'BIKE', color: '#10b981' } // emerald
  }
  if (nameLower.includes('run')) {
    return { icon: '🏃', label: 'RUN', color: '#f59e0b' } // amber
  }
  // Default
  return { icon: '🏅', label: name.toUpperCase(), color: '#10b981' }
}

// Get icon for running distances
const getRunningIcon = (name: string): string => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('ultra') || nameLower.includes('marathon')) return '🏃‍♂️'
  if (nameLower.includes('half')) return '🏃'
  if (nameLower.includes('trail')) return '🥾'
  if (nameLower.includes('kid') || nameLower.includes('fun')) return '👟'
  return '🏃'
}

// Get icon for cycling distances
const getCyclingIcon = (name: string): string => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('mountain') || nameLower.includes('mtb')) return '🚵'
  if (nameLower.includes('gravel')) return '🚵‍♂️'
  if (nameLower.includes('tour') || nameLower.includes('gran')) return '🚴‍♂️'
  return '🚴'
}

function getDistanceInfo(distance: DistanceDetail, eventType: string, colors: any) {
  const isTriathlon = eventType.toUpperCase() === 'TRIATHLON'
  const isRunning = eventType.toUpperCase() === 'RUNNING'
  const isCycling = eventType.toUpperCase() === 'BIKING' || eventType.toUpperCase() === 'CYCLING'

  if (isTriathlon) {
    const discipline = getTriathlonDiscipline(distance.name)
    return { icon: discipline.icon, label: discipline.label, accentColor: discipline.color }
  } else if (isRunning) {
    return { icon: getRunningIcon(distance.name), label: distance.name.toUpperCase(), accentColor: colors.text }
  } else if (isCycling) {
    return { icon: getCyclingIcon(distance.name), label: distance.name.toUpperCase(), accentColor: colors.text }
  }
  return { icon: '🏅', label: distance.name.toUpperCase(), accentColor: colors.text }
}

export default function DistanceSelector({
  distances,
  eventType,
  compact = false,
}: DistanceSelectorProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const colors = useEventColors(eventType)

  if (!distances || distances.length === 0) {
    return null
  }

  const isTriathlon = eventType.toUpperCase() === 'TRIATHLON'
  const sectionTitle = isTriathlon ? 'Race Disciplines' : 'Distance Options'

  // --- Compact mode: inline horizontal cards for the hero section ---
  if (compact) {
    return (
      <div className="flex flex-wrap gap-3">
        {distances.map((distance, index) => {
          const { icon, label, accentColor } = getDistanceInfo(distance, eventType, colors)
          return (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl"
            >
              <span className="text-xl">{icon}</span>
              <div>
                <div
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  {label}
                </div>
                <div className="font-outfit text-lg font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                  {distance.distance}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // --- Full mode: detailed cards with carousel ---
  const itemsPerPage = 3
  const totalPages = Math.ceil(distances.length / itemsPerPage)
  const showCarousel = distances.length > 3

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const visibleDistances = showCarousel
    ? distances.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : distances

  const renderCard = (distance: DistanceDetail, index: number) => {
    const { icon, label, accentColor } = getDistanceInfo(distance, eventType, colors)

    return (
      <div
        key={index}
        className="relative overflow-hidden rounded-2xl p-6 bg-white/[0.02] border border-white/[0.08] transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.12]"
      >
        {/* Accent bar at top */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: accentColor }}
        />

        {/* Icon */}
        <div className="text-3xl mb-4">{icon}</div>

        {/* Label */}
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: accentColor }}
        >
          {label}
        </div>

        {/* Distance */}
        <div
          className="font-outfit text-4xl font-bold text-white mb-3"
          style={{ letterSpacing: '-0.03em' }}
        >
          {distance.distance}
        </div>

        {/* Description */}
        <div className="text-sm text-white/50 leading-relaxed">
          {distance.description}
        </div>

        {/* Stats - show if available */}
        {(distance.elevation || distance.time) && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/[0.06]">
            {distance.elevation && (
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wide">Elevation</div>
                <div className="text-xs text-white/60 font-medium">{distance.elevation}</div>
              </div>
            )}
            {distance.time && (
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wide">Est. Time</div>
                <div className="text-xs text-white/60 font-medium">{distance.time}</div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">
          {sectionTitle}
        </h2>

        {/* Carousel Navigation */}
        {showCarousel && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={prevPage}
              className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center transition-all"
              aria-label="Previous page"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-white/40 min-w-[60px] text-center">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center transition-all"
              aria-label="Next page"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Mobile: Show all items stacked */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {distances.map((distance, index) => renderCard(distance, index))}
      </div>

      {/* Tablet/Desktop: Show grid with carousel if needed */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleDistances.map((distance, visibleIndex) => {
          const actualIndex = showCarousel ? currentPage * itemsPerPage + visibleIndex : visibleIndex
          return renderCard(distance, actualIndex)
        })}
      </div>
    </div>
  )
}
