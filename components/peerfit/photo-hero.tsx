/**
 * PhotoHero — full-bleed editorial photo with the standard ink overlay.
 *
 * The overlay treatment (oklch(0.18 0.005 60 / 0.85) gradient, 60% top fade)
 * lives in globals.css under .photo-overlay. Applied here so every editorial
 * hero photo across the system shares the same visual rule.
 *
 * Children render OVER the photo (caption stack, headlines, etc.) — pass
 * positioning classes on the children themselves.
 */

import Image from "next/image"
import type { ReactNode } from "react"

export function PhotoHero({
  src,
  alt,
  priority = false,
  kenBurns = false,
  position,
  rounded = false,
  children,
  className = "",
}: {
  src: string
  alt: string
  priority?: boolean
  /** Apply the 8s ken-burns motion. Use sparingly — hero surfaces only. */
  kenBurns?: boolean
  /** CSS object-position override for awkwardly-cropped photos. */
  position?: string
  /** Add subtle radius. Editorial heroes are usually square-cornered. */
  rounded?: boolean
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`photo-overlay relative overflow-hidden bg-ink ${rounded ? "rounded-md" : ""} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover ${kenBurns ? "pf-ken-burns" : ""}`}
        style={position ? { objectPosition: position } : undefined}
      />
      {children && (
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      )}
    </div>
  )
}
