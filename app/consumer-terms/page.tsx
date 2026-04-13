import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Consumer Terms | PeerFit",
  description: "Consumer-facing terms covering bookings, payments, cancellations, and user responsibilities on PeerFit.",
}

const sections = [
  {
    title: "Bookings and Commitments",
    body:
      "When you join, request, or book an activity through PeerFit, you agree to provide accurate information and attend only if you can reasonably meet the commitment. Repeated no-shows or misleading activity information may lead to restrictions on your account.",
  },
  {
    title: "Payments and Refunds",
    body:
      "If PeerFit introduces paid features, subscriptions, or booking fees, prices and refund rules will be shown clearly before purchase. Unless a separate policy says otherwise, refunds may be limited once a booking has been confirmed or a paid period has started.",
  },
  {
    title: "Cancellations",
    body:
      "You should cancel as early as possible if you cannot attend. PeerFit may apply limits or account action where cancellations or no-shows materially disrupt organisers or other players.",
  },
  {
    title: "Health and Safety",
    body:
      "You are responsible for deciding whether an activity is suitable for your fitness level, health, and experience. PeerFit does not provide medical advice, and participation in physical activities is at your own risk.",
  },
  {
    title: "Disputes and Support",
    body:
      "If something goes wrong with an activity, booking, or user interaction, contact PeerFit support with the relevant details. We may investigate, mediate where appropriate, and take platform action to protect the community.",
  },
  {
    title: "Changes to These Terms",
    body:
      "PeerFit may update these consumer terms from time to time as the service evolves. Where changes materially affect users, we will aim to provide notice within the product or by email.",
  },
]

export default function ConsumerTermsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.18),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_48%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
        <div className="rounded-[2rem] border border-sky-200/70 bg-white/90 p-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">PeerFit Legal</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Consumer Terms
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            These terms focus on what users can expect when they join activities through PeerFit, including commitments,
            cancellations, safety, and any future paid features.
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">Important Note</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              This page gives you solid placeholder consumer terms for onboarding and linking, but it is not a substitute for legal
              review. It should be checked by a qualified adviser before relying on it in production.
            </p>
          </section>

          <div className="mt-10 flex flex-wrap items-center gap-4 text-sm">
            <Link href="/terms" className="font-semibold text-sky-700 hover:text-sky-600">
              Read Terms of Service
            </Link>
            <Link href="/login?mode=signup&step=terms" className="font-semibold text-slate-600 hover:text-slate-900">
              Back to signup
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
