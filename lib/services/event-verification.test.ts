import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  assessEvent,
  isDeadLink,
  listedDate,
  mapWithConcurrency,
  type AiVerification,
} from './event-verification'

const event = { startDate: new Date('2026-10-31T13:00:00.000Z') }

const confirmed: AiVerification = {
  status: 'confirmed',
  eventDate: '2026-10-31',
  location: 'Coromandel',
  issues: [],
  sources: ['https://example.co.nz/2026'],
  summary: 'Going ahead.',
}

test('listedDate is the UTC date the site displays', () => {
  assert.equal(listedDate(event), '2026-10-31')
})

test('a confirmed event with working links is not flagged', () => {
  assert.deepEqual(assessEvent(event, confirmed, [{ url: 'https://a', status: 200 }]), [])
})

test('a cancelled event with a dead site is flagged for both', () => {
  const reasons = assessEvent(
    event,
    { ...confirmed, status: 'cancelled', eventDate: null },
    [{ url: 'https://k2cycle.co.nz/', status: 500 }]
  )
  assert.equal(reasons.length, 2)
  assert.match(reasons[0], /cancelled/)
  assert.match(reasons[1], /Broken link.*500/)
})

test('not found and postponed are flagged', () => {
  assert.equal(assessEvent(event, { ...confirmed, status: 'not_found' }, []).length, 1)
  assert.equal(assessEvent(event, { ...confirmed, status: 'postponed' }, []).length, 1)
})

test('a date mismatch is flagged even when the event is confirmed', () => {
  const reasons = assessEvent(event, { ...confirmed, eventDate: '2026-11-07' }, [])
  assert.deepEqual(reasons, ['Date: listed 2026-10-31, sources say 2026-11-07'])
})

test('field issues are reported', () => {
  const reasons = assessEvent(
    event,
    { ...confirmed, status: 'details_changed', issues: [{ field: 'Location', listed: 'Thames', found: 'Whitianga' }] },
    []
  )
  assert.deepEqual(reasons, ['Location: listed "Thames", sources say "Whitianga"'])
})

test('confirmed without a source is flagged', () => {
  assert.equal(assessEvent(event, { ...confirmed, sources: [] }, []).length, 1)
})

test('a failed check is flagged rather than passed', () => {
  assert.deepEqual(assessEvent(event, null, []), ['Check failed: no verification result'])
})

test('bot blocks are not dead links; 404, 410, 5xx and network failures are', () => {
  assert.equal(isDeadLink({ url: 'u', status: 403 }), false)
  assert.equal(isDeadLink({ url: 'u', status: 429 }), false)
  assert.equal(isDeadLink({ url: 'u', status: 404 }), true)
  assert.equal(isDeadLink({ url: 'u', status: 410 }), true)
  assert.equal(isDeadLink({ url: 'u', status: 503 }), true)
  assert.equal(isDeadLink({ url: 'u', status: null, error: 'ENOTFOUND' }), true)
})

test('mapWithConcurrency caps in-flight work and keeps order', async () => {
  let inFlight = 0
  let peak = 0
  const out = await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (n) => {
    inFlight++
    peak = Math.max(peak, inFlight)
    await new Promise((r) => setTimeout(r, 5 * (7 - n)))
    inFlight--
    return n * 10
  })
  assert.deepEqual(out, [10, 20, 30, 40, 50, 60])
  assert.equal(peak, 2)
})
