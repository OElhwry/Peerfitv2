"use client"

/**
 * JoinButton — client island for join/leave actions on the fixture page.
 *
 * Server-rendered page hands us the fixture id, host id, and capacity.
 * We reach back to Supabase from the browser to confirm the current
 * participant state, then mutate on click. router.refresh() re-runs the
 * server component so the team sheet stays in sync.
 *
 * Edit/delete (host actions) are deferred to V2 — hosts manage their own
 * fixtures via the legacy feed UI for now.
 */

import { createClient } from "@/lib/supabase/client"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type State = "loading" | "open" | "joined" | "submitting" | "host" | "full"

export function JoinButton({
  fixtureId,
  hostId,
  capacity,
  filled,
}: {
  fixtureId: string
  hostId: string
  capacity: number
  filled: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [state, setState] = useState<State>("loading")

  useEffect(() => {
    let cancelled = false

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (!cancelled) setState("open")
        return
      }

      if (user.id === hostId) {
        if (!cancelled) setState("host")
        return
      }

      const { data } = await supabase
        .from("activity_participants")
        .select("user_id")
        .eq("activity_id", fixtureId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (cancelled) return
      if (data) setState("joined")
      else if (filled >= capacity) setState("full")
      else setState("open")
    }

    check()
    return () => {
      cancelled = true
    }
  }, [fixtureId, hostId, capacity, filled, supabase])

  async function handleToggle() {
    if (state !== "open" && state !== "joined") return

    setState("submitting")
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    if (state === "joined") {
      await supabase
        .from("activity_participants")
        .delete()
        .eq("activity_id", fixtureId)
        .eq("user_id", user.id)
    } else {
      await supabase
        .from("activity_participants")
        .insert({ activity_id: fixtureId, user_id: user.id })
    }

    router.refresh()
  }

  if (state === "loading") {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-muted text-muted-foreground t-mono w-full sm:w-auto"
      >
        <Loader2 className="w-4 h-4 animate-spin" /> Loading
      </button>
    )
  }

  if (state === "host") {
    return (
      <p className="t-mono text-muted-foreground">
        You&apos;re hosting this fixture.
      </p>
    )
  }

  if (state === "full") {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-muted text-muted-foreground t-mono w-full sm:w-auto cursor-not-allowed"
      >
        Fixture full
      </button>
    )
  }

  if (state === "joined") {
    return (
      <button
        onClick={handleToggle}
        className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-brand-pitch text-brand-pitch hover:bg-brand-pitch hover:text-paper t-mono transition-colors w-full sm:w-auto"
      >
        <Check className="w-4 h-4" /> You&apos;re in — leave fixture
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={state === "submitting"}
      className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono transition-colors disabled:opacity-50 w-full sm:w-auto"
    >
      {state === "submitting" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : null}
      Request to join
      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
    </button>
  )
}
