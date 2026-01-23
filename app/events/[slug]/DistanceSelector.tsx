'use client'

import { useState } from 'react'
import { useEventColors } from '@/lib/hooks/use-event-colors'
import { DistanceDetail } from '@/types'

interface DistanceSelectorProps {
  distances?: DistanceDetail[]
  eventType: string
  onSelect?: (index: number) => void
}

export default function DistanceSelector({
  distances,
  eventType,
  onSelect,
}: DistanceSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const colors = useEventColors(eventType)

  if (!distances || distances.length === 0) {
    return null
  }

  // For triathlons, these are disciplines (not selectable options)
  // For running/cycling, these are distance options (selectable)
  const isTriathlon = eventType.toUpperCase() === 'TRIATHLON'
  const sectionTitle = isTriathlon ? 'Race Disciplines' : 'Distance Options'

  // Carousel settings
  const itemsPerPage = 3
  const totalPages = Math.ceil(distances.length / itemsPerPage)
  const showCarousel = distances.length > 3

  const handleSelect = (index: number) => {
    if (!isTriathlon) {
      setSelectedIndex(index)
      onSelect?.(index)
    }
  }

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const visibleDistances = showCarousel
    ? distances.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : distances

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {sectionTitle}
        </h2>

        {/* Carousel Navigation - Only on tablet/desktop when more than 3 items */}
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
      <div className="grid grid-cols-1 gap-5 md:hidden">
        {distances.map((distance, index) => {
          const isSelected = !isTriathlon && selectedIndex === index
          const isClickable = !isTriathlon

          return (
            <div
              key={index}
              onClick={() => handleSelect(index)}
              className={`
                relative overflow-hidden rounded-2xl p-7 transition-all duration-300
                border ${isClickable ? (isSelected ? 'border-opacity-100' : 'border-opacity-20 hover:border-opacity-40 cursor-pointer') : 'border-opacity-20'}
              `}
              style={{
                background: isSelected ? colors.bg : 'rgba(255, 255, 255, 0.02)',
                borderColor: isSelected ? colors.border : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Elevation visualization bar */}
              <div
                className="absolute top-0 left-0 right-0 transition-all duration-300"
                style={{
                  height: isSelected ? '4px' : '2px',
                  background: isSelected ? colors.gradient : 'rgba(255, 255, 255, 0.1)',
                }}
              />

              <div className="flex justify-between items-start mb-4">
                <div
                  className="font-outfit text-xl font-semibold transition-colors duration-300"
                  style={{ color: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}
                >
                  {distance.name}
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: colors.gradient }}
                  >
                    ✓
                  </div>
                )}
              </div>

              <div
                className="font-outfit text-5xl font-bold mb-3 transition-colors duration-300"
                style={{
                  color: isSelected ? colors.text : 'rgba(255, 255, 255, 0.4)',
                  letterSpacing: '-0.05em',
                }}
              >
              {distance.distance}
            </div>

            {/* Stats row */}
            <div className="flex gap-5 mb-4 pb-4 border-b border-white/5">
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wide mb-1">Elevation</div>
                <div className="text-sm text-white/70 font-medium">{distance.elevation}</div>
              </div>
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wide mb-1">Est. Time</div>
                <div className="text-sm text-white/70 font-medium">{distance.time}</div>
              </div>
            </div>

            <div className="text-sm text-white/40 leading-relaxed">{distance.description}</div>
          </div>
          )
        })}
      </div>

      {/* Tablet/Desktop: Show carousel with 3 items max */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleDistances.map((distance, visibleIndex) => {
          // Calculate the actual index in the full distances array
          const actualIndex = showCarousel ? currentPage * itemsPerPage + visibleIndex : visibleIndex
          const isSelected = !isTriathlon && selectedIndex === actualIndex
          const isClickable = !isTriathlon

          return (
            <div
              key={actualIndex}
              onClick={() => handleSelect(actualIndex)}
              className={`
                relative overflow-hidden rounded-2xl p-7 transition-all duration-300
                border ${isClickable ? (isSelected ? 'border-opacity-100' : 'border-opacity-20 hover:border-opacity-40 cursor-pointer') : 'border-opacity-20'}
              `}
              style={{
                background: isSelected ? colors.bg : 'rgba(255, 255, 255, 0.02)',
                borderColor: isSelected ? colors.border : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Elevation visualization bar */}
              <div
                className="absolute top-0 left-0 right-0 transition-all duration-300"
                style={{
                  height: isSelected ? '4px' : '2px',
                  background: isSelected ? colors.gradient : 'rgba(255, 255, 255, 0.1)',
                }}
              />

              <div className="flex justify-between items-start mb-4">
                <div
                  className="font-outfit text-xl font-semibold transition-colors duration-300"
                  style={{ color: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}
                >
                  {distance.name}
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: colors.gradient }}
                  >
                    ✓
                  </div>
                )}
              </div>

              <div
                className="font-outfit text-5xl font-bold mb-3 transition-colors duration-300"
                style={{
                  color: isSelected ? colors.text : 'rgba(255, 255, 255, 0.4)',
                  letterSpacing: '-0.05em',
                }}
              >
                {distance.distance}
              </div>

              {/* Stats row */}
              <div className="flex gap-5 mb-4 pb-4 border-b border-white/5">
                <div>
                  <div className="text-xs text-white/30 uppercase tracking-wide mb-1">Elevation</div>
                  <div className="text-sm text-white/70 font-medium">{distance.elevation}</div>
                </div>
                <div>
                  <div className="text-xs text-white/30 uppercase tracking-wide mb-1">Est. Time</div>
                  <div className="text-sm text-white/70 font-medium">{distance.time}</div>
                </div>
              </div>

              <div className="text-sm text-white/40 leading-relaxed">{distance.description}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
