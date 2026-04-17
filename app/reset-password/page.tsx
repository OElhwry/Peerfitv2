"use client"

import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, ChevronLeft, Eye, EyeOff, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

function pwStrength(pw: string): { bars: number; label: string; color: string } {
  if (!pw) return { bars: 0, label: "", color: "" }
  if (pw.length < 8) return { bars: 1, label: "Too short", color: "bg-red-500" }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(pw)).length
  if (variety <= 2) return { bars: 2, label: "Fair", color: "bg-amber-400" }
  return { bars: 3, label: "Strong", color: "bg-emerald-400" }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [sessionReady, setSessionReady] = useState(false)

  const strength = pwStrength(password)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true)
      } else {
        setErrorMsg("Invalid or expired reset link. Please request a new one.")
      }
    })
  }, [])

  const isStrong = (p: string) => p.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(p)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!isStrong(password)) {
      setErrorMsg("Password must be at least 8 characters with uppercase, lowercase, and a number.")
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.")
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setIsLoading(false)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push("/login"), 3000)
    }
  }

  const darkInput = "w-full h-11 bg-white/8 border border-white/12 rounded-xl text-white placeholder:text-white/25 text-sm px-4 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 px-5 py-10 relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-56 h-56 rounded-full bg-teal-500/8 blur-3xl" />

      <div className="relative w-full max-w-sm">
        {/* Logo + back */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image src="/images/peerfit-logo.png" alt="PeerFit" width={180} height={120}
              className="h-12 w-auto object-contain [filter:brightness(0)_invert(1)]" />
          </Link>
          <Link href="/login" className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />Back to sign in
          </Link>
        </div>

        {done ? (
          <div className="text-center space-y-5 py-6">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-xl font-heading">Password updated!</p>
              <p className="text-white/45 text-sm mt-1">Redirecting you to sign in…</p>
            </div>
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-white leading-tight font-heading">
                Set new<br />
                <span className="text-emerald-400">password.</span>
              </h1>
              <p className="text-white/45 text-sm mt-2">Choose a strong password for your account.</p>
            </div>

            {!sessionReady && !errorMsg && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {sessionReady && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${darkInput} pl-10 pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2 h-5">
                    {password && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.bars ? strength.color : "bg-white/10"}`} />
                          ))}
                        </div>
                        <span className={`text-[10px] font-semibold ${strength.bars === 1 ? "text-red-400" : strength.bars === 2 ? "text-amber-400" : "text-emerald-400"}`}>
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                      type="password"
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${darkInput} pl-10`}
                      required
                    />
                  </div>
                  {confirmPassword && (
                    <p className={`text-xs mt-1.5 font-medium ${password === confirmPassword ? "text-emerald-400" : "text-red-400"}`}>
                      {password === confirmPassword ? "✓ Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>
              </>
            )}

            {errorMsg && (
              <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-300">
                {errorMsg}{" "}
                {errorMsg.includes("expired") && (
                  <a href="/forgot-password" className="underline font-medium">Request a new link</a>
                )}
              </div>
            )}

            {sessionReady && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
