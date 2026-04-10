import { NextResponse } from 'next/server'

/**
 * Validates the API key from the Authorization header.
 * Returns null if valid, or a 401 NextResponse if invalid.
 *
 * Usage:
 *   const authError = requireApiKey(request)
 *   if (authError) return authError
 */
export function requireApiKey(request: Request): NextResponse | null {
  const apiKey = process.env.API_SECRET_KEY
  if (!apiKey) {
    console.error('API_SECRET_KEY is not configured')
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return null
}
