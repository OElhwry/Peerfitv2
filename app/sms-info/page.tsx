import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Info, Shield, Smartphone } from "lucide-react"

export const metadata: Metadata = {
  title: "SMS Info | PeerFit",
  description: "Learn how PeerFit uses SMS verification during sign up.",
}

const points = [
  {
    icon: Smartphone,
    title: "Why we send SMS codes",
    body: "PeerFit uses a one-time code to confirm that the phone number on your account belongs to you.",
  },
  {
    icon: Shield,
    title: "What to expect",
    body: "Standard carrier or messaging charges may apply. Codes are short-lived and only used for account verification.",
  },
  {
    icon: Info,
    title: "If a code does not arrive",
    body: "Wait for the resend timer to finish, check the number format, and make sure your device can receive text messages.",
  },
]

export default function SmsInfoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/login?mode=signup&step=phone"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to phone verification
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">SMS verification</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Why PeerFit asks for your phone number
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
            Phone verification helps reduce fake accounts and protects key account actions during sign up.
          </p>

          <div className="mt-8 space-y-4">
            {points.map(({ icon: Icon, title, body }) => (
              <section key={title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2">
                    <Icon className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/60">{body}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
