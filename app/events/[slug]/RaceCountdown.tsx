'use client'

import { useMemo } from 'react'
import { useEventColors } from '@/lib/hooks/use-event-colors'

interface RaceCountdownProps {
  startDate: string
  eventType: string
}

interface TrainingPhase {
  id: string
  label: string
  description: string
  tip: string
  weeksOut: [number, number] // [min, max] weeks before race
  icon: string
}

const TRAINING_PHASES: TrainingPhase[] = [
  {
    id: 'base',
    label: 'Base Building',
    description: 'Build your aerobic foundation',
    tip: 'Focus on easy, consistent running. Build weekly mileage gradually — no more than 10% per week.',
    weeksOut: [12, Infinity],
    icon: '🏗️',
  },
  {
    id: 'build',
    label: 'Build Phase',
    description: 'Increase intensity and volume',
    tip: 'Add tempo runs and intervals. Your body is adapting — trust the process and prioritise sleep.',
    weeksOut: [8, 12],
    icon: '📈',
  },
  {
    id: 'peak',
    label: 'Peak Training',
    description: 'Highest training load',
    tip: 'This is your hardest block. Include your longest runs and toughest workouts now. Stay on top of nutrition.',
    weeksOut: [4, 8],
    icon: '⛰️',
  },
  {
    id: 'taper',
    label: 'Taper',
    description: 'Reduce volume, stay sharp',
    tip: 'Cut volume by 20-40% but keep some intensity. Feeling restless is normal — it means the taper is working.',
    weeksOut: [1, 4],
    icon: '🎯',
  },
  {
    id: 'raceweek',
    label: 'Race Week',
    description: 'Rest and prepare',
    tip: 'Easy shakeout runs only. Lay out your gear, check the forecast, and visualise your race plan.',
    weeksOut: [0, 1],
    icon: '⚡',
  },
]

function getPhase(weeksUntilRace: number): TrainingPhase | null {
  for (const phase of TRAINING_PHASES) {
    if (weeksUntilRace >= phase.weeksOut[0] && weeksUntilRace < phase.weeksOut[1]) {
      return phase
    }
  }
  return TRAINING_PHASES[0] // Default to base building for very far out events
}

function getPhaseProgress(weeksUntilRace: number): number {
  // Returns 0-100 representing overall progress toward race day
  const maxWeeks = 16
  if (weeksUntilRace >= maxWeeks) return 0
  if (weeksUntilRace <= 0) return 100
  return Math.round(((maxWeeks - weeksUntilRace) / maxWeeks) * 100)
}

export default function RaceCountdown({ startDate, eventType }: RaceCountdownProps) {
  const colors = useEventColors(eventType)

  const countdown = useMemo(() => {
    const now = new Date()
    const raceDate = new Date(startDate)
    const diffMs = raceDate.getTime() - now.getTime()

    if (diffMs < 0) return null // Event has passed

    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(totalDays / 7)
    const days = totalDays % 7
    const weeksExact = totalDays / 7

    return { totalDays, weeks, days, weeksExact }
  }, [startDate])

  if (!countdown) return null

  const currentPhase = getPhase(countdown.weeksExact)
  const progress = getPhaseProgress(countdown.weeksExact)

  if (!currentPhase) return null

  // Determine the active phase index for the timeline
  const activePhaseIndex = TRAINING_PHASES.findIndex((p) => p.id === currentPhase.id)

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.08]">
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: colors.gradient }}
      />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: `${colors.border}` }}
          >
            {currentPhase.icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">
              Race Countdown
            </h3>
            <p className="text-xs mt-0.5" style={{ color: colors.text }}>
              {currentPhase.label}
            </p>
          </div>
        </div>

        {/* Countdown Numbers */}
        <div className="flex items-baseline gap-6 mb-6">
          {countdown.weeks > 0 && (
            <div>
              <span
                className="font-outfit text-5xl sm:text-6xl font-bold"
                style={{ color: colors.text, letterSpacing: '-0.03em' }}
              >
                {countdown.weeks}
              </span>
              <span className="text-sm text-white/40 ml-1.5">
                {countdown.weeks === 1 ? 'week' : 'weeks'}
              </span>
            </div>
          )}
          <div>
            <span
              className="font-outfit text-5xl sm:text-6xl font-bold"
              style={{
                color: countdown.weeks > 0 ? 'rgba(255,255,255,0.7)' : colors.text,
                letterSpacing: '-0.03em',
              }}
            >
              {countdown.days}
            </span>
            <span className="text-sm text-white/40 ml-1.5">
              {countdown.days === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">Training Progress</span>
            <span className="text-xs text-white/30">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: colors.gradient,
              }}
            />
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="flex items-center gap-1 mb-6">
          {TRAINING_PHASES.map((phase, index) => {
            const isActive = index === activePhaseIndex
            const isComplete = index < activePhaseIndex

            return (
              <div key={phase.id} className="flex-1 flex flex-col items-center gap-1.5">
                {/* Phase dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: isActive
                      ? colors.text
                      : isComplete
                        ? `${colors.text}`
                        : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 8px ${colors.border}` : 'none',
                    opacity: isComplete ? 0.5 : 1,
                  }}
                />
                {/* Phase bar */}
                <div
                  className="w-full h-1 rounded-full"
                  style={{
                    background: isActive
                      ? colors.gradient
                      : isComplete
                        ? colors.text
                        : 'rgba(255,255,255,0.06)',
                    opacity: isComplete ? 0.3 : 1,
                  }}
                />
                {/* Phase label */}
                <span
                  className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-center leading-tight"
                  style={{
                    color: isActive ? colors.text : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {phase.label.split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Current Phase Tip */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">{currentPhase.icon}</span>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">
                {currentPhase.description}
              </p>
              <p className="text-xs text-white/40 leading-relaxed">
                {currentPhase.tip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
