'use client'

import { useEventColors } from '@/lib/hooks/use-event-colors'

interface AmbientBackgroundProps {
  eventType: string
}

export function AmbientBackground({ eventType }: AmbientBackgroundProps) {
  const colors = useEventColors(eventType)

  return (
    <>
      {/* Top-right ambient gradient */}
      <div
        className="fixed top-[-30%] right-[-20%] w-[70%] h-[70%] pointer-events-none animate-float z-0"
        style={{
          background: `radial-gradient(ellipse, ${colors.text}12 0%, transparent 60%)`,
        }}
      />

      {/* Bottom-left ambient gradient */}
      <div
        className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.02) 0%, transparent 60%)',
          animation: 'float 25s ease-in-out infinite reverse',
        }}
      />
    </>
  )
}
