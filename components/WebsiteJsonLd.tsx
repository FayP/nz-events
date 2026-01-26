export function WebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gostride.co.nz";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GoStride",
    description:
      "Discover running, cycling, and triathlon events across New Zealand. Find your next finish line with GoStride.",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GoStride",
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    description:
      "New Zealand's event discovery platform for runners, cyclists, and triathletes.",
    areaServed: {
      "@type": "Country",
      name: "New Zealand",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}
