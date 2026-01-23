'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import EventMap from './EventMap'
import { urlFor } from '@/lib/cms'
import { useEventColors } from '@/lib/hooks/use-event-colors'

interface EventContentProps {
  event: any
  eventType: string
}

// Tabs Component
function TabsSection({
  activeTab,
  onTabChange,
  tabs,
  colors,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: string[]
  colors: any
}) {
  return (
    <div className="border-b border-white/[0.06] mb-8 pb-0.5">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: colors.text }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Helper to render portable text (Sanity's rich text format)
function PortableText({ blocks }: { blocks: any[] }) {
  if (!blocks || !Array.isArray(blocks)) return null

  return (
    <div className="prose prose-invert max-w-none text-white/60">
      {blocks.map((block, i) => {
        if (block._type === 'block') {
          const style = block.style || 'normal'
          const children = block.children?.map((child: any, j: number) => {
            if (child._type === 'span') {
              return <span key={j}>{child.text}</span>
            }
            return null
          })

          switch (style) {
            case 'h2':
              return (
                <h2 key={i} className="text-white">
                  {children}
                </h2>
              )
            case 'h3':
              return (
                <h3 key={i} className="text-white">
                  {children}
                </h3>
              )
            case 'blockquote':
              return <blockquote key={i}>{children}</blockquote>
            default:
              return <p key={i}>{children}</p>
          }
        }
        if (block._type === 'image' && block.asset) {
          const imageUrl = urlFor(block)?.url()
          return imageUrl ? (
            <Image
              key={i}
              src={imageUrl}
              alt={block.alt || ''}
              width={800}
              height={600}
              className="rounded-lg my-8"
            />
          ) : null
        }
        return null
      })}
    </div>
  )
}

export default function EventContent({ event, eventType }: EventContentProps) {
  const colors = useEventColors(eventType)

  // Build tabs array dynamically
  const tabs = ['Overview']
  if (event.highlights && event.highlights.length > 0) {
    tabs.push('Highlights')
  }
  if (event.requirements && event.requirements.length > 0) {
    tabs.push('Requirements')
  }

  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <>
      <TabsSection activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} colors={colors} />

      {activeTab === 'Overview' && (
        <div className="space-y-8">
          {/* Description */}
          {event.description && event.description.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-outfit font-semibold text-white">About This Event</h2>
              <PortableText blocks={event.description} />
            </div>
          )}

          {/* Highlights inline in Overview */}
          {event.highlights && event.highlights.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-outfit font-semibold text-white">Event Highlights</h3>
              <div className="flex flex-col gap-3">
                {event.highlights.map((highlight: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-white/60 text-base">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                      style={{
                        background: colors.bg,
                        color: colors.text,
                      }}
                    >
                      ✓
                    </span>
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Map */}
          {event.courseMap && urlFor(event.courseMap)?.url() && (
            <div>
              <h2 className="mb-4 text-2xl font-outfit font-semibold text-white">Course Map</h2>
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                <Image
                  src={urlFor(event.courseMap)?.url() || ''}
                  alt="Course Map"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Location & Map Section */}
          {event.eventDetails?.coordinates?.lat && event.eventDetails?.coordinates?.lng && (
            <div>
              <h2 className="mb-4 text-2xl font-outfit font-semibold text-white">Location</h2>
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                <EventMap
                  latitude={event.eventDetails.coordinates.lat}
                  longitude={event.eventDetails.coordinates.lng}
                  location={event.eventDetails.location}
                  city={event.eventDetails.city}
                  region={event.eventDetails.region}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Highlights' && (
        <div>
          {event.highlights && event.highlights.length > 0 ? (
            <ul className="space-y-3">
              {event.highlights.map((highlight: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-white/60 text-base leading-relaxed">
                  <span className="mt-1 text-lg" style={{ color: colors.text }}>
                    ✓
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/40">Event highlights coming soon.</p>
          )}
        </div>
      )}

      {activeTab === 'Requirements' && (
        <div>
          {event.requirements && event.requirements.length > 0 ? (
            <div>
              <h2 className="mb-6 text-2xl font-outfit font-semibold text-white">Equipment Requirements</h2>
              <div className="flex flex-col gap-4">
                {event.requirements.map((req: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                    >
                      🚴
                    </span>
                    <span className="text-base text-white/70">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/40">No specific equipment requirements listed.</p>
          )}
        </div>
      )}
    </>
  )
}

