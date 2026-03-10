'use client'

import { useEventColors } from '@/lib/hooks/use-event-colors'
import { ExternalLink, Check, Share2, Clock, Users } from 'lucide-react'

interface PriceInfo {
  min?: number
  max?: number
  currency?: string
  note?: string
  tiers?: PriceTier[]
}

interface PriceTier {
  category: string
  price: string
}

interface RegistrationCardProps {
  eventType: string
  eventTitle: string
  registrationUrl?: string
  website?: string
  price?: PriceInfo | PriceTier[] | null
  capacity?: number
  taken?: number
  registrationCloseDate?: string
  inclusions?: string[] // Real inclusions data from the event
}

const isPriceTierArray = (price: unknown): price is PriceTier[] => {
  return (
    Array.isArray(price) &&
    price.length > 0 &&
    price.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        'category' in item &&
        'price' in item
    )
  )
}

const formatPrice = (price: PriceInfo | PriceTier[] | null | undefined): string => {
  if (!price) return 'See website'
  if (isPriceTierArray(price)) return 'See pricing tiers'

  const currency = price.currency === 'NZD' ? '$' : (price.currency || '$')

  if (price.min && price.max && price.min !== price.max) {
    return `${currency}${price.min} - ${currency}${price.max}`
  }

  if (price.min) {
    return `From ${currency}${price.min}`
  }

  if (price.note) {
    return price.note
  }

  return 'See website'
}

export default function RegistrationCard({
  eventType,
  eventTitle,
  registrationUrl,
  website,
  price,
  capacity,
  taken,
  registrationCloseDate,
  inclusions,
}: RegistrationCardProps) {
  const colors = useEventColors(eventType)

  const linkUrl = registrationUrl || website
  const hasLink = !!linkUrl

  const spotsRemaining = capacity && taken !== undefined
    ? capacity - taken
    : undefined

  const priceDisplay = formatPrice(price)
  const priceTiers = isPriceTierArray(price)
    ? price
    : Array.isArray(price?.tiers)
      ? price.tiers
      : []
  const flatPrice = !isPriceTierArray(price) ? price : undefined
  const hasPrice = isPriceTierArray(price)
    ? price.length > 0
    : !!(price && (price.min || price.max || price.note))

  // Only show inclusions if we have real data
  const hasInclusions = inclusions && inclusions.length > 0

  // Check if registration is closing soon (within 14 days)
  const isClosingSoon = registrationCloseDate &&
    new Date(registrationCloseDate).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000 &&
    new Date(registrationCloseDate).getTime() > Date.now()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          url: window.location.href,
        })
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-3xl">
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: colors.gradient }}
      />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="font-outfit text-xl font-semibold text-white mb-1">
            Registration
          </h3>
          <p className="text-sm text-white/40">
            Register on the official event website
          </p>
        </div>

        {/* Price Display */}
        <div
          className="p-5 rounded-2xl mb-6"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wide mb-1">
                Entry Fee
              </div>
              <div
                className="font-outfit text-3xl sm:text-4xl font-bold"
                style={{ color: colors.text, letterSpacing: '-0.03em' }}
              >
                {priceDisplay}
              </div>
              {flatPrice?.note && hasPrice && flatPrice.note !== priceDisplay && (
                <div className="text-xs text-white/40 mt-1">{flatPrice.note}</div>
              )}
            </div>

            {/* Urgency indicators */}
            <div className="text-right">
              {spotsRemaining !== undefined && spotsRemaining < 100 && (
                <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{spotsRemaining} spots left</span>
                </div>
              )}
              {isClosingSoon && (
                <div className="flex items-center gap-1.5 text-amber-400 text-sm mt-1">
                  <Clock className="h-4 w-4" />
                  <span>Closing soon</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tiered pricing details */}
        {priceTiers.length > 0 && (
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/50">
              Pricing Tiers
            </h4>
            <ul className="space-y-2">
              {priceTiers.slice(0, 6).map((tier, index) => (
                <li key={index} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-white/65">{tier.category}</span>
                  <span className="font-medium text-white">{tier.price}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Register Button */}
        {hasLink ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-6"
          >
            <button
              className="w-full py-4 px-6 text-base font-semibold text-white rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-2"
              style={{
                background: colors.gradient,
                boxShadow: `0 8px 32px ${colors.text}30`,
              }}
            >
              Register on Official Site
              <ExternalLink className="h-4 w-4" />
            </button>
          </a>
        ) : (
          <button
            className="w-full py-4 px-6 text-base font-semibold bg-white/10 text-white/50 rounded-xl cursor-not-allowed mb-6"
            disabled
          >
            Registration Link Coming Soon
          </button>
        )}

        {/* What's Included - Only show if we have real data */}
        {hasInclusions && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wide">
              Entry Includes
            </h4>
            <ul className="space-y-2.5">
              {inclusions.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${colors.text}20` }}
                  >
                    <Check className="h-3 w-3" style={{ color: colors.text }} />
                  </div>
                  <span className="text-sm text-white/70">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/30 mt-3">
              Inclusions may vary. Check official website for current details.
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-white/[0.06] my-5" />

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full py-3 px-4 text-sm font-medium bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share This Event
        </button>
      </div>
    </div>
  )
}
