import type { PrismaClient } from "@prisma/client";

/**
 * Generate a clean, SEO-friendly slug from an event name.
 * Deterministic: the same name always produces the same slug.
 *
 * "Auckland Marathon" -> "auckland-marathon"
 * "Ironman 70.3 Taupo" -> "ironman-70-3-taupo"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Given a base slug, check the database and return a unique slug.
 * If the base slug is taken by a different event, appends -2, -3, etc.
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  prisma: PrismaClient,
  excludeEventId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeEventId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
