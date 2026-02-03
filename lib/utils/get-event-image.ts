const FALLBACK_IMAGES: Record<string, string> = {
  RUNNING: "/images/fallback-running.jpg",
  BIKING: "/images/fallback-cycling.jpg",
  CYCLING: "/images/fallback-cycling.jpg",
  TRIATHLON: "/images/fallback-triathlon.jpg",
};

/**
 * Get the list of images for an event, falling back to a generic image
 * based on the event type if none are available.
 */
export function getEventImages(
  images: unknown,
  eventType: string
): string[] {
  if (Array.isArray(images) && images.length > 0) {
    return images.filter((img): img is string => typeof img === "string");
  }

  const fallback =
    FALLBACK_IMAGES[eventType.toUpperCase()] || FALLBACK_IMAGES.RUNNING;
  return [fallback];
}

/**
 * Get the primary (first) image for an event.
 */
export function getEventPrimaryImage(
  images: unknown,
  eventType: string
): string {
  return getEventImages(images, eventType)[0];
}
