-- Prisma Schema SQL for Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create enums
CREATE TYPE "EventType" AS ENUM ('RUNNING', 'BIKING', 'TRIATHLON');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "EventSource" AS ENUM ('AI_GENERATED', 'MANUAL', 'SCRAPED');

-- Create EventContent table first (referenced by Event)
CREATE TABLE "EventContent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventContent_pkey" PRIMARY KEY ("id")
);

-- Create Event table
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "EventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "registrationOpenDate" TIMESTAMP(3),
    "registrationCloseDate" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "website" TEXT,
    "registrationUrl" TEXT,
    "organizer" TEXT,
    "organizerEmail" TEXT,
    "distances" JSONB,
    "price" JSONB,
    "images" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "source" "EventSource" NOT NULL DEFAULT 'MANUAL',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "indexedInElasticsearch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on Event.slug
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- Create foreign key relationship
ALTER TABLE "EventContent" ADD CONSTRAINT "EventContent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraint on EventContent.eventId
CREATE UNIQUE INDEX "EventContent_eventId_key" ON "EventContent"("eventId");

-- Create indexes
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");
CREATE INDEX "Event_region_idx" ON "Event"("region");
CREATE INDEX "Event_city_idx" ON "Event"("city");
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");
CREATE INDEX "Event_status_idx" ON "Event"("status");
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

