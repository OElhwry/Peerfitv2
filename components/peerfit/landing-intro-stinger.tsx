"use client"

/**
 * LandingIntroStinger — landing-only cold-open stinger.
 *
 *   0.0s   "FIND • JOIN • PLAY" — verbs stagger in (fade-up + blur clear)
 *   1.1s   verbs lift out
 *   1.3s   wordmark "peerfit" appears, hidden behind a pitch-green block
 *   1.5s   block recedes right-to-left (curtain wipe), wordmark revealed
 *   2.05s  tagline fades in
 *   2.4s   whole stinger lifts up + fades, page revealed beneath
 *   3.0s   done
 *
 * Discipline (matches the existing IntroStinger pattern):
 *   - sessionStorage-scoped (own key — does not collide with fixture stinger)
 *   - skippable on click / keypress
 *   - prefers-reduced-motion: skipped, marked seen
 *   - locks body scroll while playing
 *
 * Keyframes live in globals.css under "pf-stinger-*".
 */

import { useEffect, useState } from "react"

const STORAGE_KEY = "peerfit_landing_intro_seen"
const TOTAL_MS = 3000

type Phase = "checking" | "playing" | "done"

export function LandingIntroStinger() {
  const [phase, setPhase] = useState<Phase>("checking")

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setPhase("done")
        return
      }
    } catch {
      // private mode — play once anyway
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try { sessionStorage.setItem(STORAGE_KEY, "1") } catch {}
      setPhase("done")
      return
    }

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

  useEffect(() => {
    if (phase !== "playing") return
    const onKey = () => handleSkip()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase !== "playing") return null

  const verbs = ["FIND", "•", "JOIN", "•", "PLAY"] as const

  return (
    <div
      aria-hidden
      onClick={handleSkip}
      className="fixed inset-0 z-[9999] bg-ink cursor-pointer overflow-hidden"
      style={{
        animation: "pf-stinger-lift 600ms cubic-bezier(.7,0,.3,1) 2400ms forwards",
      }}
    >
      {/* ── Phase A — verb chain ─────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="flex items-baseline gap-3 sm:gap-5">
          {verbs.map((v, i) => {
            const isBullet = v === "•"
            return (
              <span
                key={i}
                className={isBullet ? "text-brand-pitch" : "text-paper"}
                style={{
                  fontFamily: "var(--font-big-shoulders), system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: isBullet
                    ? "clamp(36px, 7vw, 88px)"
                    : "clamp(48px, 10vw, 128px)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.02em",
                  display: "inline-block",
                  opacity: 0,
                  animation:
                    `pf-stinger-verb 600ms cubic-bezier(.22,1,.36,1) ${i * 130}ms forwards, ` +
                    `pf-stinger-verb-out 300ms cubic-bezier(.7,0,.3,1) 1100ms forwards`,
                }}
              >
                {v}
              </span>
            )
          })}
        </div>
      </div>

      {/* ── Phase B — wordmark with wipe reveal ──────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div
          className="relative inline-block leading-none"
          style={{
            opacity: 0,
            animation: "pf-stinger-fade-in 200ms 1300ms forwards",
          }}
        >
          <span
            className="block text-paper select-none"
            style={{
              fontFamily: "var(--font-big-shoulders), system-ui, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(72px, 16vw, 220px)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
              textTransform: "lowercase",
            }}
          >
            peerfit
          </span>
          <span
            aria-hidden
            className="absolute top-0 right-0 bottom-0 bg-brand-pitch"
            style={{
              width: "100%",
              animation: "pf-stinger-wipe 800ms cubic-bezier(.7,0,.2,1) 1500ms forwards",
            }}
          />
        </div>

        <span
          className="t-eyebrow text-paper/40 mt-5 sm:mt-7"
          style={{
            opacity: 0,
            animation: "pf-stinger-tagline 500ms cubic-bezier(.22,1,.36,1) 2050ms forwards",
          }}
        >
          THE GAME IS WAITING
        </span>
      </div>

      {/* ── Skip hint ───────────────────────────────────────────────── */}
      <p
        className="absolute bottom-6 left-1/2 -translate-x-1/2 t-eyebrow text-paper/30"
        style={{
          opacity: 0,
          animation: "pf-stinger-fade-in 400ms 600ms forwards",
        }}
      >
        TAP TO SKIP
      </p>
    </div>
  )
}
