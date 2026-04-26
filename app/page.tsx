/**
 * Landing — PeerFit's marketing surface, editorial system.
 *
 * Phase 2 of the revamp. Server component end-to-end:
 *   - Auth check on the request
 *   - Real fixtures pulled from Supabase for the ticker + "this week" strip
 *   - Long-scroll editorial layout (no snap-scroll)
 *   - All chrome inline; auth-aware TopBar actions extracted to Phase 2A
 *
 * Six sections:
 *   1. Hero — full-bleed photo, display headline, field-line, CTA
 *   2. Live ticker — real fixture demand from the database
 *   3. How it works — three editorial spreads, one fixture's story
 *   4. This week — real fixtures rendered as a dense list
 *   5. Every sport — horizontal portrait gallery, photography differentiates
 *   6. Community — team-sheet of members (mock for V1, real in V2)
 *   7. Final CTA + footer
 *
 * Photography note: hero and CTA shots are existing stock placeholders.
 * Replace with commissioned multi-sport scenes when budget allows.
 */

import { FieldLine } from "@/components/peerfit/field-line"
import { FixtureList } from "@/components/peerfit/fixture-row"
import { IntroStinger } from "@/components/peerfit/intro-stinger"
import { LiveTicker, type TickerFixture } from "@/components/peerfit/live-ticker"
import { PageShell } from "@/components/peerfit/page-shell"
import { PhotoHero } from "@/components/peerfit/photo-hero"
import { SectionHeader } from "@/components/peerfit/section-header"
import { getSignedIn } from "@/lib/auth"
import { getSportImage } from "@/lib/sport-image"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

// ── Data shapes ─────────────────────────────────────────────────────────────

type DbFixture = {
  id: string
  title: string
  location: string
  date: string
  time: string
  duration_minutes: number
  max_participants: number
  sports: { name: string } | null
  activity_participants: { user_id: string }[]
}

// ── Fetchers ────────────────────────────────────────────────────────────────

/**
 * Fetch the next ~12 open fixtures globally, ordered by start time.
 * Geolocation-aware ranking (your-area → your-city → nationwide) lands in V2.
 */
async function fetchUpcomingFixtures(): Promise<DbFixture[]> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split("T")[0]
    const { data } = await supabase
      .from("activities")
      .select(
        `id, title, location, date, time, duration_minutes, max_participants,
         sports(name),
         activity_participants(user_id)`
      )
      .eq("status", "open")
      .gte("date", today)
      .order("date")
      .order("time")
      .limit(12)
    return (data ?? []) as unknown as DbFixture[]
  } catch {
    return []
  }
}

// ── Mappers ─────────────────────────────────────────────────────────────────

function toTickerFixture(a: DbFixture): TickerFixture {
  const start = new Date(`${a.date}T${a.time}`)
  const now = new Date()
  const end = new Date(start.getTime() + a.duration_minutes * 60_000)
  const hoursAway = (start.getTime() - now.getTime()) / 3_600_000
  const isToday = a.date === new Date().toISOString().split("T")[0]

  let status: TickerFixture["status"]
  if (now >= start && now < end) status = "live"
  else if (isToday && hoursAway >= 0 && hoursAway <= 12) status = "tonight"
  else status = "upcoming"

  const time =
    status === "live"
      ? "NOW"
      : isToday
        ? `Tonight ${a.time.slice(0, 5)}`
        : `${start.toLocaleDateString("en-GB", { weekday: "short" })} ${a.time.slice(0, 5)}`

  const taken = a.activity_participants?.length ?? 0
  const remaining = Math.max(a.max_participants - taken, 0)
  const spotsText =
    remaining === 0
      ? "FULL"
      : remaining === 1
        ? "Need 1"
        : `${remaining} spots`

  return {
    id: a.id,
    status,
    time,
    sport: a.sports?.name ?? "Sport",
    location: a.location,
    spotsText,
    href: "/feed",
  }
}

// ── Static content ──────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    timestamp: "17:42",
    headline: "Maya posts a 5-a-side.",
    body: "Pick a sport, a time, a location. Set how many players you need. Done in under a minute.",
    sport: "Football",
  },
  {
    timestamp: "18:03",
    headline: "Three players join.",
    body: "Nearby players see the fixture, request to join, and the team sheet starts to fill.",
    sport: "TeamSheet" as const, // sentinel — renders the team-sheet graphic instead of a photo
  },
  {
    timestamp: "19:30",
    headline: "Kick-off.",
    body: "You meet your new teammates, play the game, and lock in a habit with people who keep you accountable.",
    sport: "Running",
  },
] as const

const SPORT_GALLERY = [
  "Football",
  "Tennis",
  "Basketball",
  "Running",
  "Padel",
  "Boxing",
  "Cycling",
  "Yoga",
  "Swimming",
  "Volleyball",
] as const

// Mock community roster — replace with real profile data in V2.
const COMMUNITY_ROSTER = [
  { name: "Maya Hernandez", neighbourhood: "Hackney", sports: "Football, Tennis" },
  { name: "Tom Kettering", neighbourhood: "Islington", sports: "Padel, Squash" },
  { name: "Aly Sokolov", neighbourhood: "Bethnal Green", sports: "Boxing" },
  { name: "Jordan Park", neighbourhood: "Stratford", sports: "Basketball" },
  { name: "Devon Carr", neighbourhood: "Hackney Wick", sports: "Cycling, Run Club" },
  { name: "Riya Patel", neighbourhood: "Shoreditch", sports: "Yoga, Pilates" },
  { name: "Sam Okafor", neighbourhood: "Dalston", sports: "Football" },
  { name: "Eden Liu", neighbourhood: "Walthamstow", sports: "Tennis" },
] as const

// ─────────────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const signedIn = await getSignedIn()
  const dbFixtures = await fetchUpcomingFixtures()
  const tickerFixtures = dbFixtures.map(toTickerFixture)
  const weekFixtures = tickerFixtures.slice(0, 6)

  return (
    <>
      <IntroStinger />
      <PageShell signedIn={signedIn} homeHref="/">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section>
        <PhotoHero
          src="/images/sports/football.jpg"
          alt="Players on a floodlit pitch at dusk"
          priority
          kenBurns
          className="min-h-[80vh] sm:min-h-[88vh] lg:min-h-[92vh]"
        >
          <div className="h-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col justify-end pb-12 sm:pb-16">
            <h1 className="t-display-xl text-paper">
              Find.
              <br />
              The game.
            </h1>

            <div className="mt-8 mb-6 max-w-md text-paper/40">
              <FieldLine sport="football" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <p className="t-eyebrow text-paper/70">
                Est. 2026 / 15 sports / Local / Free
              </p>

              <Link
                href={signedIn ? "/feed" : "/login?mode=signup"}
                className="inline-flex items-center gap-2 self-start sm:self-end px-6 py-3 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono transition-colors"
              >
                {signedIn ? "View tonight's games" : "Join PeerFit"}
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </PhotoHero>
      </section>

      {/* ── 2. LIVE TICKER ──────────────────────────────────────────────── */}
      <LiveTicker
        fixtures={tickerFixtures.slice(0, 8)}
        emptyHref={signedIn ? "/feed" : "/login?mode=signup"}
        emptyLabel={
          signedIn
            ? "Be the first to post a game tonight"
            : "Join free to post the first game tonight"
        }
      />

      {/* ── 3. HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeader
            eyebrow="How it works"
            heading={
              <>
                From post
                <br />
                to pitch.
              </>
            }
            sub="Most games come together in under an hour. One fixture, three steps."
            size="lg"
          />

          <div className="mt-16 sm:mt-24 flex flex-col gap-20 sm:gap-32">
            {HOW_IT_WORKS.map((step, i) => (
              <HowItWorksRow key={step.timestamp} step={step} reverse={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. THIS WEEK'S FIXTURES ─────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-muted/40 border-y border-border">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeader
            eyebrow="This week"
            heading="Real games. Real demand."
            sub="Pulled live from the platform. These fixtures need players right now."
            size="md"
            action={
              <Link
                href={signedIn ? "/feed" : "/login?mode=signup"}
                className="t-mono text-foreground hover:text-brand-pitch transition-colors inline-flex items-center gap-2"
              >
                {signedIn ? "Open feed" : "See all fixtures"}
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            }
          />

          <div className="mt-12">
            <FixtureList
              fixtures={weekFixtures}
              emptyText="Quiet week — most games go up after work hours. Be the first to post one."
            />
          </div>
        </div>
      </section>

      {/* ── 5. EVERY SPORT — portrait gallery ───────────────────────────── */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeader
            eyebrow="Every sport"
            heading={
              <>
                One brand.
                <br />
                Fifteen games.
              </>
            }
            sub="Photography differentiates the sport. The system stays the same — so PeerFit always feels like PeerFit."
            size="lg"
          />
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 px-5 sm:px-8 lg:px-12">
            {SPORT_GALLERY.map((sport) => (
              <SportPortrait key={sport} sport={sport} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. COMMUNITY — team sheet ───────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-muted/40 border-y border-border">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeader
            eyebrow="The community"
            heading="Built by players,
              for players."
            sub="Real members across London. Find people who play your sport in your neighbourhood."
            size="md"
          />

          <ul className="mt-12 divide-y divide-border border-y border-border">
            {COMMUNITY_ROSTER.map((member, i) => (
              <li
                key={member.name}
                className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_2fr_2fr_2fr] items-center gap-4 sm:gap-8 py-4 sm:py-5"
              >
                <span className="t-mono text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="t-heading text-foreground">{member.name}</span>
                <span className="t-mono text-muted-foreground hidden sm:block">
                  {member.neighbourhood}
                </span>
                <span className="t-mono text-foreground hidden sm:block text-right">
                  {member.sports}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 7. FINAL CTA ────────────────────────────────────────────────── */}
      <section>
        <PhotoHero
          src="/images/sports/running.jpg"
          alt="Runners at sunrise"
          className="min-h-[60vh] sm:min-h-[72vh]"
        >
          <div className="h-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center">
            <p className="t-eyebrow text-brand-amber">Get in</p>
            <h2 className="t-display-lg text-paper mt-4">
              Your next game
              <br />
              is forming.
            </h2>
            <Link
              href={signedIn ? "/feed" : "/login?mode=signup"}
              className="inline-flex items-center gap-2 mt-10 px-8 py-4 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono transition-colors"
            >
              {signedIn ? "View tonight's games" : "Join PeerFit"}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </PhotoHero>
      </section>

      </PageShell>
    </>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function HowItWorksRow({
  step,
  reverse,
}: {
  step: (typeof HOW_IT_WORKS)[number]
  reverse: boolean
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      <div className={reverse ? "lg:order-2" : "lg:order-1"}>
        <p className="t-mono text-brand-amber">{step.timestamp}</p>
        <h3 className="t-display-md text-foreground mt-3">{step.headline}</h3>
        <p className="t-body text-muted-foreground mt-4 max-w-md">{step.body}</p>
      </div>
      <div
        className={`relative aspect-[4/5] sm:aspect-[5/4] ${reverse ? "lg:order-1" : "lg:order-2"}`}
      >
        {step.sport === "TeamSheet" ? (
          <MockTeamSheet />
        ) : (
          <PhotoHero
            src={getSportImage(step.sport).src}
            alt={`${step.sport} fixture`}
            position={getSportImage(step.sport).position}
            className="absolute inset-0"
          />
        )}
      </div>
    </div>
  )
}

/**
 * In-context preview of the team-sheet feature, rendered for Step 2.
 * Inline for landing only — extracted into the real <TeamSheet /> primitive
 * in Phase 3 (fixture detail).
 */
function MockTeamSheet() {
  const players = [
    { num: "01", name: "Maya Hernandez", role: "Host" },
    { num: "02", name: "Tom Kettering", role: "Intermediate" },
    { num: "03", name: "Aly Sokolov", role: "Beginner" },
    { num: "04", name: "Jordan Park", role: "Intermediate" },
  ]
  return (
    <div className="absolute inset-0 bg-ink text-paper p-6 sm:p-8 flex flex-col">
      <p className="t-eyebrow text-brand-amber">Team sheet</p>
      <p className="t-mono text-paper/70 mt-1">7 / 10</p>

      <ul className="mt-6 flex-1 flex flex-col gap-3">
        {players.map((p) => (
          <li
            key={p.num}
            className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-stone-800 pb-3"
          >
            <span className="t-mono text-paper/60">{p.num}</span>
            <span className="t-heading text-paper">{p.name}</span>
            <span className="t-mono text-paper/60">{p.role}</span>
          </li>
        ))}
        <li className="grid grid-cols-[auto_1fr] items-baseline gap-4">
          <span className="t-mono text-paper/40">05</span>
          <span className="t-mono text-paper/40">— open —</span>
        </li>
        <li className="grid grid-cols-[auto_1fr] items-baseline gap-4">
          <span className="t-mono text-paper/40">06</span>
          <span className="t-mono text-paper/40">— open —</span>
        </li>
      </ul>
    </div>
  )
}

function SportPortrait({ sport }: { sport: string }) {
  const img = getSportImage(sport)
  return (
    <div className="snap-center shrink-0 w-[260px] sm:w-[320px] lg:w-[360px] aspect-[3/4] relative">
      <PhotoHero
        src={img.src}
        alt={`${sport} on PeerFit`}
        position={img.position}
        className="absolute inset-0"
      >
        <div className="h-full p-6 flex flex-col justify-end">
          <p className="t-eyebrow text-paper/70">Sport</p>
          <p className="t-display-sm text-paper mt-2">{sport}</p>
        </div>
      </PhotoHero>
    </div>
  )
}
