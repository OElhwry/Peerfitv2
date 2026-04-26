/**
 * TeamSheet — numbered roster of joined players + open spots.
 *
 *   01  ▣ Maya Hernandez   HOST            Intermediate
 *   02  ▣ Tom Kettering                    Intermediate
 *   ──
 *   03  · open
 *   04  · open
 *
 * The signature in-product moment for PeerFit. Renders on the fixture
 * detail page (Phase 3) and inside the hero FixtureCard variant on feed
 * (Phase 4). Open-spot rows are explicit — they visualise scarcity better
 * than a "7/10" badge.
 *
 * Properly extracts the in-context preview that landing's MockTeamSheet
 * was hinting at — that mock was always meant to graduate into this.
 */

import { EditorialAvatar } from "./editorial-avatar"

export type TeamSheetPlayer = {
  id: string
  name: string | null
  avatar?: string | null
  /** Free-text role tag (e.g. "Intermediate", "Beginner"). Hidden if absent. */
  role?: string
  isHost?: boolean
}

export function TeamSheet({
  players,
  capacity,
  className = "",
}: {
  players: TeamSheetPlayer[]
  capacity: number
  className?: string
}) {
  const filled = players.length
  const openSpots = Math.max(capacity - filled, 0)

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between mb-4">
        <p className="t-eyebrow text-muted-foreground">Team sheet</p>
        <p className="t-mono text-foreground">
          {filled} / {capacity}
        </p>
      </div>

      <ul className="border-y border-border divide-y divide-border">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 sm:gap-4 py-3"
          >
            <span className="t-mono text-muted-foreground w-6">
              {String(i + 1).padStart(2, "0")}
            </span>
            <EditorialAvatar name={p.name} src={p.avatar} size="sm" />
            <span className="t-heading text-foreground truncate">
              {p.name ?? "Player"}
            </span>
            <span className="t-mono text-muted-foreground text-right">
              {p.isHost ? "Host" : (p.role ?? "")}
            </span>
          </li>
        ))}

        {openSpots > 0 &&
          Array.from({ length: openSpots }).map((_, i) => (
            <li
              key={`open-${i}`}
              className="grid grid-cols-[auto_1fr] items-center gap-3 sm:gap-4 py-3"
            >
              <span className="t-mono text-muted-foreground/40 w-6">
                {String(filled + i + 1).padStart(2, "0")}
              </span>
              <span className="t-mono text-muted-foreground/40">
                · open
              </span>
            </li>
          ))}
      </ul>
    </div>
  )
}
