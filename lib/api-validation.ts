export function parseBoundedInt(
  value: string | null,
  fallback: number,
  { min = 1, max }: { min?: number; max: number }
): number {
  if (value === null || value.trim() === '') return fallback

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < min) return fallback

  return Math.min(parsed, max)
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }

    return entities[character]
  })
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
