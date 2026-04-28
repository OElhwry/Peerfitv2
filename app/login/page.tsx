"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Eye, EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Users,
  Zap,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { Suspense, useEffect, useRef, useState } from "react"

const REMEMBER_KEY = "peerfit_remember_email"
const EMAIL_OTP_COOLDOWN_KEY = "peerfit_email_otp_last_sent_at"
const EMAIL_OTP_COOLDOWN_SECONDS = 60
type SignupStep = "email" | "verify-email" | "terms" | "dob" | "phone"

function isSignupStep(value: string | null): value is SignupStep {
  return value !== null && ["email", "verify-email", "terms", "dob", "phone"].includes(value)
}

const COUNTRY_CODES = [
  { code: "+1",   label: "🇺🇸 US  +1" },
  { code: "+1",   label: "🇨🇦 CA  +1" },
  { code: "+44",  label: "🇬🇧 UK  +44" },
  { code: "+61",  label: "🇦🇺 AU  +61" },
  { code: "+91",  label: "🇮🇳 IN  +91" },
  { code: "+49",  label: "🇩🇪 DE  +49" },
  { code: "+33",  label: "🇫🇷 FR  +33" },
  { code: "+34",  label: "🇪🇸 ES  +34" },
  { code: "+39",  label: "🇮🇹 IT  +39" },
  { code: "+81",  label: "🇯🇵 JP  +81" },
  { code: "+55",  label: "🇧🇷 BR  +55" },
  { code: "+52",  label: "🇲🇽 MX  +52" },
  { code: "+971", label: "🇦🇪 AE  +971" },
  { code: "+234", label: "🇳🇬 NG  +234" },
  { code: "+27",  label: "🇿🇦 ZA  +27" },
]

const SIGNUP_STEPS: SignupStep[] = ["email", "verify-email", "terms", "dob", "phone"]
const PREV_STEP: Record<SignupStep, SignupStep> = {
  "email": "email",
  "verify-email": "email",
  "terms": "verify-email",
  "dob": "terms",
  "phone": "dob",
}

function splitPhoneNumber(fullPhone: string) {
  const knownCodes = [...new Set(COUNTRY_CODES.map((c) => c.code))].sort((a, b) => b.length - a.length)
  const matchedCode = knownCodes.find((code) => fullPhone.startsWith(code))
  if (!matchedCode) return { code: "+44", local: fullPhone.replace(/^\+/, "") }
  return { code: matchedCode, local: fullPhone.slice(matchedCode.length) }
}

function readEmailOtpCooldowns(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    const stored = window.localStorage.getItem(EMAIL_OTP_COOLDOWN_KEY)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {}
  } catch { return {} }
}

function getEmailOtpSecondsRemaining(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return 0
  const sentAt = readEmailOtpCooldowns()[normalizedEmail]
  if (!sentAt || Number.isNaN(sentAt)) return 0
  return Math.max(0, EMAIL_OTP_COOLDOWN_SECONDS - Math.floor((Date.now() - sentAt) / 1000))
}

function markEmailOtpSent(email: string) {
  if (typeof window === "undefined") return
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return
  const cooldowns = readEmailOtpCooldowns()
  cooldowns[normalizedEmail] = Date.now()
  window.localStorage.setItem(EMAIL_OTP_COOLDOWN_KEY, JSON.stringify(cooldowns))
}

const SPORT_TILES = [
  { img: "/images/sports/football.jpg",   label: "Football" },
  { img: "/images/sports/basketball.jpg", label: "Basketball" },
  { img: "/images/sports/tennis.jpg",     label: "Tennis" },
  { img: "/images/sports/boxing.jpg",     label: "Boxing" },
  { img: "/images/sports/running.jpg",    label: "Running" },
  { img: "/images/sports/swimming.jpg",   label: "Swimming" },
]

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

/* ── OTP boxes ── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const r0 = useRef<HTMLInputElement>(null)
  const r1 = useRef<HTMLInputElement>(null)
  const r2 = useRef<HTMLInputElement>(null)
  const r3 = useRef<HTMLInputElement>(null)
  const r4 = useRef<HTMLInputElement>(null)
  const r5 = useRef<HTMLInputElement>(null)
  const refs = [r0, r1, r2, r3, r4, r5]

  const handle = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1)
    const a = value.padEnd(6, " ").split("")
    a[i] = d || " "
    onChange(a.join("").trimEnd())
    if (d && i < 5) refs[i + 1].current?.focus()
  }
  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key !== "Backspace") return
    const a = value.padEnd(6, " ").split("")
    if (!a[i].trim() && i > 0) {
      a[i - 1] = " "; onChange(a.join("").trimEnd()); refs[i - 1].current?.focus()
    } else {
      a[i] = " "; onChange(a.join("").trimEnd())
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={value[i]?.trim() ?? ""}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center font-bold text-xl border border-paper/20 focus:border-brand-pitch focus:outline-none transition-colors bg-paper/5 text-paper"
          style={{ fontFamily: "var(--font-big-shoulders), system-ui, sans-serif" }}
        />
      ))}
    </div>
  )
}

function pwStrength(pw: string): { bars: number; label: string; color: string } {
  if (!pw) return { bars: 0, label: "", color: "" }
  if (pw.length < 8) return { bars: 1, label: "Too short", color: "bg-red-500" }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(pw)).length
  if (variety <= 2) return { bars: 2, label: "Fair", color: "bg-stone-400" }
  return { bars: 3, label: "Strong", color: "bg-brand-pitch" }
}

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get("step")
  const requestedMode = searchParams.get("mode")
  const redirectTo = searchParams.get("redirectTo")
  const requestedStep: SignupStep | null = isSignupStep(stepParam) ? stepParam : null
  const [active, setActive] = useState<"signin" | "signup">(
    requestedMode === "signup" ? "signup" : "signin"
  )

  /* sign-in */
  const [siEmail, setSiEmail] = useState("")
  const [siPw, setSiPw] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [siLoading, setSiLoading] = useState(false)
  const [siError, setSiError] = useState("")

  /* sign-up stepped */
  const [step, setStep] = useState<SignupStep>(requestedStep ?? "email")
  const [suEmail, setSuEmail] = useState("")
  const [suPw, setSuPw] = useState("")
  const [showSuPw, setShowSuPw] = useState(false)
  const [emailCode, setEmailCode] = useState("")
  const [ageTerms, setAgeTerms] = useState(false)
  const [ageMkt, setAgeMkt] = useState(false)
  const [dobD, setDobD] = useState("")
  const [dobM, setDobM] = useState("")
  const [dobY, setDobY] = useState("")
  const [cc, setCc] = useState("+44")
  const [phone, setPhone] = useState("")
  const [suLoading, setSuLoading] = useState(false)
  const [suError, setSuError] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const s = localStorage.getItem(REMEMBER_KEY)
    if (s) { setSiEmail(s); setRememberMe(true) }
  }, [])

  useEffect(() => {
    setActive(requestedMode === "signup" ? "signup" : "signin")
    if (requestedMode === "signup" && requestedStep) {
      setStep(requestedStep); setSuError(""); setSiError("")
    }
  }, [requestedMode, requestedStep])

  useEffect(() => {
    if (requestedMode !== "signup" || !requestedStep || requestedStep === "email" || requestedStep === "verify-email") return
    let cancelled = false
    const loadUser = async () => {
      const { data: { user } } = await createClient().auth.getUser()
      if (cancelled || !user) return
      if (user.email) setSuEmail(user.email.toLowerCase())
      if (user.phone) {
        const { code, local } = splitPhoneNumber(user.phone)
        setCc(code); setPhone(local)
      }
    }
    loadUser()
    return () => { cancelled = true }
  }, [requestedMode, requestedStep])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (step === "verify-email") { setCountdown(getEmailOtpSecondsRemaining(suEmail)); return }
    setCountdown(0)
  }, [step, suEmail])

  useEffect(() => {
    if (requestedStep !== "terms" || step !== "terms") return
    const currentUrl = `${window.location.pathname}${window.location.search}`
    window.history.pushState(null, "", currentUrl)
    const handlePopState = () => window.history.pushState(null, "", currentUrl)
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [requestedStep, step])

  /* ── sign in ── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setSiLoading(true); setSiError("")
    const sb = createClient()
    const { data, error } = await sb.auth.signInWithPassword({
      email: siEmail.trim().toLowerCase(), password: siPw,
    })
    if (error) {
      setSiError(error.message.includes("Invalid login credentials") ? "Incorrect email or password." : error.message)
      setSiLoading(false); return
    }
    if (data.session) {
      rememberMe ? localStorage.setItem(REMEMBER_KEY, siEmail.trim().toLowerCase()) : localStorage.removeItem(REMEMBER_KEY)
      router.push(redirectTo ?? "/feed")
    }
    setSiLoading(false)
  }

  /* ── sign up steps ── */
  const sendEmailCode = async () => {
    setSuError("")
    const email = suEmail.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setSuError("Please enter a valid email address."); return }
    if (suPw.length < 8) { setSuError("Password must be at least 8 characters."); return }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(suPw)) { setSuError("Password needs uppercase, lowercase & a number."); return }
    const remaining = getEmailOtpSecondsRemaining(email)
    if (remaining > 0) {
      setCountdown(remaining); setStep("verify-email")
      setSuError(`A code was already sent recently. Please wait ${remaining}s before requesting another one.`); return
    }
    setSuLoading(true)
    const { error } = await createClient().auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    if (error) {
      if (/rate limit/i.test(error.message)) {
        markEmailOtpSent(email); setCountdown(EMAIL_OTP_COOLDOWN_SECONDS); setStep("verify-email")
        setSuError(`A code was already sent recently. Please wait ${EMAIL_OTP_COOLDOWN_SECONDS}s before requesting another one.`)
      } else { setSuError(error.message) }
      setSuLoading(false); return
    }
    markEmailOtpSent(email); setStep("verify-email"); setCountdown(EMAIL_OTP_COOLDOWN_SECONDS); setSuLoading(false)
  }

  const verifyEmail = async () => {
    setSuError("")
    const code = emailCode.replace(/\s/g, "")
    if (code.length !== 6) { setSuError("Please enter the 6-digit code."); return }
    setSuLoading(true)
    const { error } = await createClient().auth.verifyOtp({ email: suEmail.trim().toLowerCase(), token: code, type: "email" })
    if (error) { setSuError("Invalid code. Try again."); setSuLoading(false); return }
    await createClient().auth.updateUser({ password: suPw })
    setStep("terms"); setSuLoading(false)
  }

  const acceptTerms = async () => {
    if (!ageTerms) { setSuError("You must agree to the Terms and Consumer Terms to continue."); return }
    setSuError(""); setSuLoading(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    const metadata = user?.user_metadata && typeof user.user_metadata === "object"
      ? (user.user_metadata as Record<string, unknown>) : {}
    const { error } = await sb.auth.updateUser({
      data: {
        ...metadata,
        accepted_terms_at: new Date().toISOString(),
        accepted_consumer_terms_at: new Date().toISOString(),
        marketing_opt_in: ageMkt,
      },
    })
    if (error) { setSuError(error.message); setSuLoading(false); return }
    setSuLoading(false); setStep("dob")
  }

  const saveDob = async () => {
    const d = parseInt(dobD), m = parseInt(dobM), y = parseInt(dobY)
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) {
      setSuError("Please enter a valid date of birth."); return
    }
    const age = Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 13) { setSuError("You must be at least 13 years old."); return }
    setSuError(""); setSuLoading(true)
    const { data: { user } } = await createClient().auth.getUser()
    if (user) {
      await createClient().from("profiles").update({
        date_of_birth: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      }).eq("id", user.id)
    }
    setSuLoading(false); setStep("phone")
  }

  const finishSignup = async (skipPhone = false) => {
    setSuError("")
    const digits = phone.replace(/\D/g, "")
    if (!skipPhone && phone.trim() && digits.length < 7) {
      setSuError("Please enter a valid phone number or skip for now."); return
    }
    setSuLoading(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (user) {
      const profileUpdate: { onboarding_complete: boolean; phone?: string | null } = { onboarding_complete: true }
      profileUpdate.phone = skipPhone || !phone.trim() ? null : `${cc}${digits}`
      await sb.from("profiles").update(profileUpdate).eq("id", user.id)
    }
    setSuLoading(false); router.push("/feed")
  }

  const handleGoogle = async () => {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/login?mode=signup&step=terms")}` },
    })
  }

  const otpReady = (v: string) => v.replace(/\s/g, "").length === 6
  const stepIdx = SIGNUP_STEPS.indexOf(step)
  const suStrength = pwStrength(suPw)
  const hideSignupBackButton = step === "terms" && requestedStep === "terms"

  /* ── shared class strings ── */
  const inputCls = "w-full h-11 bg-paper/5 border border-paper/15 text-paper placeholder:text-paper/25 text-sm px-4 focus:outline-none focus:border-brand-pitch transition-all"
  const primaryBtn = "w-full h-11 bg-brand-pitch hover:bg-brand-pitch-hover disabled:opacity-40 text-paper t-mono-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"

  return (
    <div className="min-h-screen flex bg-ink">

      {/* ══════════════════════════════════════
          LEFT — auth panel
      ══════════════════════════════════════ */}
      <div className="w-full md:w-[460px] lg:w-[500px] flex-shrink-0 flex flex-col bg-ink px-5 sm:px-8 py-6 sm:py-10 relative overflow-hidden border-r border-paper/8">

        {/* Ambient pitch-green glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-0 right-0 h-80 opacity-60"
          style={{ background: "radial-gradient(ellipse 90% 60% at 50% 0%, oklch(0.55 0.14 158 / 0.18) 0%, transparent 70%)" }}
        />

        {/* Logo + back nav */}
        <div className="relative mb-8 sm:mb-12 flex items-center justify-between">
          <Link href="/" className="hover:opacity-75 transition-opacity">
            <Image src="/images/peerfit-logo.png" alt="PeerFit" width={180} height={120}
              className="h-10 sm:h-14 w-auto object-contain -my-2 [filter:brightness(0)_invert(1)]" />
          </Link>
          <Link href="/" className="t-eyebrow text-paper/30 hover:text-paper/60 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />BACK
          </Link>
        </div>

        {/* Hero headline */}
        <div className="relative mb-7 sm:mb-10">
          <h1 className="t-display-lg text-paper mb-3 sm:mb-4">
            The game<br />
            <span className="text-brand-pitch">starts here.</span>
          </h1>
          <p className="t-body text-paper/50 max-w-xs">
            Post a game. Find players. Show up. Free to join, free to post.
          </p>
        </div>

        {/* Auth form */}
        <div className="relative flex-1 flex flex-col min-h-0">

          {/* Tab switcher */}
          <div className="flex flex-wrap items-end border-b border-paper/10 mb-6 sm:mb-8">
            {(["signin", "signup"] as const).map((tab) => (
              <button key={tab}
                onClick={() => { setActive(tab); setSuError(""); setSiError("") }}
                className={`pb-3 mr-6 t-eyebrow border-b-2 -mb-px transition-all ${
                  active === tab
                    ? "text-paper border-brand-pitch"
                    : "text-paper/30 border-transparent hover:text-paper/55"
                }`}
              >
                {tab === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            ))}
            {/* Progress dots */}
            {active === "signup" && (
              <div className="ml-auto pb-3 flex items-center gap-1.5">
                {step !== "email" && !hideSignupBackButton && (
                  <button onClick={() => { setStep(PREV_STEP[step]); setSuError("") }}
                    className="flex items-center gap-0.5 t-eyebrow text-paper/35 hover:text-paper/65 transition-colors mr-2">
                    <ChevronLeft className="w-3.5 h-3.5" />BACK
                  </button>
                )}
                {SIGNUP_STEPS.map((s, i) => (
                  <div key={s} className={`h-1 transition-all duration-300 ${
                    s === step ? "w-5 bg-brand-pitch" : i < stepIdx ? "w-2 bg-brand-pitch/35" : "w-2 bg-paper/10"
                  }`} />
                ))}
              </div>
            )}
          </div>

          {/* ────────── SIGN IN ────────── */}
          {active === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4 min-h-[420px]">
              {/* Google */}
              <button type="button" onClick={handleGoogle}
                className="w-full h-11 flex items-center justify-center gap-3 bg-paper/5 hover:bg-paper/10 border border-paper/15 text-paper/85 t-body transition-all">
                <GoogleIcon />Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-paper/10" />
                <span className="t-eyebrow text-paper/25">OR</span>
                <div className="flex-1 h-px bg-paper/10" />
              </div>

              {/* Email */}
              <div>
                <label className="t-eyebrow text-paper/40 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/25" />
                  <input type="email" placeholder="your@email.com" value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    className={`${inputCls} pl-10`} required />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="t-eyebrow text-paper/40">Password</label>
                  <Link href="/forgot-password" className="t-eyebrow text-brand-pitch/80 hover:text-brand-pitch transition-colors">
                    FORGOT?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/25" />
                  <input type={showPw ? "text" : "password"} placeholder="Your password" value={siPw}
                    onChange={(e) => setSiPw(e.target.value)}
                    className={`${inputCls} pl-10 pr-10`} required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/25 hover:text-paper/55">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Checkbox id="rem" checked={rememberMe} onCheckedChange={(c) => setRememberMe(!!c)}
                  className="border-paper/20 data-[state=checked]:bg-brand-pitch data-[state=checked]:border-brand-pitch" />
                <Label htmlFor="rem" className="t-body text-paper/45 cursor-pointer">Remember me</Label>
              </div>

              {siError && (
                <div role="alert" className="bg-red-500/10 border border-red-500/20 px-3 py-2.5 t-body text-red-300">{siError}</div>
              )}

              <button type="submit" disabled={siLoading} className={primaryBtn}>
                {siLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SIGN IN <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* ────────── SIGN UP (stepped) ────────── */}
          {active === "signup" && (
            <div className="min-h-[420px] flex flex-col">

              {/* ── Step: email ── */}
              {step === "email" && (
                <div className="space-y-4 flex-1">
                  <button type="button" onClick={handleGoogle}
                    className="w-full h-11 flex items-center justify-center gap-3 bg-paper/5 hover:bg-paper/10 border border-paper/15 text-paper/85 t-body transition-all">
                    <GoogleIcon />Continue with Google
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-paper/10" />
                    <span className="t-eyebrow text-paper/25">OR CONTINUE WITH EMAIL</span>
                    <div className="flex-1 h-px bg-paper/10" />
                  </div>

                  <div>
                    <label className="t-eyebrow text-paper/40 mb-1.5 block">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/25" />
                      <input type="email" placeholder="your@email.com" value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                        className={`${inputCls} pl-10`} />
                    </div>
                  </div>

                  <div>
                    <label className="t-eyebrow text-paper/40 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/25" />
                      <input type={showSuPw ? "text" : "password"} placeholder="Min 8 chars, upper, lower & number"
                        value={suPw} onChange={(e) => setSuPw(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendEmailCode()}
                        className={`${inputCls} pl-10 pr-10`} />
                      <button type="button" onClick={() => setShowSuPw(!showSuPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/25 hover:text-paper/55">
                        {showSuPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    <div className="mt-2 h-5">
                      {suPw && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3].map((n) => (
                              <div key={n} className={`h-1 flex-1 transition-all duration-300 ${n <= suStrength.bars ? suStrength.color : "bg-paper/10"}`} />
                            ))}
                          </div>
                          <span className={`t-eyebrow ${suStrength.bars === 1 ? "text-red-400" : suStrength.bars === 2 ? "text-stone-400" : "text-brand-pitch"}`}>
                            {suStrength.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {suError && <div role="alert" className="bg-red-500/10 border border-red-500/20 px-3 py-2.5 t-body text-red-300">{suError}</div>}

                  <button onClick={sendEmailCode} disabled={suLoading} className={primaryBtn}>
                    {suLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>CONTINUE <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              )}

              {/* ── Step: verify-email ── */}
              {step === "verify-email" && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-brand-pitch/15 border border-brand-pitch/30 flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-brand-pitch" />
                    </div>
                    <p className="t-body text-paper/45">We sent a 6-digit code to</p>
                    <p className="t-mono text-paper mt-1">{suEmail}</p>
                  </div>

                  <OtpInput value={emailCode} onChange={setEmailCode} />

                  {suError && <div className="bg-red-500/10 border border-red-500/20 px-3 py-2.5 t-body text-red-300 text-center">{suError}</div>}

                  <button onClick={verifyEmail} disabled={suLoading || !otpReady(emailCode)} className={primaryBtn}>
                    {suLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>VERIFY EMAIL <CheckCircle2 className="w-4 h-4" /></>}
                  </button>

                  <p className="text-center t-body">
                    {countdown > 0
                      ? <span className="text-paper/25">Resend in {countdown}s</span>
                      : <button onClick={sendEmailCode} className="text-brand-pitch hover:text-brand-pitch/75 transition-colors">Resend code</button>}
                  </p>
                </div>
              )}

              {/* ── Step: terms ── */}
              {step === "terms" && (
                <div className="space-y-4">
                  <p className="t-body text-paper/45">Before you continue, review and agree to our terms.</p>
                  {requestedStep === "terms" && (
                    <div className="border border-brand-pitch/20 bg-brand-pitch/10 px-4 py-3 t-body text-paper/80">
                      Your Google account is connected. Finish these last details to complete your PeerFit profile.
                    </div>
                  )}

                  <div className="space-y-4 bg-paper/5 border border-paper/8 p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={ageTerms} onCheckedChange={(c) => setAgeTerms(!!c)}
                        className="mt-0.5 shrink-0 border-paper/20 data-[state=checked]:bg-brand-pitch data-[state=checked]:border-brand-pitch" />
                      <span className="t-body text-paper/65 leading-snug">
                        I agree to PeerFit&apos;s{" "}
                        <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-brand-pitch hover:underline">Terms &amp; Conditions</Link>
                        {" "}and{" "}
                        <Link href="/consumer-terms" target="_blank" rel="noopener noreferrer" className="text-brand-pitch hover:underline">Consumer Rights</Link>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={ageMkt} onCheckedChange={(c) => setAgeMkt(!!c)}
                        className="mt-0.5 shrink-0 border-paper/20 data-[state=checked]:bg-brand-pitch data-[state=checked]:border-brand-pitch" />
                      <span className="t-body text-paper/45 leading-snug">
                        Email me news, sport releases &amp; offers{" "}
                        <span className="text-paper/25 text-xs">(optional)</span>
                      </span>
                    </label>
                  </div>

                  {suError && <div role="alert" className="bg-red-500/10 border border-red-500/20 px-3 py-2.5 t-body text-red-300">{suError}</div>}

                  <button onClick={acceptTerms} disabled={!ageTerms} className={primaryBtn}>
                    CREATE ACCOUNT <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Step: dob ── */}
              {step === "dob" && (
                <div className="space-y-5">
                  <p className="t-body text-paper/45">What&apos;s your date of birth?</p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Day",   val: dobD, set: setDobD, ph: "DD",   maxLen: 2, nextId: "dob-month" },
                      { label: "Month", val: dobM, set: setDobM, ph: "MM",   maxLen: 2, nextId: "dob-year" },
                      { label: "Year",  val: dobY, set: setDobY, ph: "YYYY", maxLen: 4, nextId: null },
                    ].map(({ label, val, set, ph, maxLen, nextId }) => (
                      <div key={label}>
                        <label className="t-eyebrow text-paper/35 mb-1.5 block text-center">{label}</label>
                        <input
                          id={`dob-${label.toLowerCase()}`}
                          type="text" inputMode="numeric" placeholder={ph} value={val} maxLength={maxLen}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, maxLen)
                            set(v)
                            if (v.length === maxLen && nextId) document.getElementById(nextId)?.focus()
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && dobD && dobM && dobY && !suLoading) { e.preventDefault(); saveDob() }
                          }}
                          className="w-full h-12 text-center font-bold text-lg bg-paper/5 border border-paper/15 text-paper placeholder:text-paper/20 focus:outline-none focus:border-brand-pitch transition-all"
                          style={{ fontFamily: "var(--font-big-shoulders), system-ui, sans-serif" }}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="t-eyebrow text-paper/25 text-center">YOU MUST BE AT LEAST 13 YEARS OLD</p>

                  {suError && <div role="alert" className="bg-red-500/10 border border-red-500/20 px-3 py-2.5 t-body text-red-300">{suError}</div>}

                  <button onClick={saveDob} disabled={suLoading || !dobD || !dobM || !dobY} className={primaryBtn}>
                    {suLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>CONTINUE <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              )}

              {/* ── Step: phone ── */}
              {step === "phone" && (
                <div className="space-y-4">
                  <div>
                    <p className="t-body text-paper/45">Add a phone number — or skip for now.</p>
                    <p className="mt-1 t-eyebrow text-paper/25">No verification code required.</p>
                  </div>

                  <div>
                    <label className="t-eyebrow text-paper/40 mb-1.5 block">Phone number</label>
                    <div className="flex gap-2">
                      <select value={cc} onChange={(e) => setCc(e.target.value)}
                        className="h-11 px-2.5 t-body bg-paper/5 border border-paper/15 text-paper shrink-0 focus:outline-none focus:border-brand-pitch">
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.label} value={c.code} className="bg-stone-900 text-paper">{c.label}</option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/25" />
                        <input type="tel" placeholder="7911 123456" value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !suLoading) { e.preventDefault(); finishSignup() } }}
                          className={`${inputCls} pl-10`} />
                      </div>
                    </div>
                  </div>

                  {suError && <div role="alert" className="bg-red-500/10 border border-red-500/20 px-3 py-2.5 t-body text-red-300">{suError}</div>}

                  <button onClick={() => finishSignup()} disabled={suLoading} className={primaryBtn}>
                    {suLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>FINISH SIGN UP <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <button onClick={() => finishSignup(true)} disabled={suLoading}
                    className="w-full t-mono text-paper/40 hover:text-paper/65 transition-colors disabled:opacity-40">
                    Skip for now
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <p className="relative t-meta text-paper/25 mt-8 leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-paper/40 hover:text-paper/60 underline">Terms</Link>
          {" "}&amp;{" "}
          <Link href="/privacy" className="text-paper/40 hover:text-paper/60 underline">Privacy Policy</Link>
        </p>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — sport imagery + editorial features
      ══════════════════════════════════════ */}
      <div className="hidden md:flex flex-1 flex-col bg-ink relative overflow-hidden">

        {/* Sport image mosaic */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1.5 p-6 pb-0">
            {SPORT_TILES.map(({ img, label }) => (
              <div key={label} className="relative overflow-hidden group">
                <Image src={img} alt={label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <span className="absolute bottom-3 left-3.5 t-eyebrow text-paper/80">{label.toUpperCase()}</span>
              </div>
            ))}
          </div>
          {/* Fade to section below */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-ink to-transparent pointer-events-none" />
        </div>

        {/* Features + testimonial */}
        <div className="px-10 pb-10 pt-2 flex-shrink-0 border-t border-paper/8">

          <div className="space-y-5 mb-8 mt-6">
            {[
              { n: "01", icon: <MapPin className="w-4 h-4" />, title: "Local pickup games", desc: "Browse activities near you and join with a single tap." },
              { n: "02", icon: <Users className="w-4 h-4" />, title: "Connect with players", desc: "Meet people at your level, for your sport, right in your area." },
              { n: "03", icon: <Zap className="w-4 h-4" />, title: "Build the habit", desc: "Stay consistent with a community that keeps you accountable." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-4">
                <span className="t-mono text-brand-pitch pt-0.5 shrink-0">{n}</span>
                <div>
                  <p className="t-display-sm text-paper">{title}</p>
                  <p className="t-body text-paper/50 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <blockquote className="border-l-2 border-brand-pitch pl-4">
            <p className="t-sub text-paper/70 leading-snug">
              &ldquo;Found a 5-a-side team in my area within a week. Now we play every Thursday without fail.&rdquo;
            </p>
            <span className="t-mono text-paper/40 mt-3 block">— JAMES K. · LONDON · FOOTBALL</span>
          </blockquote>
        </div>
      </div>

    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  )
}
