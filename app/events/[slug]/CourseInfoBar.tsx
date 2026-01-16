import { CourseInfo } from '@/types'

interface CourseInfoBarProps {
  courseInfo?: CourseInfo
}

export default function CourseInfoBar({ courseInfo }: CourseInfoBarProps) {
  if (!courseInfo || (!courseInfo.terrain && !courseInfo.surface && !courseInfo.cutoffTime)) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mb-10 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
      <div className="flex gap-10 p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
        {courseInfo.terrain && (
          <>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Terrain</div>
              <div className="text-base text-white font-medium">{courseInfo.terrain}</div>
            </div>
            {(courseInfo.surface || courseInfo.cutoffTime) && (
              <div className="w-px bg-white/[0.08]" />
            )}
          </>
        )}

        {courseInfo.surface && (
          <>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Surface</div>
              <div className="text-base text-white font-medium">{courseInfo.surface}</div>
            </div>
            {courseInfo.cutoffTime && <div className="w-px bg-white/[0.08]" />}
          </>
        )}

        {courseInfo.cutoffTime && (
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Cutoff Time</div>
            <div className="text-base text-white font-medium">{courseInfo.cutoffTime}</div>
          </div>
        )}
      </div>
    </div>
  )
}
