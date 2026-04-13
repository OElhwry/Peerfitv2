"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Mail, ArrowLeft, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error: err } = await createClient().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    setLoading(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  const darkInput = "w-full h-11 bg-white/8 border border-white/12 rounded-xl text-white placeholder:text-white/25 text-sm px-4 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 flex flex-col items-center justify-center px-5 relative overflow-hidden">

      {/* background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-64 h-64 rounded-full bg-teal-500/8 blur-3xl" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-10 group hover:opacity-80 transition-opacity">
          <Image src="/images/peerfit-logo.png" alt="PeerFit" width={180} height={120} className="h-16 w-auto object-contain -my-3 [filter:brightness(0)_invert(1)]" />
        </Link>

        {/* Back link */}
        <Link href="/login"
          className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/65 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Back to sign in
        </Link>

        {sent ? (
          /* ── Success state ── */
          <div className="text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Check your inbox
              </h1>
              <p className="text-white/45 text-sm leading-relaxed">
                We sent a reset link to{" "}
                <span className="text-white/70 font-medium">{email}</span>
              </p>
            </div>
            <p className="text-xs text-white/25">
              Didn't get it?{" "}
              <button onClick={() => setSent(false)} className="text-emerald-400/80 hover:text-emerald-400">
                Try again
              </button>
            </p>
            <Link href="/login"
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/40">
              Back to sign in <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        ) : (
          /* ── Form state ── */
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2"
                style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Reset password
              </h1>
              <p className="text-white/45 text-sm leading-relaxed">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${darkInput} pl-10`}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 rounded-xl text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <>Send reset link <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-white/20">
              Remember your password?{" "}
              <Link href="/login" className="text-emerald-400/70 hover:text-emerald-400">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
