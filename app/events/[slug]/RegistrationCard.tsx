'use client'

import { useEventColors } from '@/lib/hooks/use-event-colors'
import { DistanceDetail } from '@/types'
import { Button } from '@/components/ui/button'
import { Heart, Share2 } from 'lucide-react'

interface RegistrationCardProps {
  eventType: string
  selectedDistance?: DistanceDetail
  price?: string
  registrationUrl?: string
  capacity?: number
  taken?: number
  eventTitle: string
}

export default function RegistrationCard({
  eventType,
  selectedDistance,
  price = '$95',
  registrationUrl,
  capacity,
  taken,
  eventTitle,
}: RegistrationCardProps) {
  const colors = useEventColors(eventType)

  const spotsRemaining = capacity && taken !== undefined
    ? capacity - taken
    : undefined

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    }
  }

  return (
    <div className="sticky top-10">
      <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: colors.gradient }}
        />

        <h3 className="font-outfit text-xl font-semibold mb-2 text-white">Register Now</h3>

        {selectedDistance && (
          <p className="text-sm text-white/40 mb-6">
            {selectedDistance.name} · {selectedDistance.distance}
          </p>
        )}

        {/* Price Display */}
        <div
          className="p-6 rounded-2xl mb-6 text-center"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="text-sm text-white/50 mb-2">Entry Fee</div>
          <div
            className="font-outfit text-5xl font-bold"
            style={{ color: colors.text, letterSpacing: '-0.05em' }}
          >
            {price}
          </div>
          {spotsRemaining !== undefined && (
            <div className="text-xs text-white/40 mt-2">
              {spotsRemaining.toLocaleString()} spots remaining
            </div>
          )}
        </div>

        {/* Route Stats Summary */}
        {selectedDistance && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-white/[0.02] rounded-xl text-center">
              <div className="text-xs text-white/40 uppercase mb-1">Elevation</div>
              <div className="text-lg font-semibold text-white">{selectedDistance.elevation}</div>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-xl text-center">
              <div className="text-xs text-white/40 uppercase mb-1">Est. Time</div>
              <div className="text-lg font-semibold text-white">{selectedDistance.time}</div>
            </div>
          </div>
        )}

        {/* Register Button */}
        {registrationUrl ? (
          <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="block mb-4">
            <button
              className="w-full py-4 px-8 text-base font-semibold text-white rounded-xl transition-all duration-300 hover:shadow-2xl"
              style={{
                background: colors.gradient,
                boxShadow: `0 8px 32px ${colors.text}40`,
              }}
            >
              Register for {price}
            </button>
          </a>
        ) : (
          <button
            className="w-full py-4 px-8 text-base font-semibold bg-white/10 text-white/50 rounded-xl cursor-not-allowed mb-4"
            disabled
          >
            Registration Coming Soon
          </button>
        )}

        {/* Divider */}
        <div className="h-px bg-white/[0.06] my-5" />

        {/* Share / Save */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white"
          >
            <Heart className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
