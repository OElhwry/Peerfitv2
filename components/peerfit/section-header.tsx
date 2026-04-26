/**
 * SectionHeader — eyebrow + display heading + optional sub.
 *
 * The recurring "section opener" for editorial pages. Used everywhere a
 * section needs a typographic header with the brand's three-voice rhythm:
 *   t-eyebrow  →  t-display-*  →  t-sub
 *
 *   <SectionHeader
 *     eyebrow="How it works"
 *     heading={<>From post<br/>to pitch.</>}
 *     sub="Three steps. Most games come together in under an hour."
 *   />
 *
 * The optional `action` slot allows a "see all →" link or filter row
 * to sit alongside the header on the same row at desktop.
 */

import type { ReactNode } from "react"

type Size = "sm" | "md" | "lg"
type Align = "left" | "center"

const HEADING_CLASS: Record<Size, string> = {
  sm: "t-display-sm",
  md: "t-display-md",
  lg: "t-display-lg",
}

export function SectionHeader({
  eyebrow,
  heading,
  sub,
  size = "md",
  align = "left",
  action,
  className = "",
}: {
  eyebrow?: string
  heading: ReactNode
  sub?: string
  size?: Size
  align?: Align
  action?: ReactNode
  className?: string
}) {
  const isCenter = align === "center"
  const alignClass = isCenter
    ? "text-center items-center"
    : "text-left items-start"

  // When an action is present, lay it alongside the header at desktop —
  // header takes the room it needs, action drifts to the right.
  if (action && !isCenter) {
    return (
      <header
        className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 ${className}`}
      >
        <div className="flex flex-col items-start gap-3">
          {eyebrow && (
            <p className="t-eyebrow text-muted-foreground">{eyebrow}</p>
          )}
          <h2 className={`${HEADING_CLASS[size]} text-foreground`}>{heading}</h2>
          {sub && (
            <p className="t-sub text-muted-foreground max-w-2xl">{sub}</p>
          )}
        </div>
        <div className="shrink-0">{action}</div>
      </header>
    )
  }

  return (
    <header className={`flex flex-col gap-3 ${alignClass} ${className}`}>
      {eyebrow && (
        <p className="t-eyebrow text-muted-foreground">{eyebrow}</p>
      )}
      <h2 className={`${HEADING_CLASS[size]} text-foreground`}>{heading}</h2>
      {sub && (
        <p
          className={`t-sub text-muted-foreground ${isCenter ? "max-w-xl" : "max-w-2xl"}`}
        >
          {sub}
        </p>
      )}
    </header>
  )
}
