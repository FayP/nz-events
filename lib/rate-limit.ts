import { NextResponse } from 'next/server'

/**
 * Simple in-memory rate limiter using a sliding window.
 *
 * Note: On Vercel serverless, each instance has its own memory, so this
 * won't share state across instances. It still catches the most common
 * abuse patterns (rapid-fire from a single client hitting the same instance).
 * For stricter enforcement, upgrade to Vercel KV or Upstash Redis.
 */

interface RateLimitEntry {
  timestamps: number[]
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

interface RateLimitConfig {
  /** Unique identifier for this limiter (e.g. 'contact', 'newsletter') */
  id: string
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Window size in seconds */
  windowSeconds: number
}

function getStore(id: string): Map<string, RateLimitEntry> {
  if (!stores.has(id)) {
    stores.set(id, new Map())
  }
  return stores.get(id)!
}

/**
 * Check rate limit for a given request.
 * Returns null if allowed, or a 429 NextResponse if rate limited.
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): NextResponse | null {
  const store = getStore(config.id)
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000

  // Use IP as the key — x-forwarded-for on Vercel, fall back to x-real-ip
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const entry = store.get(ip) || { timestamps: [] }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)

  if (entry.timestamps.length >= config.limit) {
    const retryAfter = Math.ceil(
      (entry.timestamps[0] + windowMs - now) / 1000
    )
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  entry.timestamps.push(now)
  store.set(ip, entry)

  // Periodic cleanup: remove stale IPs every ~100 checks
  if (Math.random() < 0.01) {
    for (const [key, val] of store.entries()) {
      const fresh = val.timestamps.filter((t) => now - t < windowMs)
      if (fresh.length === 0) store.delete(key)
    }
  }

  return null
}
