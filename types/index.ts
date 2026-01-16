export type EventType = "RUNNING" | "BIKING" | "TRIATHLON";
export type EventStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type EventSource = "AI_GENERATED" | "MANUAL" | "SCRAPED";

export interface DistanceDetail {
  name: string;
  distance: string;
  elevation: string;
  time: string;
  description: string;
}

export interface CourseInfo {
  terrain?: string;
  surface?: string;
  traffic?: string;
  cutoffTime?: string;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  description?: string;
  eventType: EventType;
  startDate: Date;
  endDate?: Date;
  registrationOpenDate?: Date;
  registrationCloseDate?: Date;
  location: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  registrationUrl?: string;
  organizer?: string;
  organizerEmail?: string;
  organizerWebsite?: string;
  distances?: string[];
  distanceDetails?: DistanceDetail[];
  price?: any;
  images?: string[];
  schedule?: Array<{ time: string; description: string }>;
  highlights?: string[];
  courseTerrain?: string;
  courseSurface?: string;
  courseTraffic?: string;
  requirements?: string[];
  registrationCapacity?: number;
  registrationTaken?: number;
  fullAddress?: string;
  featured: boolean;
  verified: boolean;
  status: EventStatus;
  source: EventSource;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  location: string;
  city: string;
  region: string;
  highlight?: {
    name?: string[];
    description?: string[];
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
  aggregations?: {
    eventTypes?: { [key: string]: number };
    regions?: { [key: string]: number };
  };
}

export interface AutocompleteSuggestion {
  text: string;
  score: number;
}
