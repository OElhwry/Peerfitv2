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

  /* ── Reveal-on-scroll animation hook ── */
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

  export default function HomePage() {
    /* Reveal refs — called unconditionally at top level */
    const heroLeft = useReveal(0)
    const heroRight = useReveal(160)
    const howTitle = useReveal(0)
    const step0 = useReveal(120)
    const step1 = useReveal(260)
    const step2 = useReveal(400)
    const sportsTitle = useReveal(0)
    const sportsGrid = useReveal(120)
    const commTitle = useReveal(0)
    const commCards = useReveal(120)
    const ctaContent = useReveal(0)

    return (
      <div className="h-screen overflow-hidden">

        {/* ══════════════════════════════════════════
          FIXED NAV
      ══════════════════════════════════════════ */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 bg-white/98 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-3 sm:px-5 h-full flex items-center justify-between">

            <Link href="/" className="flex items-center group opacity-90 hover:opacity-100 transition-opacity">
              <Image src="/images/peerfit-logo.png" alt="PeerFit" width={ 180 } height={ 120 } className="h-12 sm:h-16 w-auto object-contain -my-2 sm:-my-3" />
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

          {/* ── 1. HERO ── */ }
          <section className="h-screen snap-start bg-white flex flex-col [will-change:transform]">
            <div className="flex-1 max-w-6xl mx-auto w-full px-5 pt-20 sm:pt-24 pb-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center overflow-hidden">

              {/* Left — copy */ }
              <div ref={ heroLeft }>
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full mb-5 sm:mb-7 border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Free to join · 15+ sports · Local games
                </div>

                <h1 className="text-[2.25rem] sm:text-5xl lg:text-[64px] font-black leading-[1.03] tracking-tight text-slate-900 mb-4 sm:mb-6 font-heading">
                  Find your game.<br />
                  <span className="text-emerald-600">Play more.</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-6 sm:mb-8 max-w-md">
                  PeerFit connects you with local players for any sport. Browse activities near you or post your own — and never play alone again.
                </p>

                <Link href="/login?mode=signup"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-100 hover:shadow-emerald-200 hover:-translate-y-0.5">
                  Get started — it&apos;s free
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="mt-4 text-sm text-slate-400">
                  Already have an account?{ " " }
                  <Link href="/login" className="text-emerald-600 hover:underline font-medium">Sign in</Link>
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8">
                  { ["No subscription fee", "Any skill level", "Your neighbourhood"].map((t) => (
                    <span key={ t }
                      className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                      { t }
                    </span>
                  )) }
                </div>
              </div>

              {/* Right — stacked sport images (top row taller, bottom shorter) */ }
              <div ref={ heroRight } className="hidden lg:flex flex-col gap-3 h-full max-h-[520px]">
                <div className="flex gap-3 flex-[3]">
                  { HERO_SPORTS.slice(0, 2).map(({ src, label }) => (
                    <div key={ label } className="relative flex-1 overflow-hidden rounded-2xl">
                      <Image src={ src } alt={ label } fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-4 text-white text-xs font-black tracking-widest uppercase">{ label }</span>
                    </div>
                  )) }
                </div>
                <div className="flex gap-3 flex-[2]">
                  { HERO_SPORTS.slice(2).map(({ src, label }) => (
                    <div key={ label } className="relative flex-1 overflow-hidden rounded-2xl">
                      <Image src={ src } alt={ label } fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-4 text-white text-xs font-black tracking-widest uppercase">{ label }</span>
                    </div>
                  )) }
                </div>
              </div>
            </div>

            {/* Scroll hint */ }
            <div className="h-14 flex items-center justify-center gap-2 text-slate-300">
              <span className="text-[11px] font-semibold tracking-widest uppercase">Scroll to explore</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>
          </section>

          {/* ── 2. HOW IT WORKS ── */ }
          <section id="how-it-works" className="min-h-screen snap-start bg-emerald-950 flex flex-col justify-center px-5 py-20 sm:py-16 relative overflow-hidden [will-change:transform]">
            {/* Logo watermark */ }
            <Image src="/images/peerfit-logo.png" alt="" width={ 340 } height={ 227 } aria-hidden
              className="absolute -bottom-10 -right-10 w-[340px] h-auto object-contain pointer-events-none select-none opacity-[0.06] [filter:brightness(0)_invert(1)]" />

            <div className="max-w-6xl mx-auto w-full relative z-10">

              <div ref={ howTitle } className="text-center mb-10 sm:mb-14">
                <span className="text-emerald-500/70 text-[11px] sm:text-xs font-bold tracking-[.18em] uppercase block mb-3">
                  How it works
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-heading">
                  Up and running<br />in minutes
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                { ([
                  { refEl: step0, n: "01", title: "Post an activity", desc: "Choose a sport, pick a time and location, set how many players you need. Done in under a minute." },
                  { refEl: step1, n: "02", title: "Players join you", desc: "Nearby players browse the feed and request to join. You approve and chat in the activity thread." },
                  { refEl: step2, n: "03", title: "Show up & play", desc: "Meet your new teammates, enjoy the game, and build the habit with people who keep you accountable." },
                ] as const).map(({ refEl, n, title, desc }) => (
                  <div ref={ refEl } key={ n }
                    className="relative bg-white/[0.06] border border-white/10 rounded-3xl p-5 sm:p-8 overflow-hidden hover:bg-white/[0.09] transition-colors duration-300">
                    {/* Watermark number */ }
                    <span
                      className="absolute -top-6 -left-1 text-[140px] font-black leading-none select-none pointer-events-none text-white/[0.035] font-heading">
                      { n }
                    </span>
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                        <span className="text-white text-xs font-black font-heading">{ n }</span>
                      </div>
                      <h3 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3 font-heading">
                        { title }
                      </h3>
                      <p className="text-emerald-200/60 text-sm leading-relaxed">{ desc }</p>
                    </div>
                  </div>
                )) }
              </div>
            </div>
          </section>

          {/* ── 3. SPORTS ── */ }
          <section id="sports" className="min-h-screen snap-start bg-slate-900 flex flex-col justify-center px-5 py-20 sm:py-16 relative overflow-hidden [will-change:transform]">
            {/* Logo watermark */ }
            <Image src="/images/peerfit-logo.png" alt="" width={ 320 } height={ 213 } aria-hidden
              className="absolute -top-8 -left-8 w-[320px] h-auto object-contain pointer-events-none select-none opacity-[0.06] [filter:brightness(0)_invert(1)]" />

            <div className="max-w-6xl mx-auto w-full relative z-10">

              <div ref={ sportsTitle } className="text-center mb-8 sm:mb-10">
                <span className="text-emerald-500 text-[11px] sm:text-xs font-bold tracking-[.18em] uppercase mb-3 sm:mb-4 block">Sports</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-heading">
                  Every sport. Your area.
                </h2>
                <p className="text-slate-400 mt-3 text-sm sm:text-base">From 5-a-side to yoga — find your activity or create one.</p>
              </div>

              <div ref={ sportsGrid } className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                { SPORT_CHIPS.map(({ src, label }) => (
                  <div key={ label } className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image src={ src } alt={ label } fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/45" />
                    <span className="absolute inset-0 flex items-end justify-center pb-3 text-white text-[10px] font-black tracking-widest uppercase">
                      { label }
                    </span>
                  </div>
                )) }
              </div>
            </div>
          </section>

          {/* ── 4. WHY PEERFIT ── */ }
          <section id="community" className="min-h-screen snap-start bg-slate-50 flex flex-col justify-center px-5 py-20 sm:py-16 relative overflow-hidden [will-change:transform]">
            <Image src="/images/peerfit-logo.png" alt="" width={ 300 } height={ 200 } aria-hidden
              className="absolute -bottom-6 -right-6 w-[300px] h-auto object-contain pointer-events-none select-none opacity-[0.07] [filter:brightness(0)]" />

            <div className="max-w-6xl mx-auto w-full relative z-10">

              <div ref={ commTitle } className="text-center mb-10 sm:mb-14">
                <span className="text-emerald-600 text-[11px] sm:text-xs font-bold tracking-[.18em] uppercase mb-3 sm:mb-4 block">Why PeerFit</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading">
                  Built for players,<br />not algorithms.
                </h2>
                <p className="text-slate-500 mt-3 text-sm sm:text-base max-w-lg mx-auto">
                  No feed, no followers, no ads. Just you, your sport, and people nearby who want to play.
                </p>
              </div>

              <div ref={ commCards } className="grid md:grid-cols-3 gap-4 sm:gap-6">
                { COMMUNITY_STATS.map(({ value, label, desc }) => (
                  <div key={ label }
                    className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
                    <p className="text-5xl sm:text-6xl font-black text-emerald-600 mb-2 font-heading">
                      { value }
                    </p>
                    <p className="text-base font-bold text-slate-800 mb-2">{ label }</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{ desc }</p>
                  </div>
                )) }
              </div>

              {/* Value prop strip */ }
              <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 sm:p-6">
                  <p className="text-base font-bold text-slate-800 mb-1">Open to everyone</p>
                  <p className="text-sm text-slate-500">Any skill level, any sport. Whether you&apos;re a beginner looking for a casual kick-about or a competitive player searching for a serious match.</p>
                </div>
                <div className="bg-slate-900 rounded-2xl p-5 sm:p-6">
                  <p className="text-base font-bold text-white mb-1">Private or public activities</p>
                  <p className="text-sm text-slate-400">Create open sessions anyone can join, or private invite-only games where you approve every player yourself.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. FINAL CTA + embedded footer ── */ }
          <section className="min-h-screen snap-start bg-emerald-950 flex flex-col relative overflow-hidden [will-change:transform]">
            {/* Logo watermark — large, centred */ }
            <Image src="/images/peerfit-logo.png" alt="" width={ 480 } height={ 320 } aria-hidden
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-auto object-contain pointer-events-none select-none opacity-[0.06] [filter:brightness(0)_invert(1)]" />
            {/* Decorative glows */ }
            <div className="absolute top-1/4 -left-20 w-[500px] h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* CTA body */ }
            <div className="flex-1 flex flex-col justify-center items-center px-5 py-20 sm:py-16 relative z-10">
              <div ref={ ctaContent } className="max-w-2xl text-center">
                <div className="flex justify-center mb-6 sm:mb-8">
                  <Image src="/images/peerfit-logo.png" alt="PeerFit" width={ 160 } height={ 107 } className="h-12 sm:h-16 w-auto object-contain opacity-80" />
                </div>
                <h2
                  className="text-5xl sm:text-6xl lg:text-[88px] font-black text-white leading-[0.92] tracking-tight mb-5 sm:mb-7 font-heading">
                  Ready<br />to play?
                </h2>
                <p className="text-emerald-300/75 text-base sm:text-lg mb-7 sm:mb-10 leading-relaxed max-w-sm mx-auto">
                  Join PeerFit for free and find local games in your sport today.
                </p>
                <Link href="/login?mode=signup"
                  className="inline-flex items-center gap-2 sm:gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base sm:text-lg px-6 sm:px-9 py-3 sm:py-4 rounded-2xl transition-all shadow-2xl shadow-emerald-900/60 hover:scale-[1.03] hover:-translate-y-0.5">
                  Create your free account
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <p className="mt-5 sm:mt-6 text-sm text-emerald-800">
                  Have an account?{ " " }
                  <Link href="/login" className="text-emerald-500 hover:text-emerald-300 transition-colors underline">Sign in</Link>
                </p>
              </div>
            </div>

            {/* Embedded footer strip */ }
            <div className="relative z-10 px-4 sm:px-5 py-4 sm:py-5 border-t border-white/[0.07]">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Image src="/images/peerfit-logo.png" alt="PeerFit" width={ 64 } height={ 43 } className="h-6 w-auto object-contain opacity-50" />
                  <span className="text-emerald-900/50 text-xs">&copy; { new Date().getFullYear() }</span>
                </div>
                <nav className="flex flex-wrap justify-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-emerald-800">
                  { [
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Consumer Terms", href: "/consumer-terms" },
                    { label: "Contact", href: "/contact" },
                  ].map(({ label, href }) => (
                    <Link key={ label } href={ href } className="hover:text-emerald-500 transition-colors">{ label }</Link>
                  )) }
                </nav>
              </div>
            </div>
          </section>

        </div>
      </div>
    )
  }
