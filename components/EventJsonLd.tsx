interface EventJsonLdProps {
  name: string;
  slug?: string;
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
  image?: string;
}

export function EventJsonLd({
  name,
  slug,
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
  image,
}: EventJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gostride.co.nz";

  // Map event type to sport name
  const getSportName = (type: string) => {
    const typeUpper = type.toUpperCase();
    if (typeUpper === "RUNNING") return "Running";
    if (typeUpper === "BIKING" || typeUpper === "CYCLING") return "Cycling";
    if (typeUpper === "TRIATHLON") return "Triathlon";
    return "Running";
  };

  // Build canonical URL for the event page
  const eventPageUrl = slug ? `${baseUrl}/events/${slug}` : undefined;

  // Build offers object - use AggregateOffer when we have min/max range
  const buildOffers = () => {
    if (price?.min === undefined) return undefined;

    const hasRange = price.max !== undefined && price.max !== price.min;

    if (hasRange) {
      return {
        "@type": "AggregateOffer",
        lowPrice: price.min,
        highPrice: price.max,
        priceCurrency: price.currency || "NZD",
        availability: "https://schema.org/InStock",
        ...(registrationUrl ? { url: registrationUrl } : {}),
      };
    }

    return {
      "@type": "Offer",
      price: price.min,
      priceCurrency: price.currency || "NZD",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
      ...(registrationUrl ? { url: registrationUrl } : {}),
    };
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name,
    description: description || `${name} - a ${eventType.toLowerCase()} event in ${city}, New Zealand`,
    startDate,
    endDate: endDate || startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: getSportName(eventType),
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
    ...(() => {
      const offers = buildOffers();
      return offers ? { offers } : {};
    })(),
    ...(eventPageUrl ? { url: eventPageUrl } : {}),
    ...(url ? { sameAs: url } : {}),
    image: image || `${baseUrl}/images/fallback-running.jpg`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
