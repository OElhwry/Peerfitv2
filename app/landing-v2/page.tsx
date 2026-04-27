"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { LandingIntroStinger } from "@/components/peerfit/landing-intro-stinger"

/**
 * Landing v2 — six-beat cinematic slide deck.
 *
 *   01  Cold open      — kinetic H1 + drifting photo collage + magnetic CTA
 *   02  The problem    — text-fragment slide-in, brand line punches
 *   03  Every sport    — sport names cascade in
 *   04  How it works   — POST · MATCH · PLAY ratchet reveal
 *   05  Community      — quote slide-in from sides
 *   06  Full time      — letter rise on CTA
 *
 * Snap scroll between beats. Each beat's entrance motion fires when the slide
 * lands in viewport and runs once per session.
 */

const HERO_PHOTOS = [
  { src: "/images/sports/football.jpg",   label: "FOOTBALL",   pos: "top-[12%] left-[5%]",     size: "w-[24vw] h-[30vh]",  rot: "-3deg",  parallax: 0.55, drift: "a" },
  { src: "/images/sports/tennis.jpg",     label: "TENNIS",     pos: "top-[8%] right-[7%]",     size: "w-[18vw] h-[26vh]",  rot: "2deg",   parallax: 0.4,  drift: "b" },
  { src: "/images/sports/basketball.jpg", label: "BASKETBALL", pos: "bottom-[16%] left-[10%]", size: "w-[16vw] h-[22vh]",  rot: "4deg",   parallax: 0.7,  drift: "c" },
  { src: "/images/sports/running.jpg",    label: "RUNNING",    pos: "bottom-[20%] right-[6%]", size: "w-[20vw] h-[26vh]",  rot: "-2deg",  parallax: 0.5,  drift: "d" },
] as const

const HERO_LINE_1 = "Somewhere in your city,"
const HERO_LINE_2 = "a game is starting."

/* ──────────────────────────────────────────────────────────────────────
   Hooks — generic
   ────────────────────────────────────────────────────────────────────── */

/** Subtle cursor parallax (max ~7px). Photos respond gently to mouse. */
function useCursorParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-parallax]"))
    items.forEach((item) => {
      item.style.transition = "transform 0.6s cubic-bezier(.22,1,.36,1)"
    })

    function onMove(e: MouseEvent) {
      const w = window.innerWidth
      const h = window.innerHeight
      const dx = (e.clientX - w / 2) / w
      const dy = (e.clientY - h / 2) / h
      items.forEach((item) => {
        const factor = parseFloat(item.dataset.parallax || "0")
        item.style.transform = `translate3d(${dx * factor * 18}px, ${dy * factor * 18}px, 0)`
      })
    }
    function onLeave() {
      items.forEach((item) => { item.style.transform = "translate3d(0,0,0)" })
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
    }
  }, [])
  return ref
}

function useMagnetic<T extends HTMLElement>(strength = 0.18) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    function onMove(e: MouseEvent) {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
    }
    function onLeave() {
      if (!el) return
      el.style.transform = "translate(0, 0)"
    }

    const parent = el.parentElement
    parent?.addEventListener("mousemove", onMove)
    parent?.addEventListener("mouseleave", onLeave)
    el.style.transition = "transform 0.3s cubic-bezier(.22,1,.36,1)"
    return () => {
      parent?.removeEventListener("mousemove", onMove)
      parent?.removeEventListener("mouseleave", onLeave)
    }
  }, [strength])
  return ref
}

/**
 * Beat-reveal hook.
 *
 * Watches a section ref. When the slide is at least `threshold` visible
 * (i.e. the user has snapped to it), runs `apply` which sets entrance
 * styles on child elements queried by data-attribute. Fires once per
 * session — we don't replay if the user scrolls back up.
 */
function useBeatReveal<T extends HTMLElement>(
  apply: (root: T) => void,
  init?: (root: T) => void,
  threshold = 0.45,
) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // reduced-motion users see the final state immediately — don't init
      return
    }
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
    // intentionally fire-once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

/* ──────────────────────────────────────────────────────────────────────
   Beat-specific reveal recipes
   ────────────────────────────────────────────────────────────────────── */

/** Beat 2 — fragments slide in alternating, then brand line punches. */
function useBeat2() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      const frags = el.querySelectorAll<HTMLElement>("[data-frag]")
      const punch = el.querySelector<HTMLElement>("[data-punch]")
      const eyebrow = el.querySelector<HTMLElement>("[data-eyebrow]")

      eyebrow?.style.setProperty("opacity", "1")
      eyebrow && (eyebrow.style.transform = "translateY(0)")

      frags.forEach((frag, i) => {
        window.setTimeout(() => {
          frag.style.opacity = frag.dataset.targetOpacity || "1"
          frag.style.transform = "translateX(0)"
          frag.style.filter = "blur(0)"
        }, 200 + i * 550)
      })
      window.setTimeout(() => {
        if (!punch) return
        punch.style.opacity = "1"
        punch.style.transform = "scale(1)"
      }, 200 + frags.length * 550 + 250)
    },
    (el) => {
      const frags = el.querySelectorAll<HTMLElement>("[data-frag]")
      const punch = el.querySelector<HTMLElement>("[data-punch]")
      const eyebrow = el.querySelector<HTMLElement>("[data-eyebrow]")

      if (eyebrow) {
        eyebrow.style.opacity = "0"
        eyebrow.style.transform = "translateY(-12px)"
        eyebrow.style.transition =
          "opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1)"
      }
      frags.forEach((frag, i) => {
        frag.style.opacity = "0"
        frag.style.transform = `translateX(${i % 2 === 0 ? -40 : 40}px)`
        frag.style.filter = "blur(8px)"
        frag.style.transition =
          "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1), filter 0.7s ease"
      })
      if (punch) {
        punch.style.opacity = "0"
        punch.style.transform = "scale(0.94)"
        punch.style.transition =
          "opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.34,1.56,.64,1)"
      }
    },
  )
}

/** Beat 3 — sport names cascade from left with overshoot. */
function useBeat3() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      const items = el.querySelectorAll<HTMLElement>("[data-sport]")
      items.forEach((item, i) => {
        window.setTimeout(() => {
          item.style.opacity = "1"
          item.style.transform = "translateX(0)"
        }, 150 + i * 130)
      })
      const sub = el.querySelector<HTMLElement>("[data-sub]")
      if (sub) {
        window.setTimeout(() => {
          sub.style.opacity = "1"
          sub.style.transform = "translateY(0)"
        }, 150 + items.length * 130 + 100)
      }
    },
    (el) => {
      el.querySelectorAll<HTMLElement>("[data-sport]").forEach((item) => {
        item.style.opacity = "0"
        item.style.transform = "translateX(-60px)"
        item.style.transition =
          "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.34,1.56,.64,1)"
      })
      const sub = el.querySelector<HTMLElement>("[data-sub]")
      if (sub) {
        sub.style.opacity = "0"
        sub.style.transform = "translateY(20px)"
        sub.style.transition =
          "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)"
      }
    },
  )
}

/** Beat 4 — each step ratchets in: number, verb slams, line types. */
function useBeat4() {
  return useBeatReveal<HTMLOListElement>(
    (el) => {
      const rows = el.querySelectorAll<HTMLElement>("[data-row]")
      rows.forEach((row, i) => {
        const num = row.querySelector<HTMLElement>("[data-num]")
        const verb = row.querySelector<HTMLElement>("[data-verb]")
        const line = row.querySelector<HTMLElement>("[data-line]")
        const base = 100 + i * 350
        window.setTimeout(() => {
          if (num) {
            num.style.opacity = "1"
            num.style.transform = "translateY(0)"
          }
        }, base)
        window.setTimeout(() => {
          if (verb) {
            verb.style.opacity = "1"
            verb.style.transform = "translateY(0)"
          }
        }, base + 100)
        window.setTimeout(() => {
          if (line) {
            line.style.opacity = "1"
            line.style.transform = "translateY(0)"
          }
        }, base + 220)
      })
    },
    (el) => {
      el.querySelectorAll<HTMLElement>("[data-num]").forEach((n) => {
        n.style.opacity = "0"
        n.style.transform = "translateY(8px)"
        n.style.transition =
          "opacity 0.45s ease-out, transform 0.45s cubic-bezier(.22,1,.36,1)"
      })
      el.querySelectorAll<HTMLElement>("[data-verb]").forEach((v) => {
        v.style.opacity = "0"
        v.style.transform = "translateY(48px)"
        v.style.transition =
          "opacity 0.65s ease-out, transform 0.7s cubic-bezier(.22,1,.36,1)"
      })
      el.querySelectorAll<HTMLElement>("[data-line]").forEach((l) => {
        l.style.opacity = "0"
        l.style.transform = "translateY(16px)"
        l.style.transition =
          "opacity 0.6s ease-out, transform 0.6s cubic-bezier(.22,1,.36,1)"
      })
    },
  )
}

/** Beat 5 — headline rises, quotes drift in from opposite sides. */
function useBeat5() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      const head = el.querySelector<HTMLElement>("[data-head]")
      const quotes = el.querySelectorAll<HTMLElement>("[data-quote]")
      if (head) {
        head.style.opacity = "1"
        head.style.transform = "translateY(0)"
      }
      quotes.forEach((q, i) => {
        window.setTimeout(() => {
          q.style.opacity = "1"
          q.style.transform = "translate(0, 0) rotate(0)"
        }, 350 + i * 220)
      })
    },
    (el) => {
      const head = el.querySelector<HTMLElement>("[data-head]")
      if (head) {
        head.style.opacity = "0"
        head.style.transform = "translateY(28px)"
        head.style.transition =
          "opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.9s cubic-bezier(.22,1,.36,1)"
      }
      el.querySelectorAll<HTMLElement>("[data-quote]").forEach((q, i) => {
        const fromLeft = i % 2 === 0
        q.style.opacity = "0"
        q.style.transform = `translate(${fromLeft ? -50 : 50}px, 16px) rotate(${fromLeft ? -1.5 : 1.5}deg)`
        q.style.transition =
          "opacity 0.85s cubic-bezier(.22,1,.36,1), transform 0.95s cubic-bezier(.22,1,.36,1)"
      })
    },
  )
}

/** Beat 6 — eyebrow → letter rise on H2 → CTA scales in. */
function useBeat6() {
  return useBeatReveal<HTMLDivElement>(
    (el) => {
      const eyebrow = el.querySelector<HTMLElement>("[data-eyebrow]")
      const sub = el.querySelector<HTMLElement>("[data-sub]")
      const cta = el.querySelector<HTMLElement>("[data-cta]")
      const signin = el.querySelector<HTMLElement>("[data-signin]")
      if (eyebrow) {
        eyebrow.style.opacity = "1"
        eyebrow.style.transform = "translateY(0)"
      }
      const letters = el.querySelectorAll<HTMLElement>("[data-letter]")
      letters.forEach((l, i) => {
        l.style.animation = `pf-letter-rise 0.85s cubic-bezier(.22,1,.36,1) ${250 + i * 50}ms both`
      })
      window.setTimeout(() => {
        if (sub) {
          sub.style.opacity = "1"
          sub.style.transform = "translateY(0)"
        }
      }, 250 + letters.length * 50 + 200)
      window.setTimeout(() => {
        if (cta) {
          cta.style.opacity = "1"
          cta.style.transform = "scale(1)"
        }
      }, 250 + letters.length * 50 + 380)
      window.setTimeout(() => {
        if (signin) signin.style.opacity = "1"
      }, 250 + letters.length * 50 + 600)
    },
    (el) => {
      const eyebrow = el.querySelector<HTMLElement>("[data-eyebrow]")
      const sub = el.querySelector<HTMLElement>("[data-sub]")
      const cta = el.querySelector<HTMLElement>("[data-cta]")
      const signin = el.querySelector<HTMLElement>("[data-signin]")
      if (eyebrow) {
        eyebrow.style.opacity = "0"
        eyebrow.style.transform = "translateY(-10px)"
        eyebrow.style.transition =
          "opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1)"
      }
      el.querySelectorAll<HTMLElement>("[data-letter]").forEach((l) => {
        l.style.opacity = "0"
      })
      if (sub) {
        sub.style.opacity = "0"
        sub.style.transform = "translateY(14px)"
        sub.style.transition =
          "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)"
      }
      if (cta) {
        cta.style.opacity = "0"
        cta.style.transform = "scale(0.92)"
        cta.style.transition =
          "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.34,1.56,.64,1)"
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

export default function LandingV2Page() {
  const heroParallax = useCursorParallax<HTMLDivElement>()
  const magneticCta = useMagnetic<HTMLAnchorElement>(0.18)

  const beat2Ref = useBeat2()
  const beat3Ref = useBeat3()
  const beat4Ref = useBeat4()
  const beat5Ref = useBeat5()
  const beat6Ref = useBeat6()

  return (
    <>
      <LandingIntroStinger />

      <div className="h-screen overflow-hidden bg-ink">
        <div
          className="h-screen overflow-y-scroll snap-y snap-mandatory [overscroll-behavior-y:contain]"
          aria-label="PeerFit landing"
        >

          {/* ════════════════════════════════════════════
              01 · COLD OPEN
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start flex flex-col justify-between overflow-hidden bg-ink text-paper">

            {/* Photo collage — desktop only, drift + cursor parallax */}
            <div
              ref={heroParallax}
              aria-hidden
              className="absolute inset-0 pointer-events-none hidden lg:block"
            >
              {HERO_PHOTOS.map(({ src, label, pos, size, rot, parallax, drift }) => (
                <div key={label} data-parallax={parallax} className={`absolute ${pos}`}>
                  <div className={`pf-drift-${drift}`}>
                    <div
                      className={`relative ${size} overflow-hidden`}
                      style={{ transform: `rotate(${rot})` }}
                    >
                      <div className="absolute inset-0 pf-ken-burns">
                        <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
                      </div>
                      <div className="absolute inset-0 bg-ink/55" />
                      <span className="absolute bottom-2 left-3 t-eyebrow text-paper/80">{label}</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Centre scrim — keeps the H1 readable over photos */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.18_0.005_60_/_0.85)_0%,_oklch(0.18_0.005_60_/_0.55)_45%,_transparent_85%)]" />
            </div>

            {/* Mobile background — single tinted hero photo */}
            <div aria-hidden className="absolute inset-0 lg:hidden pointer-events-none">
              <Image
                src="/images/sports/football.jpg"
                alt=""
                fill
                className="object-cover opacity-30 pf-ken-burns"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
            </div>

            {/* Top bar */}
            <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8">
              <span className="t-eyebrow text-paper/60">PEERFIT</span>
              <nav className="flex items-center gap-3 sm:gap-5">
                <Link href="/login" className="t-eyebrow text-paper/70 hover:text-paper transition-colors">
                  LOG IN
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="t-eyebrow text-ink bg-paper px-3 py-2 hover:bg-brand-pitch hover:text-paper transition-colors"
                >
                  JOIN —&gt;
                </Link>
              </nav>
            </header>

            {/* Centre content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
              <p className="t-eyebrow text-brand-pitch mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-pitch pf-glow-pulse" />
                  LIVE · 18 GAMES TONIGHT
                </span>
              </p>

              <h1 className="t-display-lg text-paper max-w-[18ch]">
                <KineticLine text={HERO_LINE_1} accentChar="," startMs={400} stepMs={70} />
                <br />
                <KineticLine text={HERO_LINE_2} accentChar="." startMs={800} stepMs={70} />
              </h1>

              <p
                className="t-sub text-paper/60 mt-6 sm:mt-8 max-w-md"
                style={{
                  opacity: 0,
                  animation: "pf-stinger-tagline 700ms cubic-bezier(.22,1,.36,1) 1400ms forwards",
                }}
              >
                PeerFit connects you with players nearby — for any sport, at any level. Find a game, join, show up. Nothing else.
              </p>

              <div
                className="mt-8 sm:mt-10 inline-block relative px-6 py-3"
                style={{
                  opacity: 0,
                  animation: "pf-stinger-tagline 700ms cubic-bezier(.22,1,.36,1) 1700ms forwards",
                }}
              >
                <Link
                  ref={magneticCta}
                  href="/login?mode=signup"
                  className="group inline-flex items-baseline gap-3 t-mono-lg text-brand-pitch border-b border-brand-pitch pb-1 hover:text-paper hover:border-paper transition-colors"
                >
                  FIND TONIGHT&apos;S GAME
                  <span className="inline-block group-hover:translate-x-1 transition-transform">—&gt;</span>
                </Link>
              </div>
            </div>

            {/* Bottom strip */}
            <footer
              className="relative z-10 flex items-end justify-between px-6 sm:px-10 pb-6 sm:pb-8"
              style={{
                opacity: 0,
                animation: "pf-stinger-tagline 700ms cubic-bezier(.22,1,.36,1) 2000ms forwards",
              }}
            >
              <span className="t-mono text-paper/40">7:42 PM · YOUR CITY</span>
              <span className="t-eyebrow text-paper/40 inline-flex items-center gap-2">
                SCROLL
                <span className="inline-block w-px h-3 bg-paper/40" />
              </span>
              <span className="t-mono text-paper/40 hidden sm:block">01 / 06</span>
            </footer>
          </section>

          {/* ════════════════════════════════════════════
              02 · THE PROBLEM
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-ink flex flex-col items-center justify-center px-6 py-16">
            <div ref={beat2Ref} className="flex flex-col items-center w-full max-w-3xl">
              <span data-eyebrow className="t-eyebrow text-paper/40 mb-12 sm:mb-16">02 — WHY THIS EXISTS</span>

              <p data-frag data-target-opacity="0.35" className="t-display-md text-paper/35 text-center max-w-[18ch]">
                &ldquo;one more for football tonight?&rdquo;
              </p>
              <p data-frag data-target-opacity="0.55" className="t-display-md text-paper/55 text-center max-w-[18ch] mt-8">
                &ldquo;we need a 4th for padel.&rdquo;
              </p>
              <p data-frag data-target-opacity="0.85" className="t-display-md text-paper/85 text-center max-w-[18ch] mt-8">
                &ldquo;anyone free sunday?&rdquo;
              </p>

              <p data-punch className="t-display-lg text-brand-pitch text-center mt-12 sm:mt-16 max-w-[14ch]">
                You&apos;ve waited<br />long enough.
              </p>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              03 · EVERY SPORT
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-brand-pitch text-ink flex flex-col justify-between px-6 py-12 overflow-hidden">
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-ink/60">03 — EVERY SPORT</span>
              <span className="t-mono text-ink/60">15+ SPORTS · NEAR YOU</span>
            </div>

            <div ref={beat3Ref} className="flex-1 flex flex-col justify-center">
              <p data-sport className="t-display-xl text-ink leading-[0.9]">FOOTBALL.</p>
              <p data-sport className="t-display-xl text-ink leading-[0.9]">PADEL.</p>
              <p data-sport className="t-display-xl text-ink leading-[0.9]">YOGA.</p>
              <p data-sport className="t-display-xl text-ink leading-[0.9]">RUGBY.</p>
              <p data-sub className="t-sub text-ink/60 mt-6 max-w-md">
                Every sport gets its own takeover here — full-bleed photo, big type, one stat. Per-sport scenes land in the next pass.
              </p>
            </div>

            <div className="flex items-end justify-between">
              <span className="t-mono text-ink/60 max-w-[60%]">SWIMMING · BOXING · CYCLING · TENNIS · BASKETBALL · VOLLEYBALL · GYM</span>
              <span className="t-eyebrow text-ink/60">+ 5 MORE</span>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              04 · HOW IT WORKS
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-paper text-ink flex flex-col justify-between px-6 py-12">
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-ink/50">04 — HOW IT WORKS</span>
              <span className="t-mono text-ink/50">UNDER A MINUTE</span>
            </div>

            <ol ref={beat4Ref} className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full space-y-10 sm:space-y-14">
              {[
                { n: "01", verb: "POST", line: "Pick a sport. Pick a time. Set how many you need." },
                { n: "02", verb: "MATCH", line: "Nearby players see it and request to join." },
                { n: "03", verb: "PLAY", line: "Show up. Meet your teammates. Build the habit." },
              ].map(({ n, verb, line }) => (
                <li key={n} data-row className="grid grid-cols-12 gap-4 items-baseline">
                  <span data-num className="t-mono text-brand-pitch col-span-2 sm:col-span-1">{n}</span>
                  <span data-verb className="t-display-lg text-ink col-span-10 sm:col-span-4">{verb}.</span>
                  <span data-line className="t-sub text-ink/60 col-start-3 sm:col-start-6 col-span-10 sm:col-span-7">{line}</span>
                </li>
              ))}
            </ol>

            <div className="flex items-end justify-between">
              <span className="t-mono text-ink/40">FREE TO JOIN · FREE TO POST</span>
              <span className="t-eyebrow text-ink/40">04 / 06</span>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              05 · COMMUNITY
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-stone-200 text-ink flex flex-col justify-between px-6 py-12 overflow-hidden">
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-ink/50">05 — COMMUNITY</span>
              <span className="t-mono text-ink/50">NOT A FEED</span>
            </div>

            <div ref={beat5Ref} className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
              <p data-head className="t-display-lg text-ink max-w-[18ch]">
                A noticeboard for players, not algorithms.
              </p>

              <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-3xl">
                <blockquote data-quote className="border-l-2 border-brand-pitch pl-4">
                  <p className="t-sub text-ink">
                    &ldquo;Found a 5-a-side league three streets from my flat. Two weeks in I knew everyone.&rdquo;
                  </p>
                  <span className="t-mono text-ink/50 mt-3 block">— SAM, FOOTBALL</span>
                </blockquote>
                <blockquote data-quote className="border-l-2 border-brand-pitch pl-4">
                  <p className="t-sub text-ink">
                    &ldquo;Wanted to try padel. Posted &lsquo;total beginner&rsquo; — three people showed up to teach me.&rdquo;
                  </p>
                  <span className="t-mono text-ink/50 mt-3 block">— NADIA, PADEL</span>
                </blockquote>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="t-mono text-ink/40">FREE · OPEN · LOCAL</span>
              <span className="t-eyebrow text-ink/40">05 / 06</span>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              06 · FULL TIME
              ════════════════════════════════════════════ */}
          <section className="relative h-screen snap-start bg-ink text-paper flex flex-col justify-between px-6 py-12 overflow-hidden">
            <div className="flex items-baseline justify-between">
              <span className="t-eyebrow text-paper/50">06 — FULL TIME</span>
              <span className="t-mono text-paper/50">FREE TO JOIN</span>
            </div>

            <div ref={beat6Ref} className="flex-1 flex flex-col items-center justify-center text-center">
              <p data-eyebrow className="t-eyebrow text-brand-pitch mb-6">FULL TIME WHISTLE</p>
              <h2 className="t-display-xl text-paper">
                <LetterRise text="Ready" />
                <br />
                <LetterRise text="to play?" startIndex={5} />
              </h2>
              <p data-sub className="t-sub text-paper/60 mt-6 max-w-sm">
                Join PeerFit free. Find a game in your area tonight.
              </p>
              <div data-cta className="mt-10">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-brand-pitch text-paper t-mono-lg hover:bg-brand-pitch-hover transition-colors"
                >
                  CREATE FREE ACCOUNT —&gt;
                </Link>
              </div>
              <p data-signin className="t-meta text-paper/40 mt-5">
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
   KineticLine — splits a phrase into per-word spans, staggers them in,
   and tints the trailing punctuation char in brand pitch.
   ────────────────────────────────────────────────────────────────────── */

function KineticLine({
  text,
  accentChar,
  startMs = 0,
  stepMs = 70,
}: {
  text: string
  accentChar?: string
  startMs?: number
  stepMs?: number
}) {
  const hasAccent = !!accentChar && text.endsWith(accentChar)
  const body = hasAccent ? text.slice(0, -accentChar!.length) : text
  const words = body.split(" ")

  return (
    <span className="inline-block">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
          <span
            className="inline-block"
            style={{
              opacity: 0,
              animation: `pf-letter-rise 0.85s cubic-bezier(.22,1,.36,1) ${startMs + i * stepMs}ms both`,
            }}
          >
            {word}
            {i === words.length - 1 && hasAccent && (
              <span
                className="text-brand-pitch"
                style={{
                  opacity: 0,
                  animation: `pf-letter-rise 0.85s cubic-bezier(.22,1,.36,1) ${startMs + (i + 1) * stepMs}ms both`,
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
   LetterRise — emits each char as a span with data-letter so beat-6's
   reveal hook can drive the stagger.
   ────────────────────────────────────────────────────────────────────── */

function LetterRise({ text, startIndex = 0 }: { text: string; startIndex?: number }) {
  return (
    <span className="inline-block">
      {text.split("").map((ch, i) => (
        <span
          key={i}
          data-letter
          data-letter-index={startIndex + i}
          className="inline-block"
          style={{ opacity: 0 }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  )
}
