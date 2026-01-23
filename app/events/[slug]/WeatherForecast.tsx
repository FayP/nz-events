'use client'

import { useEffect, useState } from 'react'
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react'

interface WeatherForecastProps {
  latitude?: number
  longitude?: number
  eventDate: string
  eventType: string
}

interface WeatherData {
  available: boolean
  daysUntilEvent?: number
  message?: string
  forecast?: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    description: string
    icon: string
    main: string
    precipitation: number
  }
  location?: string
}

const weatherIcons: Record<string, string> = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
}

export default function WeatherForecast({
  latitude,
  longitude,
  eventDate,
  eventType,
}: WeatherForecastProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!latitude || !longitude) {
      setLoading(false)
      return
    }

    const fetchWeather = async () => {
      try {
        const params = new URLSearchParams({
          lat: latitude.toString(),
          lng: longitude.toString(),
          date: eventDate,
        })

        const response = await fetch(`/api/weather?${params.toString()}`)
        const data = await response.json()

        if (data.error && response.status !== 200) {
          setError(data.error)
        } else {
          setWeather(data)
        }
      } catch (err) {
        setError('Unable to load weather')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [latitude, longitude, eventDate])

  if (!latitude || !longitude) {
    return null
  }

  if (loading) {
    return (
      <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-3" />
        <div className="h-8 w-20 bg-white/10 rounded" />
      </div>
    )
  }

  if (error || !weather) {
    return null
  }

  if (!weather.available) {
    return (
      <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Cloud className="w-4 h-4" />
          <span>Weather forecast available {weather.daysUntilEvent ? `in ${weather.daysUntilEvent - 14} days` : 'closer to event'}</span>
        </div>
      </div>
    )
  }

  const forecast = weather.forecast!
  const icon = weatherIcons[forecast.main] || '🌤️'

  // Determine if conditions are good for the event type
  const getConditionColor = () => {
    if (forecast.precipitation > 50 || forecast.windSpeed > 30) return 'text-orange-400'
    if (forecast.temperature < 5 || forecast.temperature > 30) return 'text-orange-400'
    return 'text-emerald-400'
  }

  return (
    <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Race Day Forecast</span>
        {weather.daysUntilEvent !== undefined && weather.daysUntilEvent <= 5 && (
          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
            {weather.daysUntilEvent === 0 ? 'Today' : weather.daysUntilEvent === 1 ? 'Tomorrow' : `${weather.daysUntilEvent} days`}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{icon}</span>
            <div>
              <div className="text-3xl font-outfit font-semibold text-white">
                {forecast.temperature}°C
              </div>
              <div className="text-xs text-white/40">
                Feels like {forecast.feelsLike}°C
              </div>
            </div>
          </div>
          <div className={`text-sm capitalize ${getConditionColor()}`}>
            {forecast.description}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <Wind className="w-4 h-4" />
            <span>{forecast.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Droplets className="w-4 h-4" />
            <span>{forecast.humidity}%</span>
          </div>
          {forecast.precipitation > 0 && (
            <div className="flex items-center gap-2 text-white/60">
              <span className="text-base">🌧️</span>
              <span>{forecast.precipitation}% rain</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.05] text-[10px] text-white/30">
        Forecast for {weather.location} · Updates daily
      </div>
    </div>
  )
}
