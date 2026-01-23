'use client'

import Link from 'next/link'

interface LogoProps {
  variant?: 'white' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  linkToHome?: boolean
}

export function Logo({ variant = 'white', size = 'md', linkToHome = true }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 20, gap: 8 },
    md: { icon: 40, text: 26, gap: 10 },
    lg: { icon: 48, text: 32, gap: 12 },
  }

  const s = sizes[size]

  const logoContent = (
    <div className="flex items-center" style={{ gap: `${s.gap}px` }}>
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: `${s.icon}px`,
          height: `${s.icon}px`,
          background: '#10b981',
        }}
      >
        <svg
          width={s.icon * 0.58}
          height={s.icon * 0.58}
          viewBox="0 0 28 28"
          fill="none"
        >
          <path
            d="M2 22L8 6L16 16L26 2"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="2" r="2" fill="white" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex items-baseline">
        <span
          className="font-semibold"
          style={{
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            fontSize: `${s.text}px`,
            letterSpacing: '-0.5px',
            color: variant === 'white' ? '#ffffff' : '#0a0a0b',
          }}
        >
          go
        </span>
        <span
          className="font-semibold"
          style={{
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            fontSize: `${s.text}px`,
            letterSpacing: '-0.5px',
            color: '#10b981',
          }}
        >
          stride
        </span>
      </div>
    </div>
  )

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex hover:opacity-90 transition-opacity">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
