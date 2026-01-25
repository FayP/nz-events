/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Free, no API key required, but rate limited (1 request per second)
 */

export interface GeocodingResult {
  latitude: number
  longitude: number
  displayName: string
}

// Rate limiting: track last request time
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1100 // 1.1 seconds between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }

  lastRequestTime = Date.now()
  return fetch(url)
}

/**
 * Geocode a location string to coordinates
 * @param location - The location to geocode (e.g., "Auckland, New Zealand")
 * @returns The geocoding result with lat/lng, or null if not found
 */
export async function geocodeLocation(location: string): Promise<GeocodingResult | null> {
  try {
    // Add "New Zealand" if not already present to improve accuracy
    const searchQuery = location.toLowerCase().includes('new zealand')
      ? location
      : `${location}, New Zealand`

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', searchQuery)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycodes', 'nz')

    const response = await rateLimitedFetch(url.toString())

    if (!response.ok) {
      console.error(`Geocoding error: ${response.status} ${response.statusText}`)
      return null
    }

    const results = await response.json()

    if (!results || results.length === 0) {
      console.log(`No geocoding results for: ${location}`)
      return null
    }

    const result = results[0]
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    }
  } catch (error) {
    console.error(`Error geocoding "${location}":`, error)
    return null
  }
}

/**
 * Geocode a city and region combination
 * @param city - The city name
 * @param region - The region name
 * @returns The geocoding result with lat/lng, or null if not found
 */
export async function geocodeCityRegion(city: string, region: string): Promise<GeocodingResult | null> {
  // Try city + region first
  let result = await geocodeLocation(`${city}, ${region}`)

  // If not found, try just the city
  if (!result) {
    result = await geocodeLocation(city)
  }

  return result
}

/**
 * Get approximate coordinates for common NZ locations
 * Fallback for when API fails or for offline testing
 */
export function getKnownLocationCoordinates(location: string): GeocodingResult | null {
  const normalizedLocation = location.toLowerCase()

  const knownLocations: Record<string, GeocodingResult> = {
    'auckland': { latitude: -36.8485, longitude: 174.7633, displayName: 'Auckland, New Zealand' },
    'wellington': { latitude: -41.2865, longitude: 174.7762, displayName: 'Wellington, New Zealand' },
    'christchurch': { latitude: -43.5321, longitude: 172.6362, displayName: 'Christchurch, New Zealand' },
    'hamilton': { latitude: -37.7870, longitude: 175.2793, displayName: 'Hamilton, New Zealand' },
    'tauranga': { latitude: -37.6878, longitude: 176.1651, displayName: 'Tauranga, New Zealand' },
    'dunedin': { latitude: -45.8788, longitude: 170.5028, displayName: 'Dunedin, New Zealand' },
    'queenstown': { latitude: -45.0312, longitude: 168.6626, displayName: 'Queenstown, New Zealand' },
    'napier': { latitude: -39.4928, longitude: 176.9120, displayName: 'Napier, New Zealand' },
    'nelson': { latitude: -41.2706, longitude: 173.2840, displayName: 'Nelson, New Zealand' },
    'rotorua': { latitude: -38.1368, longitude: 176.2497, displayName: 'Rotorua, New Zealand' },
    'palmerston north': { latitude: -40.3523, longitude: 175.6082, displayName: 'Palmerston North, New Zealand' },
    'new plymouth': { latitude: -39.0556, longitude: 174.0752, displayName: 'New Plymouth, New Zealand' },
    'whangarei': { latitude: -35.7275, longitude: 174.3166, displayName: 'Whangarei, New Zealand' },
    'invercargill': { latitude: -46.4132, longitude: 168.3538, displayName: 'Invercargill, New Zealand' },
    'wanaka': { latitude: -44.7000, longitude: 169.1500, displayName: 'Wanaka, New Zealand' },
    'taupo': { latitude: -38.6857, longitude: 176.0702, displayName: 'Taupo, New Zealand' },
    'gisborne': { latitude: -38.6623, longitude: 178.0176, displayName: 'Gisborne, New Zealand' },
    'blenheim': { latitude: -41.5138, longitude: 173.9617, displayName: 'Blenheim, New Zealand' },
    'timaru': { latitude: -44.3904, longitude: 171.2373, displayName: 'Timaru, New Zealand' },
    'oamaru': { latitude: -45.0966, longitude: 170.9714, displayName: 'Oamaru, New Zealand' },
  }

  for (const [key, coords] of Object.entries(knownLocations)) {
    if (normalizedLocation.includes(key)) {
      return coords
    }
  }

  return null
}

/**
 * Smart geocoding that tries multiple strategies
 * 1. First checks known locations for quick response
 * 2. Then tries the Nominatim API
 */
export async function smartGeocode(location: string, city?: string, region?: string): Promise<GeocodingResult | null> {
  // Try known locations first (fast, offline-capable)
  const known = getKnownLocationCoordinates(city || location)
  if (known) {
    return known
  }

  // Try city + region
  if (city && region) {
    const result = await geocodeCityRegion(city, region)
    if (result) return result
  }

  // Try full location string
  if (location) {
    const result = await geocodeLocation(location)
    if (result) return result
  }

  return null
}
