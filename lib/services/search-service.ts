import { elasticsearchClient, INDEX_NAME } from "@/lib/elasticsearch";
import { SearchResponse, SearchResult } from "@/types";
import { getNextOccurrenceDate } from "@/lib/utils/event-dates";

export interface SearchOptions {
  q?: string;
  eventType?: string;
  region?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  distance?: string;
  page?: number;
  limit?: number;
}

export async function searchEvents(
  options: SearchOptions
): Promise<SearchResponse> {
  const {
    q = "",
    eventType,
    region,
    city,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = options;

  const from = (page - 1) * limit;

  const must: any[] = [];
  const should: any[] = [];

  // Full-text search
  if (q) {
    should.push({
      multi_match: {
        query: q,
        fields: [
          "name^3",
          "description^2",
          "location",
          "organizer",
          "searchable_text",
        ],
        fuzziness: "AUTO",
        type: "best_fields",
      },
    });
  }

  // Filters
  if (eventType) {
    must.push({ term: { eventType } });
  }

  if (region) {
    must.push({ term: { region } });
  }

  if (city) {
    must.push({ term: { city } });
  }

  const dateRange: any = {};
  if (startDate) {
    dateRange.gte = startDate;
  }
  if (endDate) {
    dateRange.lte = endDate;
  }
  if (Object.keys(dateRange).length > 0) {
    must.push({ range: { startDate: dateRange } });
  }

  const query: any = {
    bool: {},
  };

  if (must.length > 0) {
    query.bool.must = must;
  }

  if (should.length > 0) {
    query.bool.should = should;
    query.bool.minimum_should_match = q ? 1 : 0;
  }

  const body: any = {
    query,
    from,
    size: limit,
    highlight: {
      fields: {
        name: {},
        description: { fragment_size: 150 },
      },
    },
    aggs: {
      eventTypes: {
        terms: { field: "eventType", size: 10 },
      },
      regions: {
        terms: { field: "region", size: 20 },
      },
    },
  };

  const response = await elasticsearchClient.search({
    index: INDEX_NAME,
    ...body,
  });

  const results: SearchResult[] = response.hits.hits.map((hit: any) => ({
    id: hit._id,
    slug: hit._source.slug || hit._id, // Use slug from index, fallback to id
    name: hit._source.name,
    description: hit._source.description,
    eventType: hit._source.eventType,
    startDate: getNextOccurrenceDate(hit._source.startDate).toISOString(),
    location: hit._source.location,
    city: hit._source.city,
    region: hit._source.region,
    distances: hit._source.distances || [],
    highlight: hit.highlight
      ? {
          name: hit.highlight.name,
          description: hit.highlight.description,
        }
      : undefined,
  }));

  const total =
    typeof response.hits.total === "object"
      ? response.hits.total.value
      : response.hits.total || 0;

  return {
    results,
    total: total || 0,
    took: response.took || 0,
    aggregations: {
      eventTypes: (response.aggregations?.eventTypes as any)?.buckets?.reduce(
        (acc: any, bucket: any) => {
          acc[bucket.key] = bucket.doc_count;
          return acc;
        },
        {}
      ),
      regions: (response.aggregations?.regions as any)?.buckets?.reduce(
        (acc: any, bucket: any) => {
          acc[bucket.key] = bucket.doc_count;
          return acc;
        },
        {}
      ),
    },
  };
}

export async function autocompleteSearch(query: string, limit: number = 10) {
  const response = await elasticsearchClient.search({
    index: INDEX_NAME,
    suggest: {
      event_suggest: {
        prefix: query,
        completion: {
          field: "name.suggest",
          size: limit,
          fuzzy: {
            fuzziness: 1,
          },
        },
      },
    },
  });

  const suggestions =
    (response.suggest?.event_suggest as any)?.[0]?.options?.map(
      (option: any) => ({
        text: option.text,
        score: option.score,
      })
    ) || [];

  return suggestions;
}
