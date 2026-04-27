"use client"

import { ArrowRight, CheckCircle, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef } from "react"

/* ── Sport image data ── */
const HERO_SPORTS = [
  { src: "/images/sports/football.jpg", label: "Football" },
  { src: "/images/sports/tennis.jpg", label: "Tennis" },
  { src: "/images/sports/running.jpg", label: "Running" },
  { src: "/images/sports/basketball.jpg", label: "Basketball" },
]

const SPORT_CHIPS = [
  { src: "/images/sports/football.jpg", label: "Football" },
  { src: "/images/sports/tennis.jpg", label: "Tennis" },
  { src: "/images/sports/running.jpg", label: "Running" },
  { src: "/images/sports/basketball.jpg", label: "Basketball" },
  { src: "/images/sports/boxing.jpg", label: "Boxing" },
  { src: "/images/sports/swimming.jpg", label: "Swimming" },
  { src: "/images/sports/cycling.jpg", label: "Cycling" },
  { src: "/images/sports/gym.jpg", label: "Gym" },
  { src: "/images/sports/rugby.jpg", label: "Rugby" },
  { src: "/images/sports/volleyball.jpg", label: "Volleyball" },
  { src: "/images/sports/padel.jpg", label: "Padel" },
  { src: "/images/sports/yoga.jpg", label: "Yoga" },
]

const COMMUNITY_STATS = [
  { value: "15+", label: "Sports supported", desc: "From football to yoga, padel to boxing" },
  { value: "Free", label: "No subscription", desc: "Join activities and create your own at no cost" },
  { value: "Local", label: "Your neighbourhood", desc: "Find games near you at any skill level" },
]

const MARQUEE_ITEMS = [
  "LIVE TONIGHT",
  "342 PLAYERS",
  "18 GAMES OPEN",
  "FOOTBALL · 5-A-SIDE",
  "TENNIS DOUBLES",
  "FREE TO JOIN",
  "BASKETBALL PICKUP",
  "PADEL · BEGINNERS",
  "YOGA · OUTDOOR",
  "RUGBY · TOUCH",
]

const HERO_HEADLINE = ["Find", "your", "game.", "Play", "more."]

/* ── Reveal-on-scroll ── */
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = "0"
    el.style.transform = "translateY(28px)"
    el.style.transition = `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return ref
}

/* ── Per-child stagger reveal — toggles a class on every child when in view ── */
function useStaggerReveal<T extends HTMLElement>(stepMs = 60) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const children = Array.from(el.children) as HTMLElement[]
    children.forEach((c, i) => {
      c.style.opacity = "0"
      c.style.transform = "translateY(18px) scale(0.96)"
      c.style.transition = `opacity 0.55s cubic-bezier(.22,1,.36,1) ${i * stepMs}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${i * stepMs}ms`
    })
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((c) => {
            c.style.opacity = "1"
            c.style.transform = "translateY(0) scale(1)"
          })
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [stepMs])
  return ref
}

/* ── Letter-stagger reveal — triggers when in view ── */
function useLetterReveal<T extends HTMLElement>(stepMs = 45, startDelay = 0) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const letters = el.querySelectorAll<HTMLSpanElement>("[data-letter]")
    letters.forEach((l) => (l.style.opacity = "0"))
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          letters.forEach((l, i) => {
            l.style.animation = `pf-letter-rise 0.7s cubic-bezier(.22,1,.36,1) ${startDelay + i * stepMs}ms both`
          })
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [stepMs, startDelay])
  return ref
}

/* ── Magnetic cursor pull on a button-like element ── */
function useMagnetic<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

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
    el.style.transition = "transform 0.25s cubic-bezier(.22,1,.36,1)"
    return () => {
      parent?.removeEventListener("mousemove", onMove)
      parent?.removeEventListener("mouseleave", onLeave)
    }
  }, [strength])
  return ref
}

/* ─────────────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const heroLeft = useReveal(0)
  const heroRight = useReveal(160)
  const howTitle = useReveal(0)
  const stepGrid = useStaggerReveal<HTMLDivElement>(140)
  const sportsTitle = useReveal(0)
  const sportsGrid = useStaggerReveal<HTMLDivElement>(45)
  const commTitle = useReveal(0)
  const commCards = useStaggerReveal<HTMLDivElement>(120)
  const ctaContent = useReveal(0)
  const ctaHeading = useLetterReveal<HTMLHeadingElement>(40, 100)
  const magneticBtn = useMagnetic<HTMLAnchorElement>(0.18)

  return (
    <div className="h-screen overflow-hidden">

      {/* ══════════════════════════════════════════
          FIXED NAV
      ══════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 bg-white/98 border-b border-slate-100 backdrop-blur">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center group opacity-90 hover:opacity-100 transition-opacity">
            <Image src="/images/peerfit-logo.png" alt="PeerFit" width={180} height={120} className="h-12 sm:h-16 w-auto object-contain -my-2 sm:-my-3" />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#sports" className="hover:text-slate-900 transition-colors">Sports</a>
            <a href="#community" className="hover:text-slate-900 transition-colors">Community</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-2 sm:px-3 py-1.5">
              Log in
            </Link>
            <Link href="/login?mode=signup"
              className="flex items-center gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors shadow-sm">
              Get started
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          SNAP SCROLL CONTAINER
      ══════════════════════════════════════════ */}
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory [overscroll-behavior-y:contain] scroll-pt-14 sm:scroll-pt-16">

        {/* ── 1. HERO ── */}
        <section className="h-screen snap-start bg-white flex flex-col [will-change:transform] relative overflow-hidden">
          {/* Tiny live pill, top-right, hovering above content */}
          <div className="absolute top-20 sm:top-24 right-5 sm:right-8 z-20 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 pf-glow-pulse" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-slate-700 tracking-wide">LIVE · 18 GAMES TONIGHT</span>
          </div>

          <div className="flex-1 max-w-6xl mx-auto w-full px-5 pt-20 sm:pt-24 pb-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center overflow-hidden">

            {/* Left — copy */}
            <div ref={heroLeft}>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full mb-5 sm:mb-7 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Free to join · 15+ sports · Local games
              </div>

              <h1 className="text-[2.25rem] sm:text-5xl lg:text-[64px] font-black leading-[1.03] tracking-tight text-slate-900 mb-4 sm:mb-6 font-heading">
                {HERO_HEADLINE.map((word, i) => (
                  <span
                    key={i}
                    className={`inline-block overflow-hidden align-bottom mr-3 ${i === 3 ? "block sm:inline-block" : ""}`}
                  >
                    <span
                      className={`inline-block ${i >= 3 ? "text-emerald-600" : ""}`}
                      style={{
                        animation: `pf-letter-rise 0.8s cubic-bezier(.22,1,.36,1) ${i * 90}ms both`,
                      }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </h1>

              <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-6 sm:mb-8 max-w-md">
                PeerFit connects you with local players for any sport. Browse activities near you or post your own — and never play alone again.
              </p>

              <Link href="/login?mode=signup"
                className="group inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-100 hover:shadow-emerald-200 hover:-translate-y-0.5 relative overflow-hidden">
                <span className="relative z-10">Get started — it&apos;s free</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-emerald-500 to-emerald-400 transition-transform duration-500" />
              </Link>

              <p className="mt-4 text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline font-medium">Sign in</Link>
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8">
                {["No subscription fee", "Any skill level", "Your neighbourhood"].map((t) => (
                  <span key={t}
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                    <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — stacked sport images, ken-burns */}
            <div ref={heroRight} className="hidden lg:flex flex-col gap-3 h-full max-h-[520px]">
              <div className="flex gap-3 flex-[3]">
                {HERO_SPORTS.slice(0, 2).map(({ src, label }, i) => (
                  <div
                    key={label}
                    className="group relative flex-1 overflow-hidden rounded-2xl shadow-lg shadow-slate-200 hover:shadow-xl hover:shadow-emerald-100 transition-shadow duration-500"
                  >
                    <div
                      className="absolute inset-0 pf-ken-burns"
                      style={{ animationDelay: `${i * -2.5}s` }}
                    >
                      <Image src={src} alt={label} fill className="object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-white text-xs font-black tracking-widest uppercase translate-y-1 group-hover:translate-y-0 transition-transform">
                      {label}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/15 backdrop-blur text-white text-[10px] font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity rounded">
                      LIVE TONIGHT
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-[2]">
                {HERO_SPORTS.slice(2).map(({ src, label }, i) => (
                  <div
                    key={label}
                    className="group relative flex-1 overflow-hidden rounded-2xl shadow-lg shadow-slate-200 hover:shadow-xl hover:shadow-emerald-100 transition-shadow duration-500"
                  >
                    <div
                      className="absolute inset-0 pf-ken-burns"
                      style={{ animationDelay: `${(i + 2) * -2.5}s` }}
                    >
                      <Image src={src} alt={label} fill className="object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-white text-xs font-black tracking-widest uppercase translate-y-1 group-hover:translate-y-0 transition-transform">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Marquee strip — sits at the bottom of the hero */}
          <MarqueeStrip />

          {/* Scroll hint */}
          <div className="h-10 flex items-center justify-center gap-2 text-slate-300">
            <span className="text-[11px] font-semibold tracking-widest uppercase">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </section>

        {/* ── 2. HOW IT WORKS ── */}
        <section id="how-it-works" className="min-h-screen snap-start bg-emerald-950 flex flex-col justify-center px-5 py-20 sm:py-16 relative overflow-hidden [will-change:transform]">
          {/* Logo watermark with slow drift */}
          <Image
            src="/images/peerfit-logo.png"
            alt=""
            width={340}
            height={227}
            aria-hidden
            className="absolute -bottom-10 -right-10 w-[340px] h-auto object-contain pointer-events-none select-none opacity-[0.06] [filter:brightness(0)_invert(1)] pf-drift-x"
          />

          <div className="max-w-6xl mx-auto w-full relative z-10">
            <div ref={howTitle} className="text-center mb-10 sm:mb-14">
              <span className="text-emerald-500/70 text-[11px] sm:text-xs font-bold tracking-[.18em] uppercase block mb-3">
                How it works
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-heading">
                Up and running<br />in minutes
              </h2>
            </div>

            <div ref={stepGrid} className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {[
                { n: "01", title: "Post an activity", desc: "Choose a sport, pick a time and location, set how many players you need. Done in under a minute." },
                { n: "02", title: "Players join you", desc: "Nearby players browse the feed and request to join. You approve and chat in the activity thread." },
                { n: "03", title: "Show up & play", desc: "Meet your new teammates, enjoy the game, and build the habit with people who keep you accountable." },
              ].map(({ n, title, desc }) => (
                <div key={n}
                  className="group relative bg-white/[0.06] border border-white/10 rounded-3xl p-5 sm:p-8 overflow-hidden hover:bg-white/[0.10] hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-500">
                  {/* Watermark number */}
                  <span className="absolute -top-6 -left-1 text-[140px] font-black leading-none select-none pointer-events-none text-white/[0.035] font-heading group-hover:text-emerald-500/[0.08] group-hover:scale-110 transition-all duration-700 origin-top-left">
                    {n}
                  </span>
                  {/* Hover glow */}
                  <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <span className="text-white text-xs font-black font-heading">{n}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3 font-heading">{title}</h3>
                    <p className="text-emerald-200/60 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. SPORTS ── */}
        <section id="sports" className="min-h-screen snap-start bg-slate-900 flex flex-col justify-center px-5 py-20 sm:py-16 relative overflow-hidden [will-change:transform]">
          <Image
            src="/images/peerfit-logo.png"
            alt=""
            width={320}
            height={213}
            aria-hidden
            className="absolute -top-8 -left-8 w-[320px] h-auto object-contain pointer-events-none select-none opacity-[0.06] [filter:brightness(0)_invert(1)] pf-drift-x"
            style={{ animationDirection: "reverse" }}
          />

          <div className="max-w-6xl mx-auto w-full relative z-10">
            <div ref={sportsTitle} className="text-center mb-8 sm:mb-10">
              <span className="text-emerald-500 text-[11px] sm:text-xs font-bold tracking-[.18em] uppercase mb-3 sm:mb-4 block">Sports</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-heading">
                Every sport. Your area.
              </h2>
              <p className="text-slate-400 mt-3 text-sm sm:text-base">From 5-a-side to yoga — find your activity or create one.</p>
            </div>

            <div ref={sportsGrid} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {SPORT_CHIPS.map(({ src, label }) => (
                <div
                  key={label}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700 ease-out">
                    <Image src={src} alt={label} fill className="object-cover" />
                  </div>
                  {/* Default dim overlay */}
                  <div className="absolute inset-0 bg-black/55 group-hover:bg-black/20 transition-colors duration-500" />
                  {/* Emerald wash on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Default centered label */}
                  <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-black tracking-widest uppercase group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">
                    {label}
                  </span>
                  {/* Hover label — drops up from bottom */}
                  <span className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                    <span className="text-white text-[11px] font-black tracking-widest uppercase leading-none">{label}</span>
                    <span className="text-white/80 text-[9px] font-medium tracking-wider">FIND GAMES →</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. WHY PEERFIT ── */}
        <section id="community" className="min-h-screen snap-start bg-slate-50 flex flex-col justify-center px-5 py-20 sm:py-16 relative overflow-hidden [will-change:transform]">
          <Image
            src="/images/peerfit-logo.png"
            alt=""
            width={300}
            height={200}
            aria-hidden
            className="absolute -bottom-6 -right-6 w-[300px] h-auto object-contain pointer-events-none select-none opacity-[0.07] [filter:brightness(0)] pf-drift-x"
          />

          <div className="max-w-6xl mx-auto w-full relative z-10">
            <div ref={commTitle} className="text-center mb-10 sm:mb-14">
              <span className="text-emerald-600 text-[11px] sm:text-xs font-bold tracking-[.18em] uppercase mb-3 sm:mb-4 block">Why PeerFit</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading">
                Built for players,<br />not algorithms.
              </h2>
              <p className="text-slate-500 mt-3 text-sm sm:text-base max-w-lg mx-auto">
                No feed, no followers, no ads. Just you, your sport, and people nearby who want to play.
              </p>
            </div>

            <div ref={commCards} className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {COMMUNITY_STATS.map(({ value, label, desc }) => (
                <div key={label}
                  className="group bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1 transition-all duration-500 text-center">
                  <p className="text-5xl sm:text-6xl font-black text-emerald-600 mb-2 font-heading group-hover:scale-110 transition-transform duration-500 inline-block">
                    {value}
                  </p>
                  <p className="text-base font-bold text-slate-800 mb-2">{label}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 hover:border-emerald-300 transition-colors">
                <p className="text-base font-bold text-slate-800 mb-1">Open to everyone</p>
                <p className="text-sm text-slate-500">Any skill level, any sport. Whether you&apos;re a beginner looking for a casual kick-about or a competitive player searching for a serious match.</p>
              </div>
              <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 hover:bg-slate-800 transition-colors">
                <p className="text-base font-bold text-white mb-1">Private or public activities</p>
                <p className="text-sm text-slate-400">Create open sessions anyone can join, or private invite-only games where you approve every player yourself.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. FINAL CTA + embedded footer ── */}
        <section className="min-h-screen snap-start bg-emerald-950 flex flex-col relative overflow-hidden [will-change:transform]">
          {/* Logo watermark — large, centred, drifting */}
          <Image
            src="/images/peerfit-logo.png"
            alt=""
            width={480}
            height={320}
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-auto object-contain pointer-events-none select-none opacity-[0.06] [filter:brightness(0)_invert(1)] pf-drift-x"
          />
          {/* Decorative glows */}
          <div className="absolute top-1/4 -left-20 w-[500px] h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* CTA body */}
          <div className="flex-1 flex flex-col justify-center items-center px-5 py-20 sm:py-16 relative z-10">
            <div ref={ctaContent} className="max-w-2xl text-center">
              <div className="flex justify-center mb-6 sm:mb-8">
                <Image src="/images/peerfit-logo.png" alt="PeerFit" width={160} height={107} className="h-12 sm:h-16 w-auto object-contain opacity-80" />
              </div>
              <h2
                ref={ctaHeading}
                className="text-5xl sm:text-6xl lg:text-[88px] font-black text-white leading-[0.92] tracking-tight mb-5 sm:mb-7 font-heading"
              >
                <LetterSplit text="Ready" />
                <br />
                <LetterSplit text="to play?" highlightFrom={3} />
              </h2>
              <p className="text-emerald-300/75 text-base sm:text-lg mb-7 sm:mb-10 leading-relaxed max-w-sm mx-auto">
                Join PeerFit for free and find local games in your sport today.
              </p>
              {/* Magnetic button — wrapping div listens to mouse, inner anchor moves */}
              <div className="inline-block relative px-8 py-3">
                <Link
                  ref={magneticBtn}
                  href="/login?mode=signup"
                  className="group inline-flex items-center gap-2 sm:gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base sm:text-lg px-6 sm:px-9 py-3 sm:py-4 rounded-2xl shadow-2xl shadow-emerald-900/60 hover:scale-[1.03] relative overflow-hidden"
                >
                  <span className="relative z-10">Create your free account</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  {/* Sweeping shine */}
                  <span aria-hidden className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-[300%] transition-transform duration-700" />
                </Link>
              </div>
              <p className="mt-5 sm:mt-6 text-sm text-emerald-800">
                Have an account?{" "}
                <Link href="/login" className="text-emerald-500 hover:text-emerald-300 transition-colors underline">Sign in</Link>
              </p>
            </div>
          </div>

          {/* Embedded footer strip */}
          <div className="relative z-10 px-4 sm:px-5 py-4 sm:py-5 border-t border-white/[0.07]">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Image src="/images/peerfit-logo.png" alt="PeerFit" width={64} height={43} className="h-6 w-auto object-contain opacity-50" />
                <span className="text-emerald-900/50 text-xs">&copy; {new Date().getFullYear()}</span>
              </div>
              <nav className="flex flex-wrap justify-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-emerald-800">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Consumer Terms", href: "/consumer-terms" },
                  { label: "Contact", href: "/contact" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} className="hover:text-emerald-500 transition-colors">{label}</Link>
                ))}
              </nav>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

/* ── Marquee strip — black band of fast-rotating live items ── */
function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="relative bg-slate-900 text-white py-3 overflow-hidden border-y border-slate-800 group">
      {/* Edge fades */}
      <div aria-hidden className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
      <div aria-hidden className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="flex gap-10 whitespace-nowrap pf-ticker-track">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-3 text-[11px] sm:text-xs font-black tracking-[.22em] uppercase shrink-0"
          >
            <span aria-hidden className="w-1.5 h-1.5 bg-emerald-500 rounded-full pf-glow-pulse" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Letter split — wraps each character in a span with a stagger animation ── */
function LetterSplit({ text, highlightFrom }: { text: string; highlightFrom?: number }) {
  let charIndex = -1
  return (
    <span className="inline-block">
      {text.split("").map((ch, i) => {
        if (ch !== " ") charIndex++
        const animateThis = ch !== " "
        const delay = animateThis ? charIndex * 50 : 0
        const isHighlighted = highlightFrom !== undefined && i >= highlightFrom
        return (
          <span
            key={i}
            data-letter
            className={`inline-block ${isHighlighted ? "text-emerald-400" : ""}`}
            style={
              animateThis
                ? { animation: `pf-letter-rise 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms both` }
                : undefined
            }
          >
            {ch === " " ? " " : ch}
          </span>
        )
      })}
    </span>
  )
}
