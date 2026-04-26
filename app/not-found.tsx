/**
 * The OFFSIDE page — PeerFit's branded 404.
 *
 * First production surface for the editorial system (Phase 1 of the revamp).
 * Validates fonts, tokens, and primitives in production before any
 * high-traffic page is touched.
 *
 * Auth-aware: server-side fetch of the current user, then renders the
 * appropriate RecoveryModule variant.
 *
 * Phase 1 ships with STATIC mock fixtures in the recovery list.
 * Phase 2 wires real DB-backed fixtures (with the ticker fallback ladder).
 */

import { LiveTicker, type TickerFixture } from "@/components/peerfit/live-ticker"
import { PageShell } from "@/components/peerfit/page-shell"
import { RecoveryModule } from "@/components/peerfit/recovery-module"
import { getSignedIn } from "@/lib/auth"

// Mock fixtures — replaced by real data in Phase 2.
const MOCK_FIXTURES: TickerFixture[] = [
  { id: "m1", status: "live", time: "NOW", sport: "Basketball", location: "Brick Lane", spotsText: "Need 1", href: "/feed" },
  { id: "m2", status: "tonight", time: "Tonight 19:30", sport: "Football", location: "Victoria Park", spotsText: "3 spots", href: "/feed" },
  { id: "m3", status: "tonight", time: "Tonight 20:00", sport: "Tennis", location: "Islington", spotsText: "Doubles", href: "/feed" },
  { id: "m4", status: "upcoming", time: "Tue 20:30", sport: "Run Club", location: "Regent's Park", spotsText: "6 of 12", href: "/feed" },
]

export default async function NotFound() {
  const signedIn = await getSignedIn()

  return (
    <PageShell signedIn={signedIn}>
      <LiveTicker fixtures={MOCK_FIXTURES} />
      <RecoveryModule signedIn={signedIn} fixtures={MOCK_FIXTURES} />
    </PageShell>
  )
}
