import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the badge variant based on event type
 * Maps event types to their themed colors
 */
export function getEventBadgeVariant(eventType: string): "running" | "cycling" | "triathlon" | "default" {
  const type = eventType.toUpperCase()

  switch (type) {
    case 'RUNNING':
      return 'running'
    case 'BIKING':
    case 'CYCLING':
      return 'cycling'
    case 'TRIATHLON':
      return 'triathlon'
    default:
      return 'default'
  }
}

/**
 * Format event type for display
 */
export function formatEventType(eventType: string): string {
  const type = eventType.toUpperCase()

  switch (type) {
    case 'BIKING':
      return 'Cycling'
    case 'RUNNING':
      return 'Running'
    case 'TRIATHLON':
      return 'Triathlon'
    default:
      return eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase()
  }
}
