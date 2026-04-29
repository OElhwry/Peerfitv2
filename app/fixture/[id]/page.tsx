/**
 * Fixture Detail — /fixture/[id]
 *
 * Phase 3: the first in-app surface on the editorial chrome.
 *
 * Read-mostly view for V1. Join/leave is the one available action; edit
 * and delete remain on the legacy feed UI until Phase 4 unifies them.
 *
 * The existing feed inline modal stays untouched — Phase 4 will swap its
 * activity-detail rendering for a link to this route, then delete the
 * modal entirely.
 */

import { FieldLine } from "@/components/peerfit/field-line"
import { FixtureMetaBlock, type MetaItem } from "@/components/peerfit/fixture-meta-block"
import { PageShell } from "@/components/peerfit/page-shell"
import { PhotoHero } from "@/components/peerfit/photo-hero"
import { TeamSheet, type TeamSheetPlayer } from "@/components/peerfit/team-sheet"
import { getSignedIn } from "@/lib/auth"
import { getFieldLineSport, getSportImage } from "@/lib/sport-image"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { JoinButton } from "./join-button"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const fixture = await fetchFixture(id)
  if (!fixture) return { title: "Activity Not Found" }

  const sport = fixture.sports?.name ?? "Sport"
  const date = new Date(`${fixture.date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  return {
    title: fixture.title,
    description: `${sport} activity in ${fixture.location} on ${date}. ${fixture.activity_participants.length}/${fixture.max_participants} players — ${fixture.skill_level} level.`,
    openGraph: {
      title: fixture.title,
      description: `Join this ${sport} game in ${fixture.location} on ${date}.`,
      type: "website",
    },
  }
}

type FixtureRow = {
  id: string
  title: string
  description: string | null
  location: string
  date: string
  time: string
  duration_minutes: number
  max_participants: number
  skill_level: string
  host_id: string
  visibility: string
  status: string
  created_at: string
  sports: { name: string; emoji: string } | null
  host: { full_name: string | null; avatar_url: string | null } | null
  activity_participants: {
    user_id: string
    profiles: { full_name: string | null; avatar_url: string | null } | null
  }[]
}

async function fetchFixture(id: string): Promise<FixtureRow | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("activities")
      .select(
        `id, title, description, location, date, time, duration_minutes,
         max_participants, skill_level, host_id, visibility, status, created_at,
         sports(name, emoji),
         host:profiles!host_id(full_name, avatar_url),
         activity_participants(user_id, profiles:user_id(full_name, avatar_url))`
      )
      .eq("id", id)
      .maybeSingle()
    return (data as unknown as FixtureRow) ?? null
  } catch {
    return null
  }
}

function formatLongDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export default async function FixturePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [signedIn, fixture] = await Promise.all([getSignedIn(), fetchFixture(id)])

  if (!fixture) notFound()

  const sportImage = getSportImage(fixture.sports?.name)
  const fieldSport = getFieldLineSport(fixture.sports?.name)

  // Promote the host to the top of the team sheet, mark them as host.
  const hostParticipant = fixture.activity_participants.find(
    (ap) => ap.user_id === fixture.host_id
  )
  const otherParticipants = fixture.activity_participants.filter(
    (ap) => ap.user_id !== fixture.host_id
  )

  const players: TeamSheetPlayer[] = [
    ...(hostParticipant
      ? [
          {
            id: hostParticipant.user_id,
            name: hostParticipant.profiles?.full_name ?? fixture.host?.full_name ?? null,
            avatar: hostParticipant.profiles?.avatar_url ?? fixture.host?.avatar_url ?? null,
            isHost: true,
          },
        ]
      : []),
    ...otherParticipants.map((ap) => ({
      id: ap.user_id,
      name: ap.profiles?.full_name ?? null,
      avatar: ap.profiles?.avatar_url ?? null,
      role: fixture.skill_level,
    })),
  ]

  const fixtureMeta: MetaItem[] = [
    { label: "Date", value: formatLongDate(fixture.date) },
    { label: "Kick-off", value: fixture.time.slice(0, 5) },
    { label: "Duration", value: formatDuration(fixture.duration_minutes) },
    { label: "Skill level", value: fixture.skill_level },
  ]

  const venueMeta: MetaItem[] = [
    { label: "Location", value: fixture.location },
    { label: "Sport", value: fixture.sports?.name ?? "—" },
    {
      label: "Visibility",
      value: fixture.visibility === "public" ? "Open to all" : "Invite only",
    },
  ]

  const dateLine = `${formatLongDate(fixture.date).toUpperCase()} · ${fixture.time.slice(0, 5)}`

  return (
    <PageShell mode="app" signedIn={signedIn}>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section>
        <PhotoHero
          src={sportImage.src}
          alt={`${fixture.sports?.name ?? "Sport"} fixture at ${fixture.location}`}
          position={sportImage.position}
          priority
          className="min-h-[56vh] sm:min-h-[64vh]"
        >
          <div className="h-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col justify-end pb-10 sm:pb-14">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 t-mono text-paper/70 hover:text-paper transition-colors mb-6 self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Back to feed
            </Link>
            <p className="t-mono text-brand-amber">{dateLine}</p>
            <h1 className="t-display-lg text-paper mt-3">{fixture.title}</h1>
            <div className="mt-6 max-w-md text-paper/40">
              <FieldLine sport={fieldSport} />
            </div>
          </div>
        </PhotoHero>
      </section>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col gap-12 sm:gap-16">

          <FixtureMetaBlock fixture={fixtureMeta} venue={venueMeta} />

          {fixture.description && (
            <div>
              <p className="t-eyebrow text-muted-foreground pb-3 border-b border-border">
                From the host
              </p>
              <p className="t-body text-foreground italic mt-4 max-w-2xl">
                &ldquo;{fixture.description}&rdquo;
              </p>
            </div>
          )}

          <TeamSheet
            players={players}
            capacity={fixture.max_participants}
          />

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-4 border-t border-border">
            {signedIn ? (
              <JoinButton
                fixtureId={fixture.id}
                hostId={fixture.host_id}
                capacity={fixture.max_participants}
                filled={fixture.activity_participants.length}
              />
            ) : (
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono transition-colors w-full sm:w-auto"
              >
                Join PeerFit to play →
              </Link>
            )}

            <p className="t-meta text-muted-foreground sm:ml-auto">
              Posted{" "}
              {new Date(fixture.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>

        </div>
      </section>
    </PageShell>
  )
}
