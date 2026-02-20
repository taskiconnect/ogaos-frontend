// src/components/shared/BackgroundGrid.tsx
'use client'

import { cn } from "@/lib/utils"

interface BackgroundGridProps {
  className?: string
  overlayOpacity?: number
  gridOpacity?: number
  gridSize?: number
  children: React.ReactNode
}

export function BackgroundGrid({
  className,
  overlayOpacity = 0.32,
  gridOpacity = 0.055,
  gridSize = 52,
  children,
}: BackgroundGridProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden isolate", className)}>
      {/* Subtle grid lines using brand blue */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(63, 154, 245, ${gridOpacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(63, 154, 245, ${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {/* Soft radial overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            circle at 50% 25%,
            transparent 15%,
            rgba(250, 250, 250, ${overlayOpacity}) 65%
          )`,
        }}
      />

      {/* Light mode subtle fade */}
      <div className="dark:hidden absolute inset-0 bg-linear-to-b from-white/25 to-transparent pointer-events-none" />

      {/* Dark mode deeper fade */}
      <div className="hidden dark:block absolute inset-0 bg-linear-to-b from-black/50 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}