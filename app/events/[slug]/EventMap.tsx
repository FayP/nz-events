"use client"

import { useMemo } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

interface EventMapProps {
  latitude: number
  longitude: number
  location: string
  city: string
  region: string
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
}

const defaultCenter = {
  lat: -41.2865, // Wellington, NZ (default)
  lng: 174.7762,
}

export default function EventMap({ latitude, longitude, location, city, region }: EventMapProps) {
  const center = useMemo(
    () => ({
      lat: latitude || defaultCenter.lat,
      lng: longitude || defaultCenter.lng,
    }),
    [latitude, longitude]
  )

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  }

  // Get Google Maps API key from environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Map unavailable. Google Maps API key not configured.
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
          </p>
        </div>
      </div>
    )
  }

  // If no valid coordinates, show message
  if (!latitude || !longitude) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Map location not available for this event.
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            {location}, {city}, {region}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          options={mapOptions}
        >
          <Marker
            position={center}
            title={`${location}, ${city}, ${region}`}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  )
}

