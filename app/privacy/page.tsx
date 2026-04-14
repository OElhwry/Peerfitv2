  import type { Metadata } from "next"
  import Link from "next/link"

  export const metadata: Metadata = {
    title: "Privacy Policy | PeerFit",
    description: "How PeerFit collects, uses, stores, and protects personal information.",
  }

  const sections = [
    {
      title: "What We Collect",
      body:
        "PeerFit may collect information you provide directly, including your name, email address, phone number, profile details, sport preferences, messages, and account activity. We may also collect technical data such as device information, browser type, and usage analytics.",
    },
    {
      title: "How We Use Your Information",
      body:
        "We use your information to create and manage your account, help you connect with other users, support activity discovery and participation, send important service messages, improve the platform, and keep PeerFit safe and secure.",
    },
    {
      title: "Sharing Information",
      body:
        "We only share personal information when needed to operate the service, comply with legal obligations, protect users, or work with trusted service providers. We do not sell your personal data to third parties.",
    },
    {
      title: "Data Retention",
      body:
        "We keep information for as long as reasonably necessary to operate PeerFit, meet legal obligations, resolve disputes, and enforce our terms. If you close your account, some information may be retained where required for safety, fraud prevention, or compliance.",
    },
    {
      title: "Your Choices",
      body:
        "You can update parts of your account information inside the app and you may opt out of optional marketing messages at any time. You can also contact us if you want to ask about access, correction, or deletion of your information.",
    },
    {
      title: "Security",
      body:
        "PeerFit uses reasonable administrative, technical, and organisational measures to protect your information. No method of storage or transmission is completely secure, so we cannot guarantee absolute security.",
    },
  ]

  export default function PrivacyPage() {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#f0fdf4_50%,#f8fafc_100%)] text-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
          <div className="rounded-[2rem] border border-emerald-200/70 bg-white/90 p-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">PeerFit Legal</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950" style={ { fontFamily: "var(--font-space-grotesk)" } }>
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              This policy explains how PeerFit handles personal information when you create an account, explore activities,
              and use the platform.
            </p>

            <div className="mt-10 space-y-8">
              { sections.map((section) => (
                <section key={ section.title } className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
                  <h2 className="text-xl font-bold text-slate-900">{ section.title }</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{ section.body }</p>
                </section>
              )) }
            </div>

            <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-xl font-bold text-slate-900">Important Note</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                This is a practical placeholder privacy policy for product linking and onboarding. It should be reviewed by a
                qualified legal adviser before production use, especially for UK data protection compliance.
              </p>
            </section>

            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm">
              <Link href="/terms" className="font-semibold text-emerald-700 hover:text-emerald-600">
                Read Terms of Service
              </Link>
              <Link href="/contact" className="font-semibold text-slate-600 hover:text-slate-900">
                Contact PeerFit
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }
