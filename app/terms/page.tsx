  import type { Metadata } from "next"
  import Link from "next/link"

  export const metadata: Metadata = {
    title: "Terms of Service | PeerFit",
    description: "PeerFit terms of service for using the platform, joining activities, and managing your account.",
  }

  const sections = [
    {
      title: "Using PeerFit",
      body:
        "PeerFit helps you discover activities, connect with other players, and take part in sport-related experiences. You must use the service lawfully, keep your account information accurate, and avoid impersonation, harassment, or misuse of the platform.",
    },
    {
      title: "Accounts and Eligibility",
      body:
        "You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your login details and for activity that happens through your account.",
    },
    {
      title: "Community Conduct",
      body:
        "You agree to treat other users respectfully, communicate honestly, and avoid posting content that is abusive, discriminatory, misleading, dangerous, or unlawful. PeerFit may suspend or remove accounts that put other users or the platform at risk.",
    },
    {
      title: "Activities and Meetups",
      body:
        "PeerFit may list activities created by users or third parties. We do not guarantee attendance, quality, safety, or outcomes of any activity. You remain responsible for your own decisions, preparation, insurance, and personal safety when taking part.",
    },
    {
      title: "Content and Platform Rights",
      body:
        "You retain ownership of content you submit, but you grant PeerFit a limited licence to host, display, and use that content to operate and improve the service. The PeerFit brand, design, and software remain owned by PeerFit or its licensors.",
    },
    {
      title: "Suspension and Termination",
      body:
        "We may limit, suspend, or terminate access where needed to investigate misuse, protect users, comply with law, or maintain the integrity of the service. You may stop using PeerFit at any time.",
    },
  ]

  export default function TermsPage() {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ecfdf5_52%,#f8fafc_100%)] text-slate-900">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10 sm:py-16">
          <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-200/70 bg-white/90 p-5 sm:p-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur md:p-12">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-emerald-600">PeerFit Legal</p>
            <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-heading">
              Terms of Service
            </h1>
            <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base leading-6 sm:leading-7 text-slate-600">
              These terms explain the core rules for using PeerFit. They are meant to set clear expectations around accounts,
              behaviour, activities, and how the platform operates.
            </p>

            <div className="mt-8 sm:mt-10 space-y-5 sm:space-y-8">
              { sections.map((section) => (
                <section key={ section.title } className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">{ section.title }</h2>
                  <p className="mt-2 sm:mt-3 text-sm leading-6 sm:leading-7 text-slate-600">{ section.body }</p>
                </section>
              )) }
            </div>

            <section className="mt-6 sm:mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Important Note</h2>
              <p className="mt-2 sm:mt-3 text-sm leading-6 sm:leading-7 text-slate-700">
                These terms are a product-ready placeholder for your onboarding flow, not jurisdiction-specific legal advice. Before
                launch, have a qualified solicitor or legal adviser review them for your business model and UK compliance needs.
              </p>
            </section>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
              <Link href="/consumer-terms" className="font-semibold text-emerald-700 hover:text-emerald-600">
                Read Consumer Terms
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
