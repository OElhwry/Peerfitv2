/**
 * FixtureRow — a single dense fixture row.
 * FixtureList — a divider-bordered ul of FixtureRows.
 *
 * The "fixture as type-only data" pattern: time, sport, location, spots.
 * Used wherever we list fixtures without their hero photography:
 *   - 404 recovery list
 *   - Landing's "this week's fixtures" strip
 *   - Feed's dense list rows (Phase 4)
 *
 * Status drives the leading dot colour:
 *   live | tonight  → amber  (time-pressure)
 *   upcoming        → pitch  (later this week)
 */

import Link from "next/link"
import type { TickerFixture } from "./live-ticker"

export function FixtureRow({ fixture }: { fixture: TickerFixture }) {
  const isLive = fixture.status !== "upcoming"
  const dotColor = isLive ? "bg-brand-amber" : "bg-brand-pitch"

  const content = (
    <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_2fr_1fr_auto] items-center gap-3 sm:gap-5 py-4">
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className="t-mono text-foreground">{fixture.time}</span>
      <span className="t-mono text-foreground hidden sm:block">{fixture.sport}</span>
      <span className="t-mono text-muted-foreground truncate hidden sm:block">
        {fixture.location}
      </span>
      <span className="t-mono text-foreground text-right">{fixture.spotsText}</span>
    </div>
  )

  return (
    <li>
      {fixture.href ? (
        <Link
          href={fixture.href}
          className="block hover:bg-muted/60 px-2 -mx-2 transition-colors"
        >
          {content}
        </Link>
      ) : (
        <div className="px-2 -mx-2">{content}</div>
      )}
    </li>
  )
}

export function FixtureList({
  fixtures,
  emptyText = "No fixtures live right now.",
}: {
  fixtures: TickerFixture[]
  emptyText?: string
}) {
  if (fixtures.length === 0) {
    return (
      <p className="t-body text-muted-foreground max-w-md">{emptyText}</p>
    )
  }
  return (
    <ul className="divide-y divide-border border-y border-border">
      {fixtures.map((f) => (
        <FixtureRow key={f.id} fixture={f} />
      ))}
    </ul>
  )
}
