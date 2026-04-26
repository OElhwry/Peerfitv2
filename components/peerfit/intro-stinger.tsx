"use client"

/**
 * IntroStinger — 2-second brand opening on first session visit.
 *
 * The "stadium scoreboard reveal" pattern: a fixture announces itself
 * (timestamp → sport → location), then resolves into the PEERFIT wordmark
 * with the field-line drawing beneath.
 *
 *   0.0s  TUE 19:30
 *   0.5s  FOOTBALL
 *   1.0s  VICTORIA PARK
 *   1.4s  PEERFIT (wordmark)
 *   1.5s  ──────── (field-line draws)
 *   2.0s  fade out, page revealed
 *
 * Discipline:
 *   - Session-scoped (sessionStorage) — runs once per browser session
 *   - Skippable on click, keypress, or Esc
 *   - prefers-reduced-motion: skipped entirely, marked seen
 *   - Mounted on landing only — deep links don't trigger it
 *
 * Keyframes live in globals.css under "pf-stinger-*".
 */

import { useEffect, useState } from "react"

const STORAGE_KEY = "peerfit_intro_seen"
const TOTAL_MS = 2300

type Phase = "checking" | "playing" | "done"

export function IntroStinger() {
  const [phase, setPhase] = useState<Phase>("checking")

  useEffect(() => {
    if (typeof window === "undefined") return

    // Already seen this session? Skip silently.
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setPhase("done")
        return
      }
    } catch {
      // If storage access fails (private mode), play once anyway.
    }

    // Reduced-motion users skip entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try { sessionStorage.setItem(STORAGE_KEY, "1") } catch {}
      setPhase("done")
      return
    }

    // Lock scroll while playing.
    setPhase("playing")
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const timeout = window.setTimeout(() => {
      try { sessionStorage.setItem(STORAGE_KEY, "1") } catch {}
      setPhase("done")
      document.body.style.overflow = previousOverflow
    }, TOTAL_MS)

    return () => {
      window.clearTimeout(timeout)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const handleSkip = () => {
    if (phase !== "playing") return
    try { sessionStorage.setItem(STORAGE_KEY, "1") } catch {}
    setPhase("done")
    document.body.style.overflow = ""
  }

  // Listen for Esc / any key to skip.
  useEffect(() => {
    if (phase !== "playing") return
    const onKey = () => handleSkip()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // handleSkip is stable for this lifecycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase !== "playing") return null

  return (
    <div
      aria-hidden
      onClick={handleSkip}
      className="fixed inset-0 z-[9999] bg-ink flex items-center justify-center cursor-pointer pf-stinger-fade"
    >
      <div className="flex flex-col items-center px-5">
        {/* ── Scoreboard line — three fixture parts swap in this slot ── */}
        <div className="relative h-10 sm:h-12 w-[280px] sm:w-[420px]">
          <span
            className="absolute inset-0 flex items-center justify-center t-mono-lg text-brand-amber opacity-0"
            style={{ animation: "pf-stinger-word 700ms 0ms forwards" }}
          >
            TUE 19:30
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center t-mono-lg text-paper opacity-0"
            style={{ animation: "pf-stinger-word 700ms 500ms forwards" }}
          >
            FOOTBALL
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center t-mono-lg text-paper opacity-0"
            style={{ animation: "pf-stinger-word 700ms 1000ms forwards" }}
          >
            VICTORIA PARK
          </span>
        </div>

        {/* ── Wordmark drops in ── */}
        <div className="mt-10 sm:mt-14 flex flex-col items-center">
          <span
            className="block t-display-lg text-paper opacity-0 leading-none"
            style={{ animation: "pf-stinger-wordmark 400ms 1400ms forwards" }}
          >
            PEERFIT
          </span>

          {/* ── Field-line draws beneath ── */}
          <span
            aria-hidden
            className="block h-px bg-paper mt-3 w-0"
            style={{ animation: "pf-stinger-line 600ms 1500ms forwards" }}
          />
        </div>

        {/* ── Skip hint, low-key ── */}
        <p
          className="t-eyebrow text-paper/30 mt-12 sm:mt-16 opacity-0"
          style={{ animation: "pf-stinger-fade-in 400ms 800ms forwards" }}
        >
          Tap to skip
        </p>
      </div>
    </div>
  )
}
