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
  const colors = useEventColors(eventType)

  if (!distances || distances.length === 0) {
    return null
  }

  // For triathlons, these are disciplines (not selectable options)
  // For running/cycling, these are distance options (selectable)
  const isTriathlon = eventType.toUpperCase() === 'TRIATHLON'
  const sectionTitle = isTriathlon ? 'Race Disciplines' : 'Distance Options'

  const handleSelect = (index: number) => {
    if (!isTriathlon) {
      setSelectedIndex(index)
      onSelect?.(index)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
        {sectionTitle}
      </h2>
      <div className={`grid gap-5 ${distances.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
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
    </div>
  )
}
