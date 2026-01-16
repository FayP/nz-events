import { useMemo } from 'react'

export interface EventColors {
  bg: string
  text: string
  border: string
  gradient: string
}

export function useEventColors(eventType: string): EventColors {
  return useMemo(() => {
    const type = eventType?.toUpperCase()

    switch (type) {
      case 'RUNNING':
        return {
          bg: 'rgba(249, 115, 22, 0.15)',
          text: 'var(--event-running)',
          border: 'rgba(249, 115, 22, 0.3)',
          gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        }
      case 'BIKING':
      case 'CYCLING':
        return {
          bg: 'rgba(139, 92, 246, 0.15)',
          text: 'var(--event-cycling)',
          border: 'rgba(139, 92, 246, 0.3)',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        }
      case 'TRIATHLON':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          text: 'var(--event-triathlon)',
          border: 'rgba(16, 185, 129, 0.3)',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        }
      default:
        return {
          bg: 'rgba(100, 100, 100, 0.15)',
          text: 'var(--event-other)',
          border: 'rgba(100, 100, 100, 0.3)',
          gradient: 'linear-gradient(135deg, #666666 0%, #555555 100%)',
        }
    }
  }, [eventType])
}
