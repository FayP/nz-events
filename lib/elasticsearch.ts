import { Client } from "@elastic/elasticsearch";

if (!process.env.ELASTICSEARCH_URL) {
  throw new Error("ELASTICSEARCH_URL is not set in environment variables");
}

export const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: process.env.ELASTICSEARCH_AUTH
    ? {
        username: process.env.ELASTICSEARCH_USERNAME || "",
        password: process.env.ELASTICSEARCH_PASSWORD || "",
      }
    : undefined,
});

export const INDEX_NAME = "events";

// Initialize index with mapping
export async function initializeElasticsearchIndex() {
  const exists = await elasticsearchClient.indices.exists({
    index: INDEX_NAME,
  });

  if (!exists) {
    await elasticsearchClient.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          id: { type: "keyword" },
          name: {
            type: "text",
            fields: {
              keyword: { type: "keyword" },
              suggest: {
                type: "completion",
                analyzer: "simple",
              },
            },
          },
          description: { type: "text" },
          eventType: { type: "keyword" },
          startDate: { type: "date" },
          endDate: { type: "date" },
          location: { type: "text" },
          city: { type: "keyword" },
          region: { type: "keyword" },
          coordinates: { type: "geo_point" },
          organizer: { type: "text" },
          distances: { type: "keyword" },
          tags: { type: "keyword" },
          searchable_text: { type: "text" },
        },
      },
      settings: {
        analysis: {
          analyzer: {
            event_search: {
              type: "custom",
              tokenizer: "standard",
              filter: ["lowercase", "asciifolding"],
            },
          },
        },
      },
    });
  }
}

// Index an event
export async function indexEvent(event: any) {
  const doc = {
    id: event.id,
    name: event.name,
    name_suggest: event.name,
    description: event.description || "",
    eventType: event.eventType,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    city: event.city,
    region: event.region,
    coordinates:
      event.latitude && event.longitude
        ? { lat: event.latitude, lon: event.longitude }
        : undefined,
    organizer: event.organizer || "",
    distances: event.distances || [],
    tags: event.tags || [],
    searchable_text: [
      event.name,
      event.description,
      event.location,
      event.city,
      event.region,
      event.organizer,
    ]
      .filter(Boolean)
      .join(" "),
  };

  await elasticsearchClient.index({
    index: INDEX_NAME,
    id: event.id,
    document: doc,
  });
}

// Remove event from index
export async function removeEventFromIndex(eventId: string) {
  await elasticsearchClient.delete({
    index: INDEX_NAME,
    id: eventId,
  });
}
