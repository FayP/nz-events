/**
 * Format an event date for display.
 *
 * Dates in the DB are stored as UTC midnight (e.g. 2027-03-07T00:00:00Z).
 * They represent a calendar date — NOT a UTC instant. Converting to a local
 * timezone (e.g. Pacific/Auckland, UTC+13) shifts midnight to the next day,
 * so "7 March" becomes "8 March". Instead we always read the UTC components
 * directly so the displayed date matches the stored date regardless of the
 * viewer's timezone.
 */
export function formatEventDate(
  value: Date | string,
  options: { month?: 'long' | 'short' | 'numeric'; year?: boolean } = {}
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return ''

  const day = date.getUTCDate()
  const month = date.getUTCMonth() // 0-indexed
  const year = date.getUTCFullYear()

  const monthNames = {
    long: ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December'],
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  }

  const monthFormat = options.month ?? 'long'
  const showYear = options.year ?? true

  if (monthFormat === 'numeric') {
    return showYear
      ? `${day}/${month + 1}/${year}`
      : `${day}/${month + 1}`
  }

  const monthStr = monthNames[monthFormat][month]
  return showYear ? `${day} ${monthStr} ${year}` : `${day} ${monthStr}`
}
