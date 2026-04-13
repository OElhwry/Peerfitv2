import type { Metadata } from "next"
import Link from "next/link"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact | PeerFit",
  description: "Contact PeerFit for support, legal questions, or general enquiries.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),_transparent_32%),linear-gradient(180deg,#0f172a_0%,#111827_48%,#0f172a_100%)] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.8)] backdrop-blur sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">PeerFit Contact</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Get in touch
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            For support, account help, partnership questions, or legal enquiries, contact PeerFit by email and we will get
            back to you as soon as we can.
          </p>

          <section className="mt-10 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/80">Email</p>
                <a href="mailto:peerfit@gmail.com" className="mt-2 block text-2xl font-bold text-white hover:text-emerald-300">
                  peerfit@gmail.com
                </a>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Use this address for customer support, privacy requests, and general communication about PeerFit.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-10 flex flex-wrap items-center gap-4 text-sm">
            <Link href="/privacy" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Terms of Service
            </Link>
            <Link href="/consumer-terms" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Consumer Terms
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
