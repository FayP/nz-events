// Sanity CMS client
// Alternative: Use Contentful or other CMS

import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

if (!process.env.SANITY_PROJECT_ID || !process.env.SANITY_DATASET) {
  console.warn(
    "Sanity CMS not configured. Set SANITY_PROJECT_ID and SANITY_DATASET"
  );
}

// Read-only client (for public website)
export const sanityClient = process.env.SANITY_PROJECT_ID
  ? createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET || "production",
      useCdn: true,
      apiVersion: "2024-01-01",
    })
  : null;

// Write client (for scripts, requires token)
export const sanityWriteClient = process.env.SANITY_PROJECT_ID && process.env.SANITY_API_TOKEN
  ? createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET || "production",
      useCdn: false,
      apiVersion: "2024-01-01",
      token: process.env.SANITY_API_TOKEN,
    })
  : null;

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export function urlFor(source: any) {
  return builder ? builder.image(source) : null;
}

// Fetch event content from CMS by eventId
export async function getEventContent(eventId: string) {
  if (!sanityClient) return null;

  const query = `*[_type == "event" && eventId == $eventId][0]`;
  return await sanityClient.fetch(query, { eventId });
}

// Fetch event content from CMS by slug
export async function getEventBySlug(slug: string) {
  if (!sanityClient) return null;

  const query = `*[_type == "event" && slug.current == $slug][0]{
    ...,
    heroImage {
      ...,
      asset->{
        _id,
        url
      }
    },
    gallery[] {
      ...,
      asset->{
        _id,
        url
      }
    }
  }`;
  return await sanityClient.fetch(query, { slug });
}

// Fetch all events from CMS
export async function getAllEvents() {
  if (!sanityClient) return [];

  const query = `*[_type == "event" && status == "published"] | order(eventDetails.startDate asc) {
    _id,
    title,
    slug,
    eventType,
    excerpt,
    heroImage {
      asset->{
        url
      }
    },
    eventDetails {
      startDate,
      endDate,
      location,
      city,
      region
    }
  }`;
  return await sanityClient.fetch(query);
}

// Create/update event in CMS
export async function syncEventToCMS(event: any) {
  if (!sanityClient) return null;

  const document = {
    _type: "event",
    eventId: event.id,
    name: event.name,
    description: event.description,
    // ... other fields
  };

  // Check if exists
  const existing = await sanityClient.fetch(
    `*[_type == "event" && eventId == $eventId][0]._id`,
    { eventId: event.id }
  );

  if (existing) {
    return await sanityClient.patch(existing).set(document).commit();
  } else {
    return await sanityClient.create(document);
  }
}
