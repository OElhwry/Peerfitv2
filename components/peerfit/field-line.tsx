/**
 * Field-Line — recurring sport-specific hairline graphic.
 *
 * Each variant is a horizontal-spanning SVG suggesting that sport's
 * court/field marking. Stroke inherits currentColor so it tints with text.
 *
 * Per ADR-003 (Field-Line discipline):
 *   - Use ONLY at section boundaries (day dividers, hero hairlines, footer).
 *   - NEVER as a card background, button trim, or repeated decoration.
 *
 * Ships with 4 sports + neutral. Add new sports by following the same
 * viewBox grammar (1200×40, single stroke, preserveAspectRatio="none").
 */

import type { FieldLineSport } from "@/lib/sport-image"

export function FieldLine({
  sport = "neutral",
  className = "",
  strokeWidth = 1,
}: {
  sport?: FieldLineSport
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
      className={`block w-full h-[40px] ${className}`}
    >
      {renderPath(sport, strokeWidth)}
    </svg>
  )
}

function renderPath(sport: FieldLineSport, sw: number) {
  switch (sport) {
    case "football":
      // Baseline with a centre-circle arc rising from the middle.
      return (
        <g fill="none" stroke="currentColor" strokeWidth={sw}>
          <line x1="0" y1="32" x2="540" y2="32" />
          <path d="M 540 32 A 60 60 0 0 1 660 32" />
          <line x1="660" y1="32" x2="1200" y2="32" />
          <line x1="600" y1="20" x2="600" y2="44" opacity="0.6" />
        </g>
      )

    case "tennis":
      // Baseline + service line cross at centre, with two side ticks.
      return (
        <g fill="none" stroke="currentColor" strokeWidth={sw}>
          <line x1="0" y1="32" x2="1200" y2="32" />
          <line x1="600" y1="14" x2="600" y2="32" />
          <line x1="300" y1="28" x2="300" y2="36" opacity="0.6" />
          <line x1="900" y1="28" x2="900" y2="36" opacity="0.6" />
        </g>
      )

    case "basketball":
      // Baseline with a three-point arc rising from the centre.
      return (
        <g fill="none" stroke="currentColor" strokeWidth={sw}>
          <line x1="0" y1="32" x2="450" y2="32" />
          <path d="M 450 32 A 150 150 0 0 1 750 32" />
          <line x1="750" y1="32" x2="1200" y2="32" />
        </g>
      )

    case "running":
      // Subtle track curve — gentle bezier suggesting the bend of a 400m track.
      return (
        <g fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M 0 32 Q 600 8, 1200 32" />
          <path d="M 0 36 Q 600 14, 1200 36" opacity="0.5" />
        </g>
      )

    case "neutral":
    default:
      // Plain hairline. Used when sport is unknown or context is multi-sport.
      return (
        <line
          x1="0"
          y1="32"
          x2="1200"
          y2="32"
          stroke="currentColor"
          strokeWidth={sw}
        />
      )
  }
}
