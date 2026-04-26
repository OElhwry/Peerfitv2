/**
 * LiveTicker — always-on horizontal marquee of current fixture demand.
 *
 * The signature surface of the brand. Used on Landing and Feed.
 *
 * This component is presentational: it renders whatever fixtures it's given.
 * Data fetching (and the fallback ladder: your area → city → nationwide)
 * lives at the call site.
 *
 * Status meanings (drives the leading dot colour):
 *   live      — amber dot, "happening now"
 *   tonight   — amber dot, "starts within 12 hours"
 *   upcoming  — pitch dot, "later this week"
 *
 * If `fixtures` is empty, renders the empty-state fallback CTA instead of
 * an embarrassing blank ticker.
 */

import Link from "next/link"

export type TickerFixture = {
  id: string
  status: "live" | "tonight" | "upcoming"
  /** Pre-formatted time stamp, e.g. "TONIGHT 19:30" or "NOW" */
  time: string
  sport: string
  location: string
  /** e.g. "3 SPOTS" or "NEED 1" or "FILLING FAST" */
  spotsText: string
  /** Optional link target for the row */
  href?: string
}

export function LiveTicker({
  fixtures,
  emptyHref = "/feed",
  emptyLabel = "Be the first to post a game tonight",
}: {
  fixtures: TickerFixture[]
  emptyHref?: string
  emptyLabel?: string
}) {
  if (fixtures.length === 0) {
    return (
      <div className="bg-ink text-paper border-y border-stone-800">
        <Link
          href={emptyHref}
          className="flex items-center justify-center gap-3 py-3 px-5 hover:bg-stone-900 transition-colors"
        >
          <span className="t-eyebrow text-brand-amber">⚡ Quiet tonight</span>
          <span className="t-meta text-paper">{emptyLabel}</span>
          <span className="t-mono text-brand-pitch">POST →</span>
        </Link>
      </div>
    )
  }

  // Duplicate the list inline so the marquee loops seamlessly.
  // translateX(-50%) lands the second copy exactly where the first started.
  const doubled = [...fixtures, ...fixtures]

  return (
    <div
      className="bg-ink text-paper border-y border-stone-800 overflow-hidden"
      role="region"
      aria-label="Live fixtures ticker"
    >
      <div className="pf-ticker-track flex items-center gap-12 py-3 whitespace-nowrap w-max">
        {doubled.map((f, i) => (
          <TickerItem key={`${f.id}-${i}`} fixture={f} />
        ))}
      </div>
    </div>
  )
}

function TickerItem({ fixture }: { fixture: TickerFixture }) {
  const dotColor =
    fixture.status === "upcoming" ? "bg-brand-pitch" : "bg-brand-amber"

  const content = (
    <div className="flex items-center gap-3 px-5">
      <span
        aria-hidden
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
      />
      <span className="t-mono text-brand-amber">{fixture.time}</span>
      <span className="t-mono text-paper">{fixture.sport}</span>
      <span className="t-mono text-stone-300">{fixture.location}</span>
      <span className="t-mono text-paper">{fixture.spotsText}</span>
    </div>
  )

  return fixture.href ? (
    <Link href={fixture.href} className="hover:opacity-80 transition-opacity">
      {content}
    </Link>
  ) : (
    content
  )
}
