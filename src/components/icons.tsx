import type { ReactNode } from 'react'

/** Inline stroke icons (Lucide-style 24px grid). Decorative: hidden from screen readers. */
function Icon({ children, className = 'h-5 w-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  )
}

type P = { className?: string }

export const IconBriefcase = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
  </Icon>
)
export const IconCpu = (p: P) => (
  <Icon {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </Icon>
)
export const IconUsers = (p: P) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
  </Icon>
)
export const IconReceipt = (p: P) => (
  <Icon {...p}>
    <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Icon>
)
export const IconBars = (p: P) => (
  <Icon {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Icon>
)
export const IconCoins = (p: P) => (
  <Icon {...p}>
    <ellipse cx="9" cy="7" rx="6" ry="3" />
    <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7M3 12v5c0 1.7 2.7 3 6 3 1.2 0 2.3-.2 3.2-.5M15 13.5c3.4.2 6 1.4 6 3s-2.7 3-6 3" />
  </Icon>
)
export const IconTag = (p: P) => (
  <Icon {...p}>
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
    <circle cx="8" cy="8" r="1.5" />
  </Icon>
)
export const IconSparkles = (p: P) => (
  <Icon {...p}>
    <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </Icon>
)
export const IconShield = (p: P) => (
  <Icon {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
)
export const IconMonitor = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Icon>
)
export const IconUserOff = (p: P) => (
  <Icon {...p}>
    <circle cx="10" cy="8" r="4" />
    <path d="M3 20a7 7 0 0 1 11-5.7M16 16l5 5M21 16l-5 5" />
  </Icon>
)
export const IconSigma = (p: P) => (
  <Icon {...p}>
    <path d="M18 7V4H6l6 8-6 8h12v-3" />
  </Icon>
)
export const IconLanguages = (p: P) => (
  <Icon {...p}>
    <path d="M4 5h8M8 3v2M5 9c1.5 3 4 5 7 6M11 5c-.8 4-3.4 7.5-7 9M13 21l4-10 4 10M14.5 17h5" />
  </Icon>
)
export const IconActivity = (p: P) => (
  <Icon {...p}>
    <path d="M22 12h-4l-3 8L9 4l-3 8H2" />
  </Icon>
)
