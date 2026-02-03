"use client";

import { useState } from "react";
import Image from "next/image";
import { getEventImages } from "@/lib/utils/get-event-image";

interface EventImageGalleryProps {
  images: unknown;
  eventType: string;
  eventName: string;
}

export default function EventImageGallery({
  images,
  eventType,
  eventName,
}: EventImageGalleryProps) {
  const resolvedImages = getEventImages(images, eventType);
  const [activeIndex, setActiveIndex] = useState(0);

  const mainImage = resolvedImages[activeIndex] || resolvedImages[0];
  const showThumbnails = resolvedImages.length > 1;

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/[0.08]">
        <Image
          src={mainImage}
          alt={eventName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 480px"
          priority
        />
      </div>

      {/* Thumbnail Row */}
      {showThumbnails && (
        <div className="flex gap-2">
          {resolvedImages.slice(0, 5).map((src, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square w-16 overflow-hidden rounded-lg border transition-all ${
                index === activeIndex
                  ? "border-white/40 ring-1 ring-white/20"
                  : "border-white/[0.08] opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${eventName} - photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
