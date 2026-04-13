import { ArrowRight, CheckCircle, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import PeerfitLogo from "@/components/peerfit-logo"

/* ── Sport image grid data ── */
const HERO_SPORTS = [
  { src: "/images/sports/football.jpg",   label: "Football" },
  { src: "/images/sports/tennis.jpg",     label: "Tennis" },
  { src: "/images/sports/running.jpg",    label: "Running" },
  { src: "/images/sports/basketball.jpg", label: "Basketball" },
]

const SPORT_CHIPS = [
  { src: "/images/sports/football.jpg",   label: "Football" },
  { src: "/images/sports/tennis.jpg",     label: "Tennis" },
  { src: "/images/sports/running.jpg",    label: "Running" },
  { src: "/images/sports/basketball.jpg", label: "Basketball" },
  { src: "/images/sports/boxing.jpg",     label: "Boxing" },
  { src: "/images/sports/swimming.jpg",   label: "Swimming" },
  { src: "/images/sports/cycling.jpg",    label: "Cycling" },
  { src: "/images/sports/gym.jpg",        label: "Gym" },
  { src: "/images/sports/rugby.jpg",      label: "Rugby" },
  { src: "/images/sports/volleyball.jpg", label: "Volleyball" },
  { src: "/images/sports/padel.jpg",      label: "Padel" },
  { src: "/images/sports/yoga.jpg",       label: "Yoga" },
]

const TESTIMONIALS = [
  {
    quote: "Found a 5-a-side team in my area within a week. We play every Thursday now without fail.",
    name: "James K.", role: "London · Football", initial: "J",
  },
  {
    quote: "I was new to the city and didn't know anyone. PeerFit changed that — I've made real friends through running groups.",
    name: "Priya S.", role: "Manchester · Running", initial: "P",
  },
  {
    quote: "Finally a tennis partner at my level. We've been playing twice a week for six months.",
    name: "Sarah M.", role: "London · Tennis", initial: "S",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <PeerfitLogo size={34} className="text-emerald-600" />
            <span className="font-black text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors"
              style={{ fontFamily: "var(--font-space-grotesk)" }}>
              PeerFit
            </span>
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#sports" className="hover:text-slate-900 transition-colors">Sports</a>
            <a href="#community" className="hover:text-slate-900 transition-colors">Community</a>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5">
              Log in
            </Link>
            <Link href="/login?mode=signup"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-24 grid lg:grid-cols-2 gap-14 items-center">

        {/* Left — copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Free to join · 15+ sports · Local games
          </div>

          <h1 className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-slate-900 mb-6"
            style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Find your game.<br />
            <span className="text-emerald-600">Play more.</span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-md">
            PeerFit connects you with local players for any sport. Browse activities near you or post your own — and never play alone again.
          </p>

          {/* Primary CTA */}
          <Link href="/login?mode=signup"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base px-6 py-3.5 rounded-xl transition-colors shadow-md shadow-emerald-100">
            Get started — it's free
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="mt-4 text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">Sign in</Link>
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              "No subscription fee",
              "Any skill level",
              "Your neighbourhood",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right — sport image grid */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {HERO_SPORTS.map(({ src, label }, i) => (
            <div key={label}
              className={`relative overflow-hidden rounded-2xl ${i === 0 ? "aspect-[4/3]" : i === 3 ? "aspect-[4/3]" : "aspect-square"}`}>
              <Image src={src} alt={label} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3.5 text-white text-xs font-black tracking-widest uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-slate-50 border-y border-slate-100 py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3"
              style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Up and running in minutes
            </h2>
            <p className="text-slate-500 text-base max-w-md mx-auto">
              No setup, no fee. Just pick a sport and go.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(16.666%+1rem)] right-[calc(16.666%+1rem)] h-px bg-emerald-100" />

            {[
              {
                n: "01",
                title: "Post an activity",
                desc: "Choose a sport, pick a time and location, set how many players you need. Done in under a minute.",
              },
              {
                n: "02",
                title: "Players join you",
                desc: "Nearby players browse the feed and request to join. You approve and chat in the activity thread.",
              },
              {
                n: "03",
                title: "Show up & play",
                desc: "Meet your new teammates, enjoy the game, and build the habit with people who keep you accountable.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="relative text-center md:text-left">
                <div className="w-14 h-14 bg-emerald-600 text-white font-black text-lg rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-5 relative z-10"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {n}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SPORTS GRID
      ══════════════════════════════════════════ */}
      <section id="sports" className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3"
              style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Every sport. Your area.
            </h2>
            <p className="text-slate-500 text-base">
              From 5-a-side to yoga, find your activity or create one.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {SPORT_CHIPS.map(({ src, label }) => (
              <div key={label}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-default">
                <Image src={src} alt={label} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <span className="absolute inset-0 flex items-end justify-center pb-2.5 text-white text-[11px] font-bold tracking-wide uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section id="community" className="bg-slate-50 border-y border-slate-100 py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3"
              style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Real people. Real games.
            </h2>
            <p className="text-slate-500 text-base">What the PeerFit community says.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, role, initial }) => (
              <div key={name} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-black shrink-0">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-24 px-5 bg-emerald-950 relative overflow-hidden">
        {/* background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl mx-auto text-center relative">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5"
            style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Ready to play?
          </h2>
          <p className="text-emerald-300/80 text-base mb-8 leading-relaxed">
            Join PeerFit for free and find local games in your sport today.
          </p>

          <Link href="/login?mode=signup"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/40">
            Create your free account
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="mt-5 text-emerald-600 text-sm">
            Have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 underline">Sign in</Link>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 px-5 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <PeerfitLogo size={26} className="text-emerald-500 opacity-80" />
              <span className="font-black text-white text-base" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                PeerFit
              </span>
              <span className="text-slate-600 text-sm ml-1">— Find people. Play sports. Stay active.</span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Consumer Terms", href: "/consumer-terms" },
                { label: "Contact", href: "/contact" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="hover:text-slate-200 transition-colors">{label}</Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-slate-800 pt-6 text-xs text-slate-600">
            &copy; {new Date().getFullYear()} PeerFit. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
