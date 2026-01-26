interface EventJsonLdProps {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  city: string;
  region: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  url?: string;
  organizer?: {
    name: string;
    website?: string;
  };
  eventType: string;
  price?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  registrationUrl?: string;
}

export function EventJsonLd({
  name,
  description,
  startDate,
  endDate,
  location,
  city,
  region,
  address,
  latitude,
  longitude,
  url,
  organizer,
  eventType,
  price,
  registrationUrl,
}: EventJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gostride.co.nz";

  // Map event type to schema.org type
  const getEventSchemaType = (type: string) => {
    const typeUpper = type.toUpperCase();
    if (typeUpper === "RUNNING") return "SportsEvent";
    if (typeUpper === "BIKING" || typeUpper === "CYCLING") return "SportsEvent";
    if (typeUpper === "TRIATHLON") return "SportsEvent";
    return "SportsEvent";
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": getEventSchemaType(eventType),
    name,
    description: description || `${name} - a ${eventType.toLowerCase()} event in ${city}, New Zealand`,
    startDate,
    endDate: endDate || startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
        streetAddress: address || location,
        addressLocality: city,
        addressRegion: region,
        addressCountry: "NZ",
      },
      ...(latitude && longitude
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude,
              longitude,
            },
          }
        : {}),
    },
    ...(organizer
      ? {
          organizer: {
            "@type": "Organization",
            name: organizer.name,
            ...(organizer.website ? { url: organizer.website } : {}),
          },
        }
      : {}),
    ...(price?.min !== undefined
      ? {
          offers: {
            "@type": "Offer",
            price: price.min,
            priceCurrency: price.currency || "NZD",
            availability: "https://schema.org/InStock",
            validFrom: new Date().toISOString(),
            ...(registrationUrl ? { url: registrationUrl } : {}),
          },
        }
      : {}),
    ...(url ? { url } : {}),
    image: `${baseUrl}/opengraph-image`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
