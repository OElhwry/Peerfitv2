/**
 * FixtureMetaBlock — two-column "specs page" metadata layout.
 *
 *   THE FIXTURE                  THE VENUE
 *   ─────────────                ─────────────
 *   Tuesday 28 April             Victoria Park
 *   Kick-off 19:30               London E9 7HD
 *   90 minutes                   Pitch 3
 *   Intermediate level           Open to all
 *
 * Each column has an eyebrow header, a hairline divider, and a stack of
 * label/value pairs. Pure data display — no interactions, no buttons.
 *
 * Inspired by magazine product specs pages (Wirecutter, MR PORTER).
 */

import type { ReactNode } from "react"

export type MetaItem = {
  label: string
  value: ReactNode
}

export function FixtureMetaBlock({
  fixture,
  venue,
  fixtureTitle = "The fixture",
  venueTitle = "The venue",
}: {
  fixture: MetaItem[]
  venue: MetaItem[]
  fixtureTitle?: string
  venueTitle?: string
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-10 sm:gap-16">
      <MetaColumn title={fixtureTitle} items={fixture} />
      <MetaColumn title={venueTitle} items={venue} />
    </div>
  )
}

function MetaColumn({ title, items }: { title: string; items: MetaItem[] }) {
  return (
    <div>
      <p className="t-eyebrow text-muted-foreground pb-3 border-b border-border">
        {title}
      </p>
      <dl className="mt-4 flex flex-col gap-4">
        {items.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="t-meta text-muted-foreground">{label}</dt>
            <dd className="t-heading text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
