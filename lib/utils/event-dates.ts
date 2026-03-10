/**
 * Return the next annual occurrence for an event date.
 * If the original date is in the past, move it to this year/next year while
 * preserving month/day/time (UTC-based to avoid local timezone drift).
 */
export function getNextOccurrenceDate(
  value: Date | string,
  now: Date = new Date()
): Date {
  const original = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(original.getTime())) {
    return original;
  }

  const month = original.getUTCMonth();
  const day = original.getUTCDate();
  const hour = original.getUTCHours();
  const minute = original.getUTCMinutes();
  const second = original.getUTCSeconds();
  const millisecond = original.getUTCMilliseconds();

  let year = now.getUTCFullYear();
  let candidate = createUtcDate(year, month, day, hour, minute, second, millisecond);

  if (candidate < now) {
    year += 1;
    candidate = createUtcDate(year, month, day, hour, minute, second, millisecond);
  }

  return candidate;
}

function createUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number
): Date {
  const maxDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const safeDay = Math.min(day, maxDay);
  return new Date(Date.UTC(year, month, safeDay, hour, minute, second, millisecond));
}
