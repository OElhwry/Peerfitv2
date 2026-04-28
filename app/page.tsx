"use client"

import { BellRing, MapPin, MessageSquare, ShieldCheck, Trophy, type LucideIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { LandingIntroStinger } from "@/components/peerfit/landing-intro-stinger"

/**
 * PeerFit landing — seven-beat snap deck.
 *
 *   01  Cold open      — kinetic H1 + ambient drifting collage + live ticker
 *   02  The problem    — text-fragment slide-in, brand line punches
 *   03  Every sport    — sport names cascade in
 *   04  How it works   — POST / MATCH / PLAY ratchet reveal
 *   05  Core features  — feature list reveal (each row fades up + slight scale)
 *   06  Community      — quote slide-in from sides
 *   07  Full time      — letter rise on CTA
 *
 * Motion is ambient-only: photos drift on their own, ken-burns scales gently,
 * hover micro-interactions on links/CTAs. No cursor-following.
 *
 * Hero entrance is gated on the IntroStinger so the headline reveal lands as
 * a discrete moment after the stinger has lifted.
 */

/* ──────────────────────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────────────────────── */

const HERO_LINE_1 = "Somewhere in your city,"
const HERO_LINE_2 = "a game is starting."

const HERO_STINGER_LEAD_OUT_MS = 2700

const SPORTS_WITH_FORMATS: { name: string; tags: string }[] = [
  { name: "FOOTBALL.",   tags: "5-A-SIDE · 7-A-SIDE · 11-A-SIDE" },
  { name: "BASKETBALL.", tags: "3-ON-3 · PICKUP · LEAGUE" },
  { name: "TENNIS.",     tags: "SINGLES · DOUBLES · MIXED" },
  { name: "RUNNING.",    tags: "5K · 10K · TRAIL · MARATHON" },
]
const SPORTS_SECONDARY = "VOLLEYBALL / YOGA / BOXING / CYCLING / SWIMMING / RUGBY / PADEL / GYM"

const MARQUEE_LIVE = [
  "LIVE / 18 GAMES TONIGHT",
  "FOOTBALL — 5-A-SIDE",
  "342 PLAYERS NEARBY",
  "PADEL — MIXED DOUBLES",
  "FREE TO JOIN — FREE TO POST",
  "TENNIS — DOUBLES",
  "BASKETBALL — PICKUP",
  "YOGA — OUTDOOR",
  "RUGBY — TOUCH",
  "RUNNING — CASUAL",
  "CYCLING — GROUP RIDE",
  "BOXING — SPARRING",
] as const

const MARQUEE_VOICES = [
  "TWO WEEKS IN I KNEW EVERYONE — SAM, FOOTBALL",
  "KNEW THE REGULARS BY WEEK THREE — DAN, BASKETBALL",
  "MOVED CITIES, FOUND MY CREW IN A WEEK — LEAH, RUNNING",
  "POSTED A YOGA SESSION, EIGHT JOINED — AMINA, YOGA",
  "FIRST PADEL HIT — NOW A WEEKLY THING — RIA, PADEL",
  "SPARRING PARTNER TWICE A WEEK — KARL, BOXING",
  "FOUND A 6-A-SIDE LEAGUE FIVE MINUTES AWAY — TOM, FOOTBALL",
  "CASUAL TENNIS TURNED INTO A FOURBALL — MAX, TENNIS",
] as const

const STEPS = [
  { n: "01", verb: "POST",  line: "Pick a sport. Pick a time. Set how many you need." },
  { n: "02", verb: "MATCH", line: "Nearby players see it and request to join." },
  { n: "03", verb: "PLAY",  line: "Show up. Meet your teammates. Build the habit." },
] as const

const FEATURES: { n: string; icon: LucideIcon; title: string; desc: string }[] = [
  { n: "01", icon: MapPin,         title: "Local pickup games", desc: "Discover or post nearby games. Live capacity, instant join, status updates." },
  { n: "02", icon: MessageSquare,  title: "Built-in event chat", desc: "A channel per game. Plan, coordinate, share details, without sharing numbers." },
  { n: "03", icon: BellRing,       title: "Smart reminders",     desc: "Auto-pings before kickoff so the squad turns up on time, every time." },
  { n: "04", icon: ShieldCheck,    title: "Reliability ratings", desc: "Sportsmanship and turnout scores build trust between players over time." },
  { n: "05", icon: Trophy,         title: "Achievements",        desc: "Unlock milestones for consistency, variety, and showing up. Stay motivated." },
]

const QUOTES = [
  {
    text: "Found a Sunday five-a-side league three streets from my flat. Two weeks in I knew everyone.",
    by: "SAM, FOOTBALL",
  },
  {
    text: "Posted a pickup basketball game three blocks from work. Knew the regulars by week three.",
    by: "DAN, BASKETBALL",
  },
] as const

/* ──────────────────────────────────────────────────────────────────────
   Hero entrance state — coordinates with the IntroStinger
   ────────────────────────────────────────────────────────────────────── */

type HeroState = { ready: boolean; delay: number; reduce: boolean }

function useHeroEntrance(): HeroState {
  const [hs, setHs] = useState<HeroState>({ ready: false, delay: 0, reduce: false })
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // Stinger always plays on every load, so always wait for it to finish.
    const delay = reduce ? 0 : HERO_STINGER_LEAD_OUT_MS
    setHs({ ready: true, delay, reduce })
  }, [])
  return hs
}

/* ──────────────────────────────────────────────────────────────────────
   Beat-reveal hook
   ────────────────────────────────────────────────────────────────────── */

function useBeatReveal<T extends HTMLElement>(
  apply: (root: T) => void,
  init?: (root: T) => void,
  threshold = 0.4,
) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    init?.(el)
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          apply(el)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

/* ── Beat 2 — quotes wipe in left-to-right via clip-path, punch rises ── */
function useBeatProblem() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      const eyebrow = el.querySelector<HTMLElement>("[data-eyebrow]")
      const frags = el.querySelectorAll<HTMLElement>("[data-frag]")
      const punch = el.querySelector<HTMLElement>("[data-punch]")

      if (eyebrow) { eyebrow.style.opacity = "1"; eyebrow.style.transform = "translateY(0)" }
      frags.forEach((frag, i) => {
        window.setTimeout(() => {
          frag.style.clipPath = "inset(0 0% 0 0)"
        }, 200 + i * 380)
      })
      window.setTimeout(() => {
        if (!punch) return
        punch.style.opacity = "1"
        punch.style.transform = "translateY(0) scale(1)"
        punch.style.filter = "blur(0)"
      }, 200 + frags.length * 380 + 180)
    },
    (el) => {
      const eyebrow = el.querySelector<HTMLElement>("[data-eyebrow]")
      const frags = el.querySelectorAll<HTMLElement>("[data-frag]")
      const punch = el.querySelector<HTMLElement>("[data-punch]")

      if (eyebrow) {
        eyebrow.style.opacity = "0"
        eyebrow.style.transform = "translateY(-12px)"
        eyebrow.style.transition = "opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1)"
      }
      frags.forEach((frag) => {
        frag.style.opacity = frag.dataset.targetOpacity || "1"
        frag.style.clipPath = "inset(0 100% 0 0)"
        frag.style.transition = "clip-path 1s cubic-bezier(.16,1,.3,1)"
      })
      if (punch) {
        punch.style.opacity = "0"
        punch.style.transform = "translateY(24px) scale(0.94)"
        punch.style.filter = "blur(6px)"
        punch.style.transition = "opacity 0.9s cubic-bezier(.22,1,.36,1), transform 0.9s cubic-bezier(.22,1,.36,1), filter 0.9s ease"
      }
    },
  )
}

/* ── Beat 3 — scoreboard flip: names rise up via clip-path ──────────── */
function useBeatSports() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      el.querySelectorAll<HTMLElement>("[data-sport]").forEach((item, i) => {
        window.setTimeout(() => {
          item.style.clipPath = "inset(0 0 0 0)"
          item.style.transform = "translateY(0)"
        }, 100 + i * 160)
      })
      const sub = el.querySelector<HTMLElement>("[data-sub]")
      if (sub) {
        window.setTimeout(() => {
          sub.style.opacity = "1"
          sub.style.transform = "translateY(0)"
        }, 100 + 4 * 160 + 100)
      }
    },
    (el) => {
      el.querySelectorAll<HTMLElement>("[data-sport]").forEach((item) => {
        item.style.clipPath = "inset(100% 0 0 0)"
        item.style.transform = "translateY(10px)"
        item.style.transition = "clip-path 0.65s cubic-bezier(.16,1,.3,1), transform 0.65s cubic-bezier(.16,1,.3,1)"
      })
      const sub = el.querySelector<HTMLElement>("[data-sub]")
      if (sub) {
        sub.style.opacity = "0"
        sub.style.transform = "translateY(14px)"
        sub.style.transition = "opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1)"
      }
    },
  )
}

/* ── Beat 4 — three axes: num ← left, verb ↓ from above, line → right ── */
function useBeatHow() {
  return useBeatReveal<HTMLOListElement>(
    (el) => {
      el.querySelectorAll<HTMLElement>("[data-row]").forEach((row, i) => {
        const num = row.querySelector<HTMLElement>("[data-num]")
        const verb = row.querySelector<HTMLElement>("[data-verb]")
        const line = row.querySelector<HTMLElement>("[data-line]")
        const base = 80 + i * 300
        window.setTimeout(() => { if (num)  { num.style.opacity = "1";  num.style.transform = "translateX(0)" } }, base)
        window.setTimeout(() => { if (verb) { verb.style.opacity = "1"; verb.style.transform = "translateY(0)" } }, base + 80)
        window.setTimeout(() => { if (line) { line.style.opacity = "1"; line.style.transform = "translateX(0)" } }, base + 200)
      })
    },
    (el) => {
      el.querySelectorAll<HTMLElement>("[data-num]").forEach((n) => {
        n.style.opacity = "0"; n.style.transform = "translateX(-20px)"
        n.style.transition = "opacity 0.4s ease-out, transform 0.5s cubic-bezier(.22,1,.36,1)"
      })
      el.querySelectorAll<HTMLElement>("[data-verb]").forEach((v) => {
        v.style.opacity = "0"; v.style.transform = "translateY(-44px)"
        v.style.transition = "opacity 0.6s ease-out, transform 0.65s cubic-bezier(.22,1,.36,1)"
      })
      el.querySelectorAll<HTMLElement>("[data-line]").forEach((l) => {
        l.style.opacity = "0"; l.style.transform = "translateX(24px)"
        l.style.transition = "opacity 0.55s ease-out, transform 0.6s cubic-bezier(.22,1,.36,1)"
      })
    },
  )
}

/* ── Beat 5 — head rises, feature rows sweep in from right ──────────── */
function useBeatFeatures() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      const head = el.querySelector<HTMLElement>("[data-head]")
      if (head) { head.style.opacity = "1"; head.style.transform = "translateY(0)" }
      el.querySelectorAll<HTMLElement>("[data-feature]").forEach((row, i) => {
        window.setTimeout(() => {
          row.style.opacity = "1"
          row.style.transform = "translateX(0)"
        }, 240 + i * 110)
      })
    },
    (el) => {
      const head = el.querySelector<HTMLElement>("[data-head]")
      if (head) {
        head.style.opacity = "0"
        head.style.transform = "translateY(20px)"
        head.style.transition = "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)"
      }
      el.querySelectorAll<HTMLElement>("[data-feature]").forEach((row) => {
        row.style.opacity = "0"
        row.style.transform = "translateX(48px)"
        row.style.transition = "opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)"
      })
    },
  )
}

/* ── Beat 6 — headline clips in, quotes drop from above ─────────────── */
function useBeatCommunity() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      const head = el.querySelector<HTMLElement>("[data-head]")
      if (head) {
        head.style.clipPath = "inset(0 0% 0 0)"
        head.style.opacity = "1"
      }
      el.querySelectorAll<HTMLElement>("[data-quote]").forEach((q, i) => {
        window.setTimeout(() => {
          q.style.opacity = "1"
          q.style.transform = "translateY(0)"
        }, 400 + i * 200)
      })
      const stats = el.querySelector<HTMLElement>("[data-stats]")
      if (stats) {
        window.setTimeout(() => {
          stats.style.opacity = "1"
          stats.style.transform = "translateY(0)"
        }, 400 + 2 * 200 + 150)
      }
    },
    (el) => {
      const head = el.querySelector<HTMLElement>("[data-head]")
      if (head) {
        head.style.opacity = "1"
        head.style.clipPath = "inset(0 100% 0 0)"
        head.style.transition = "clip-path 1.1s cubic-bezier(.16,1,.3,1)"
      }
      el.querySelectorAll<HTMLElement>("[data-quote]").forEach((q) => {
        q.style.opacity = "0"
        q.style.transform = "translateY(-48px)"
        q.style.transition = "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1)"
      })
      const stats = el.querySelector<HTMLElement>("[data-stats]")
      if (stats) {
        stats.style.opacity = "0"
        stats.style.transform = "translateY(16px)"
        stats.style.transition = "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)"
      }
    },
  )
}

/* ── Beat 7 — eyebrow → letter rise → CTA scales in ─────────────────── */
function useBeatFullTime() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      const eyebrow = el.querySelector<HTMLElement>("[data-eyebrow]")
      const sub = el.querySelector<HTMLElement>("[data-sub]")
      const cta = el.querySelector<HTMLElement>("[data-cta]")
      const signin = el.querySelector<HTMLElement>("[data-signin]")
      if (eyebrow) { eyebrow.style.opacity = "1"; eyebrow.style.transform = "translateY(0)" }
      const letters = el.querySelectorAll<HTMLElement>("[data-letter]")
      letters.forEach((l, i) => {
        l.style.animation = `pf-letter-rise 0.85s cubic-bezier(.22,1,.36,1) ${250 + i * 50}ms both`
      })
      const tail = 250 + letters.length * 50
      window.setTimeout(() => { if (sub)    { sub.style.opacity = "1";    sub.style.transform = "translateY(0)" } }, tail + 200)
      window.setTimeout(() => { if (cta)    { cta.style.opacity = "1";    cta.style.transform = "scale(1)" } },     tail + 380)
      window.setTimeout(() => { if (signin) { signin.style.opacity = "1" } },                                       tail + 600)
    },
    (el) => {
      const eyebrow = el.querySelector<HTMLElement>("[data-eyebrow]")
      const sub = el.querySelector<HTMLElement>("[data-sub]")
      const cta = el.querySelector<HTMLElement>("[data-cta]")
      const signin = el.querySelector<HTMLElement>("[data-signin]")
      if (eyebrow) {
        eyebrow.style.opacity = "0"; eyebrow.style.transform = "translateY(-10px)"
        eyebrow.style.transition = "opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1)"
      }
      el.querySelectorAll<HTMLElement>("[data-letter]").forEach((l) => { l.style.opacity = "0" })
      if (sub) {
        sub.style.opacity = "0"; sub.style.transform = "translateY(12px)"
        sub.style.transition = "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)"
      }
      if (cta) {
        cta.style.opacity = "0"; cta.style.transform = "scale(0.94)"
        cta.style.transition = "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.34,1.56,.64,1)"
      }
      if (signin) {
        signin.style.opacity = "0"
        signin.style.transition = "opacity 0.6s cubic-bezier(.22,1,.36,1)"
      }
    },
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const hero = useHeroEntrance()
  const beatProblemRef   = useBeatProblem()
  const beatSportsRef    = useBeatSports()
  const beatHowRef       = useBeatHow()
  const beatFeaturesRef  = useBeatFeatures()
  const beatCommunityRef = useBeatCommunity()
  const beatFullTimeRef  = useBeatFullTime()

  return (
    <>
      <LandingIntroStinger />

      <div className="h-screen overflow-hidden bg-ink">

        {/* Subtle gradient fade so header content stays legible against any beat */}
        <div
          aria-hidden
          className="fixed top-0 left-0 right-0 h-24 z-[79] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, oklch(0.18 0.005 60 / 0.55) 0%, oklch(0.18 0.005 60 / 0.15) 60%, transparent 100%)" }}
        />

        {/* Persistent header — visible across every beat */}
        <header className="fixed top-0 left-0 right-0 z-[80] flex items-center justify-between px-5 sm:px-10 py-4 sm:py-5 pointer-events-none">
          <Link href="/" className="t-eyebrow text-paper/80 hover:text-paper transition-colors pointer-events-auto">PEERFIT</Link>
          <nav className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
            <Link href="/login" className="t-eyebrow text-paper/70 hover:text-paper transition-colors">
              LOG IN
            </Link>
            <Link
              href="/login?mode=signup"
              className="t-eyebrow text-paper border border-paper/45 px-3 py-2 hover:bg-paper hover:text-ink hover:border-paper transition-colors"
            >
              JOIN &gt;
            </Link>
          </nav>
        </header>

        <div
          className="h-screen overflow-y-scroll snap-y snap-mandatory [overscroll-behavior-y:contain]"
          aria-label="PeerFit landing"
        >

          {/* ════════════════════════════════════════════
              01 / COLD OPEN
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start flex flex-col justify-between overflow-hidden bg-ink text-paper">

            {/* Ambient backdrop — pitch-green radial breath */}
            <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="pf-hero-breath absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.55 0.14 158 / 0.18) 0%, transparent 65%)",
                  animation: "pf-hero-breath 10s ease-in-out infinite",
                }}
              />
            </div>

            {/* Centre content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 text-center">
              <p className="t-eyebrow text-brand-pitch mb-5 sm:mb-7">
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-pitch pf-glow-pulse" />
                  LIVE / 18 GAMES TONIGHT
                </span>
              </p>

              <h1 className="t-display-lg text-paper max-w-[20ch]">
                <KineticLine text={HERO_LINE_1} accentChar="," startMs={400} stepMs={70} hero={hero} />
                <br />
                <KineticLine text={HERO_LINE_2} accentChar="." startMs={800} stepMs={70} hero={hero} />
              </h1>

              <p
                className="t-sub text-paper/65 mt-5 sm:mt-7 max-w-md"
                style={{
                  opacity: hero.reduce ? 1 : 0,
                  animation: hero.ready && !hero.reduce
                    ? `pf-stinger-tagline 700ms cubic-bezier(.22,1,.36,1) ${hero.delay + 1450}ms forwards`
                    : undefined,
                }}
              >
                Post a game. Find players. Show up. No WhatsApp groups, no waitlists - just local sport, tonight.
              </p>

              <div
                className="mt-7 sm:mt-9 inline-block"
                style={{
                  opacity: hero.reduce ? 1 : 0,
                  animation: hero.ready && !hero.reduce
                    ? `pf-stinger-tagline 700ms cubic-bezier(.22,1,.36,1) ${hero.delay + 1750}ms forwards`
                    : undefined,
                }}
              >
                <Link
                  href="/login?mode=signup"
                  className="group inline-flex items-baseline gap-3 t-mono-lg text-brand-pitch border-b border-brand-pitch pb-1 hover:text-paper hover:border-paper transition-colors"
                >
                  FIND TONIGHT&apos;S GAME
                  <span className="inline-block group-hover:translate-x-1 transition-transform">&gt;</span>
                </Link>
              </div>
            </div>

            {/* Bottom block — marquee + meta strip */}
            <div
              className="relative z-10"
              style={{
                opacity: hero.reduce ? 1 : 0,
                animation: hero.ready && !hero.reduce
                  ? `pf-stinger-tagline 700ms cubic-bezier(.22,1,.36,1) ${hero.delay + 2050}ms forwards`
                  : undefined,
              }}
            >
              <EditorialMarquee items={MARQUEE_LIVE} tone="dark" />
              <footer className="flex items-end justify-between px-5 sm:px-10 pt-4 sm:pt-5 pb-5 sm:pb-7">
                <span className="t-mono text-paper/40">FREE TO JOIN</span>
                <span className="t-eyebrow text-paper/40 inline-flex items-center gap-2">
                  SCROLL
                  <span className="inline-block w-px h-3 bg-paper/40" />
                </span>
                <span className="t-mono text-paper/40">01 / 07</span>
              </footer>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              02 / THE PROBLEM
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-ink flex flex-col items-center px-5 py-8 sm:py-12 overflow-hidden isolate">
            <BeatWatermark n="02" position="bottom-2 -right-4 sm:-bottom-16 sm:-right-8" tone="dark" />
            {/* Decorative oversized quote mark */}
            <div aria-hidden className="absolute -top-4 -left-2 sm:left-4 leading-none pointer-events-none select-none text-paper/[0.04]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(180px, 40vw, 440px)" }}>
              &ldquo;
            </div>
            <div ref={beatProblemRef} className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl">
              <span data-eyebrow className="t-eyebrow text-paper/40 mb-6 sm:mb-9">02 / WHY THIS EXISTS</span>

              <p
                data-frag data-target-opacity="0.35"
                className="t-display-sm text-paper/35 text-center max-w-[20ch]"
                style={{ fontSize: "clamp(32px, 5.2vw, 60px)", lineHeight: "1.05" }}
              >
                &ldquo;one more for football tonight?&rdquo;
              </p>
              <p
                data-frag data-target-opacity="0.55"
                className="t-display-sm text-paper/55 text-center max-w-[20ch] mt-4 sm:mt-5"
                style={{ fontSize: "clamp(32px, 5.2vw, 60px)", lineHeight: "1.05" }}
              >
                &ldquo;need a 4th for padel.&rdquo;
              </p>
              <p
                data-frag data-target-opacity="0.85"
                className="t-display-sm text-paper/85 text-center max-w-[20ch] mt-4 sm:mt-5"
                style={{ fontSize: "clamp(32px, 5.2vw, 60px)", lineHeight: "1.05" }}
              >
                &ldquo;anyone free sunday?&rdquo;
              </p>

              <p
                data-punch
                className="t-display-lg text-brand-pitch text-center mt-9 sm:mt-10 max-w-[14ch]"
                style={{ fontSize: "clamp(40px, 7vw, 88px)", lineHeight: "0.96" }}
              >
                You&apos;ve waited<br />long enough.
              </p>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              03 / EVERY SPORT
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-brand-pitch text-ink flex flex-col justify-between px-5 py-6 sm:py-10 overflow-hidden isolate">
            <BeatWatermark n="03" position="top-2 -left-4 sm:-top-12 sm:-left-8" tone="pitch" />
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-ink/60">03 / EVERY SPORT</span>
              <span className="t-mono text-ink/60 hidden sm:block">15+ SPORTS / NEAR YOU</span>
            </div>

            <div ref={beatSportsRef} className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
              {SPORTS_WITH_FORMATS.map(({ name, tags }) => (
                <div key={name} data-sport className="flex items-baseline justify-between gap-4 sm:gap-8">
                  <p className="t-display-lg text-ink leading-[0.95]">{name}</p>
                  <span className="t-eyebrow text-ink/35 shrink-0 hidden sm:block">{tags}</span>
                </div>
              ))}
              <p data-sub className="t-sub text-ink/60 mt-5 sm:mt-7 max-w-md">
                Pick your sport. Post your slot. Find your people.
              </p>
            </div>

            <div className="flex items-end justify-between gap-4">
              <span className="t-mono text-ink/60 max-w-[70%] leading-relaxed">{SPORTS_SECONDARY}</span>
              <span className="t-eyebrow text-ink/60 shrink-0">+ MORE</span>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              04 / HOW IT WORKS
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-paper text-ink flex flex-col justify-between px-5 py-6 sm:py-10 overflow-hidden isolate">
            <BeatWatermark n="04" position="bottom-2 -right-4 sm:-bottom-16 sm:-right-8" tone="light" />
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-ink/50">04 / HOW IT WORKS</span>
              <span className="t-mono text-ink/50 hidden sm:block">UNDER A MINUTE</span>
            </div>

            <ol ref={beatHowRef} className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full space-y-8 sm:space-y-12">
              {STEPS.map(({ n, verb, line }) => (
                <li key={n} data-row className="grid grid-cols-12 gap-4 items-baseline">
                  <span data-num  className="t-mono text-brand-pitch col-span-2 sm:col-span-1">{n}</span>
                  <span data-verb className="t-display-md text-ink col-span-10 sm:col-span-4">{verb}.</span>
                  <span data-line className="t-sub text-ink/60 col-span-12 mt-1 sm:mt-0 sm:col-start-6 sm:col-span-7">{line}</span>
                </li>
              ))}
            </ol>

            <div className="flex items-end justify-between">
              <span className="t-mono text-ink/40">FREE TO JOIN / FREE TO POST</span>
              <span className="t-eyebrow text-ink/40">04 / 07</span>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              05 / CORE FEATURES
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-stone-200 text-ink flex flex-col justify-between px-5 py-6 sm:py-10 overflow-hidden isolate">
            <BeatWatermark n="05" position="top-2 -left-4 sm:-top-12 sm:-left-8" tone="light" />
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-ink/50">05 / CORE FEATURES</span>
              <span className="t-mono text-ink/50 hidden sm:block">WHAT YOU GET</span>
            </div>

            <div ref={beatFeaturesRef} className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 max-w-6xl mx-auto w-full content-center py-4">
              <div className="lg:col-span-5 lg:pt-2">
                <h2 data-head className="t-display-md text-ink">
                  Everything you need <span className="text-brand-pitch">to play</span>.
                </h2>
              </div>
              <ul className="lg:col-span-7 flex flex-col divide-y divide-ink/15 border-t border-b border-ink/15">
                {FEATURES.map(({ n, icon: Icon, title, desc }) => (
                  <li key={n} data-feature className="grid grid-cols-12 gap-3 py-2.5 sm:py-3.5">
                    <span className="t-mono text-brand-pitch col-span-2 sm:col-span-1 pt-2">{n}</span>
                    <div className="col-span-10 sm:col-span-11">
                      <h3 className="t-display-sm text-ink flex items-center gap-3 leading-none">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-brand-pitch" strokeWidth={1.75} />
                        <span>{title}</span>
                      </h3>
                      <p className="t-body text-ink/65 mt-1.5 leading-snug">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-end justify-between">
              <span className="t-mono text-ink/40">DESIGNED FOR PLAYERS</span>
              <span className="t-eyebrow text-ink/40">05 / 07</span>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              06 / COMMUNITY
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-paper text-ink flex flex-col justify-between px-5 py-6 sm:py-10 overflow-hidden isolate">
            <BeatWatermark n="06" position="bottom-2 -right-4 sm:-bottom-16 sm:-right-8" tone="light" />
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-ink/50">06 / COMMUNITY</span>
              <span className="t-mono text-ink/50 hidden sm:block">NOT A FEED</span>
            </div>

            <div ref={beatCommunityRef} className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
              <p data-head className="t-display-md text-ink max-w-[18ch]">
                A noticeboard for players, not algorithms.
              </p>

              <div className="mt-6 sm:mt-9 grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-3xl">
                {QUOTES.map(({ text, by }) => (
                  <blockquote key={by} data-quote className="border-l-2 border-brand-pitch pl-4">
                    <p className="t-sub text-ink leading-snug">&ldquo;{text}&rdquo;</p>
                    <span className="t-mono text-ink/50 mt-3 block">— {by}</span>
                  </blockquote>
                ))}
              </div>

              <div data-stats className="mt-8 sm:mt-10 flex gap-8 sm:gap-14 border-t border-ink/10 pt-6 sm:pt-8">
                {([["342", "PLAYERS NEARBY"], ["18", "GAMES TONIGHT"], ["15+", "SPORTS"]] as const).map(([n, label]) => (
                  <div key={label}>
                    <p className="t-display-sm text-brand-pitch leading-none">{n}</p>
                    <p className="t-eyebrow text-ink/40 mt-2">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="-mx-5">
              <EditorialMarquee items={MARQUEE_VOICES} tone="light" />
              <div className="flex items-end justify-between px-5 pt-4 sm:pt-5">
                <span className="t-mono text-ink/40">FREE / OPEN / LOCAL</span>
                <span className="t-eyebrow text-ink/40">06 / 07</span>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              07 / FULL TIME
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-ink text-paper flex flex-col justify-between px-5 py-6 sm:py-10 overflow-hidden isolate">
            <BeatWatermark n="07" position="bottom-2 -left-4 sm:-bottom-16 sm:-left-8" tone="dark" />
            <Image
              src="/images/peerfit-logo.png"
              alt=""
              width={480}
              height={320}
              aria-hidden
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-auto object-contain pointer-events-none select-none opacity-[0.05] [filter:brightness(0)_invert(1)] pf-drift-x -z-10"
            />
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-paper/50">07 / FULL TIME</span>
              <span className="t-mono text-paper/50 hidden sm:block">FREE TO JOIN</span>
            </div>

            <div ref={beatFullTimeRef} className="flex-1 flex flex-col items-center justify-center text-center">
              <p data-eyebrow className="t-eyebrow text-brand-pitch mb-5 sm:mb-7">FULL TIME WHISTLE</p>
              <h2 className="t-display-lg text-paper">
                <LetterRise text="Ready" />
                <br />
                <LetterRise text="to play?" startIndex={5} />
              </h2>
              <p data-sub className="t-sub text-paper/65 mt-5 sm:mt-7 max-w-sm">
                Join PeerFit free. Find a game in your area tonight.
              </p>
              <div data-cta className="mt-7 sm:mt-10">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-3 px-7 py-3.5 bg-brand-pitch text-paper t-mono-lg hover:bg-brand-pitch-hover transition-colors"
                >
                  FIND A GAME TONIGHT &gt;
                </Link>
              </div>
              <p data-signin className="t-meta text-paper/40 mt-4">
                Have an account?{" "}
                <Link href="/login" className="underline hover:text-paper transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <footer className="flex flex-wrap items-end justify-between gap-3">
              <span className="t-mono text-paper/40">&copy; {new Date().getFullYear()} PEERFIT</span>
              <nav className="flex flex-wrap gap-4">
                {[
                  { label: "PRIVACY", href: "/privacy" },
                  { label: "TERMS", href: "/terms" },
                  { label: "CONTACT", href: "/contact" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} className="t-mono text-paper/40 hover:text-paper transition-colors">
                    {label}
                  </Link>
                ))}
              </nav>
            </footer>
          </section>

        </div>
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   BeatWatermark — giant editorial page-number bleed. Sits behind
   in-flow content via -z-10; the parent section needs `isolate` to
   contain the negative z-index in its own stacking context.
   ────────────────────────────────────────────────────────────────────── */

function BeatWatermark({
  n,
  position,
  tone,
}: {
  n: string
  position: string
  tone: "dark" | "light" | "pitch"
}) {
  const colorClass =
    tone === "dark" ? "text-paper/5" :
    tone === "pitch" ? "text-ink/10" :
    "text-ink/5"
  return (
    <span
      aria-hidden
      className={`absolute -z-10 pointer-events-none select-none leading-[0.8] ${position} ${colorClass}`}
      style={{
        fontFamily: "var(--font-big-shoulders), system-ui, sans-serif",
        fontWeight: 900,
        fontSize: "clamp(260px, 38vw, 560px)",
        letterSpacing: "-0.04em",
      }}
    >
      {n}
    </span>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   EditorialMarquee — slow ticker, mono caps, hairline separators.
   Two tones: "dark" (ink bg, paper text) for cold-open live signals,
   "light" (paper bg, ink text) for community voices on beat 06.
   Pulsing pitch dot only on items that start with "LIVE".
   ────────────────────────────────────────────────────────────────────── */

function EditorialMarquee({
  items,
  tone = "dark",
}: {
  items: readonly string[]
  tone?: "dark" | "light"
}) {
  const doubled = [...items, ...items]
  const dark = tone === "dark"
  return (
    <div className={`relative overflow-hidden border-y ${dark ? "border-paper/10" : "border-ink/10"}`}>
      <div
        aria-hidden
        className={`absolute inset-y-0 left-0 w-24 z-10 pointer-events-none ${
          dark ? "bg-gradient-to-r from-ink to-transparent" : "bg-gradient-to-r from-paper to-transparent"
        }`}
      />
      <div
        aria-hidden
        className={`absolute inset-y-0 right-0 w-24 z-10 pointer-events-none ${
          dark ? "bg-gradient-to-l from-ink to-transparent" : "bg-gradient-to-l from-paper to-transparent"
        }`}
      />
      <div className="flex items-center whitespace-nowrap pf-ticker-track py-3">
        {doubled.map((item, i) => {
          const isLive = item.startsWith("LIVE")
          return (
            <span key={i} className="inline-flex items-center shrink-0">
              <span className={`inline-flex items-center gap-2 t-eyebrow px-7 ${dark ? "text-paper/65" : "text-ink/65"}`}>
                {isLive && (
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brand-pitch pf-glow-pulse" />
                )}
                {item}
              </span>
              <span aria-hidden className={`w-px h-3 ${dark ? "bg-paper/15" : "bg-ink/15"}`} />
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   KineticLine — per-word stagger, gated on hero entrance state.
   ────────────────────────────────────────────────────────────────────── */

function KineticLine({
  text,
  accentChar,
  startMs = 0,
  stepMs = 70,
  hero,
}: {
  text: string
  accentChar?: string
  startMs?: number
  stepMs?: number
  hero: HeroState
}) {
  const hasAccent = !!accentChar && text.endsWith(accentChar)
  const body = hasAccent ? text.slice(0, -accentChar!.length) : text
  const words = body.split(" ")

  const animationFor = (i: number) =>
    hero.ready && !hero.reduce
      ? `pf-letter-rise 0.85s cubic-bezier(.22,1,.36,1) ${hero.delay + startMs + i * stepMs}ms both`
      : undefined

  return (
    <span className="inline-block">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
          <span
            className="inline-block"
            style={{
              opacity: hero.reduce ? 1 : 0,
              animation: animationFor(i),
            }}
          >
            {word}
            {i === words.length - 1 && hasAccent && (
              <span
                className="text-brand-pitch"
                style={{
                  opacity: hero.reduce ? 1 : 0,
                  animation: animationFor(i + 1),
                  display: "inline-block",
                }}
              >
                {accentChar}
              </span>
            )}
          </span>
        </span>
      ))}
    </span>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   LetterRise — emits each char as data-letter; spaces are rendered as
   bare text nodes between word groups so they don't collapse inside an
   inline-block (which is what was producing "toplay" instead of
   "to play").
   ────────────────────────────────────────────────────────────────────── */

function LetterRise({ text, startIndex = 0 }: { text: string; startIndex?: number }) {
  const words = text.split(" ")
  let charIdx = -1
  return (
    <span className="inline-block">
      {words.map((word, wIdx) => (
        <span key={wIdx}>
          {[...word].map((ch) => {
            charIdx++
            return (
              <span
                key={charIdx}
                data-letter
                data-letter-index={startIndex + charIdx}
                className="inline-block"
                style={{ opacity: 0 }}
              >
                {ch}
              </span>
            )
          })}
          {wIdx < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  )
}
