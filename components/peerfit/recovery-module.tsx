/**
 * RecoveryModule — the body of the "OFFSIDE" 404 page.
 *
 * Branches on auth state. Same structure either way; different labels and
 * a different terminal CTA. Both variants offer:
 *   1. A primary "back to where you belong" link
 *   2. Three live fixture rows so a lost user lands on real demand
 *   3. A tertiary CTA — browse fixtures (signed in) or join PeerFit (out)
 *
 * Server component — no interactivity needed. Search is deliberately deferred:
 * a search input would imply working filtering that the feed doesn't yet
 * support. Once /feed handles ?q= URL params (V2), swap the "Browse all
 * fixtures" link for a search form.
 */

import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { FieldLine } from "./field-line"
import { FixtureList } from "./fixture-row"
import type { TickerFixture } from "./live-ticker"

export function RecoveryModule({
  signedIn,
  fixtures,
}: {
  signedIn: boolean
  fixtures: TickerFixture[]
}) {
  const homeHref = signedIn ? "/feed" : "/"
  const homeLabel = signedIn ? "Back to your feed" : "Back to home"
  const fixturesEyebrow = signedIn ? "On tonight near you" : "Happening now"

  return (
    <section className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 lg:py-32">
      {/* ── Eyebrow ───────────────────────────────────────────────────── */}
      <p className="t-eyebrow text-muted-foreground mb-6">404 / Page out of play</p>

      {/* ── Display headline ───────────────────────────────────────────── */}
      <h1 className="t-display-xl text-foreground">Offside.</h1>

      {/* ── Hairline + offside flag motif ─────────────────────────────── */}
      <div className="mt-8 mb-6 flex items-center gap-4 text-muted-foreground">
        <span className="flex-1">
          <FieldLine sport="neutral" />
        </span>
        <span
          aria-hidden
          className="t-display-sm text-brand-amber leading-none -mt-1"
          title="Offside flag"
        >
          ◤
        </span>
      </div>

      {/* ── Subline ───────────────────────────────────────────────────── */}
      <p className="t-sub text-muted-foreground max-w-xl">
        That page doesn&apos;t exist — or the fixture&apos;s already kicked off.
      </p>

      {/* ── Recovery grid ─────────────────────────────────────────────── */}
      <div className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20">
        {/* Primary action */}
        <div>
          <p className="t-eyebrow text-muted-foreground mb-4">Get back in play</p>
          <Link
            href={homeHref}
            className="group inline-flex items-center gap-3 t-display-sm text-foreground hover:text-brand-pitch transition-colors"
          >
            <ArrowRight
              className="w-6 h-6 sm:w-8 sm:h-8 -rotate-180 group-hover:-translate-x-1 transition-transform"
              strokeWidth={2.5}
            />
            <span>{homeLabel}</span>
          </Link>

          <div className="mt-10 pt-8 border-t border-border">
            <p className="t-eyebrow text-muted-foreground mb-3">Or</p>
            {signedIn ? (
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 t-heading text-foreground hover:text-brand-pitch transition-colors"
              >
                Browse all fixtures
                <ArrowUpRight className="w-5 h-5" strokeWidth={2} />
              </Link>
            ) : (
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-pitch text-paper t-mono hover:bg-brand-pitch-hover transition-colors"
              >
                Join PeerFit
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </div>

        {/* Fixture list */}
        <div>
          <p className="t-eyebrow text-muted-foreground mb-4">{fixturesEyebrow}</p>
          <FixtureList
            fixtures={fixtures.slice(0, 4)}
            emptyText="No fixtures live right now. Check back tonight — most games go up after work hours."
          />
        </div>
      </div>
    </section>
  )
}
