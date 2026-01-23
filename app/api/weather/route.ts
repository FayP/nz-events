import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const date = searchParams.get('date')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Weather service not configured' }, { status: 503 })
  }

  try {
    // Check if event date is within forecast range (16 days for free tier)
    const eventDate = date ? new Date(date) : new Date()
    const now = new Date()
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilEvent < 0) {
      return NextResponse.json({ error: 'Event has passed', available: false }, { status: 200 })
    }

    if (daysUntilEvent > 14) {
      return NextResponse.json({
        available: false,
        daysUntilEvent,
        message: 'Forecast available closer to event date',
      })
    }

    // Fetch forecast from OpenWeatherMap
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Weather API error')
    }

    const data = await response.json()

    // Find forecast closest to event date
    const eventTimestamp = eventDate.getTime()
    let closestForecast = data.list[0]
    let closestDiff = Math.abs(new Date(closestForecast.dt * 1000).getTime() - eventTimestamp)

    for (const forecast of data.list) {
      const forecastTime = new Date(forecast.dt * 1000).getTime()
      const diff = Math.abs(forecastTime - eventTimestamp)
      if (diff < closestDiff) {
        closestDiff = diff
        closestForecast = forecast
      }
    }

    // Format the response
    const weather = {
      available: true,
      daysUntilEvent,
      forecast: {
        temperature: Math.round(closestForecast.main.temp),
        feelsLike: Math.round(closestForecast.main.feels_like),
        humidity: closestForecast.main.humidity,
        windSpeed: Math.round(closestForecast.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: closestForecast.wind.deg,
        description: closestForecast.weather[0].description,
        icon: closestForecast.weather[0].icon,
        main: closestForecast.weather[0].main,
        precipitation: closestForecast.pop ? Math.round(closestForecast.pop * 100) : 0,
      },
      forecastTime: new Date(closestForecast.dt * 1000).toISOString(),
      location: data.city.name,
    }

    return NextResponse.json(weather)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather', available: false }, { status: 500 })
  }
}
