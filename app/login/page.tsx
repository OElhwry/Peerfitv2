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
    { code: "+1", label: "🇺🇸 US  +1" },
    { code: "+1", label: "🇨🇦 CA  +1" },
    { code: "+44", label: "🇬🇧 UK  +44" },
    { code: "+61", label: "🇦🇺 AU  +61" },
    { code: "+91", label: "🇮🇳 IN  +91" },
    { code: "+49", label: "🇩🇪 DE  +49" },
    { code: "+33", label: "🇫🇷 FR  +33" },
    { code: "+34", label: "🇪🇸 ES  +34" },
    { code: "+39", label: "🇮🇹 IT  +39" },
    { code: "+81", label: "🇯🇵 JP  +81" },
    { code: "+55", label: "🇧🇷 BR  +55" },
    { code: "+52", label: "🇲🇽 MX  +52" },
    { code: "+971", label: "🇦🇪 AE  +971" },
    { code: "+234", label: "🇳🇬 NG  +234" },
    { code: "+27", label: "🇿🇦 ZA  +27" },
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
    const knownCodes = [...new Set(COUNTRY_CODES.map((country) => country.code))].sort((a, b) => b.length - a.length)
    const matchedCode = knownCodes.find((code) => fullPhone.startsWith(code))

    if (!matchedCode) {
      return { code: "+44", local: fullPhone.replace(/^\+/, "") }
    }

    return { code: matchedCode, local: fullPhone.slice(matchedCode.length) }
  }

  function readEmailOtpCooldowns(): Record<string, number> {
    if (typeof window === "undefined") return {}

    try {
      const stored = window.localStorage.getItem(EMAIL_OTP_COOLDOWN_KEY)
      if (!stored) return {}

      const parsed = JSON.parse(stored)
      return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {}
    } catch {
      return {}
    }
  }

  function getEmailOtpSecondsRemaining(email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return 0

    const sentAt = readEmailOtpCooldowns()[normalizedEmail]
    if (!sentAt || Number.isNaN(sentAt)) return 0

    const elapsedSeconds = Math.floor((Date.now() - sentAt) / 1000)
    return Math.max(0, EMAIL_OTP_COOLDOWN_SECONDS - elapsedSeconds)
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
    { img: "/images/sports/football.jpg", label: "Football" },
    { img: "/images/sports/basketball.jpg", label: "Basketball" },
    { img: "/images/sports/tennis.jpg", label: "Tennis" },
    { img: "/images/sports/boxing.jpg", label: "Boxing" },
    { img: "/images/sports/running.jpg", label: "Running" },
    { img: "/images/sports/swimming.jpg", label: "Swimming" },
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
        { [0, 1, 2, 3, 4, 5].map((i) => (
          <input key={ i } ref={ refs[i] } type="text" inputMode="numeric" maxLength={ 1 }
            value={ value[i]?.trim() ?? "" }
            onChange={ (e) => handle(i, e.target.value) }
            onKeyDown={ (e) => onKey(i, e) }
            className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors bg-white text-slate-800 shadow-sm"
          />
        )) }
      </div>
    )
  }

  function pwStrength(pw: string): { bars: number; label: string; color: string } {
    if (!pw) return { bars: 0, label: "", color: "" }
    if (pw.length < 8) return { bars: 1, label: "Too short", color: "bg-red-500" }
    const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(pw)).length
    if (variety <= 2) return { bars: 2, label: "Fair", color: "bg-amber-400" }
    return { bars: 3, label: "Strong", color: "bg-emerald-400" }
  }

  function AuthPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const stepParam = searchParams.get("step")
    const requestedMode = searchParams.get("mode")
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
        setStep(requestedStep)
        setSuError("")
        setSiError("")
      }
    }, [requestedMode, requestedStep])

    useEffect(() => {
      if (requestedMode !== "signup" || !requestedStep || requestedStep === "email" || requestedStep === "verify-email") {
        return
      }

      let cancelled = false

      const loadUser = async () => {
        const { data: { user } } = await createClient().auth.getUser()
        if (cancelled || !user) return

        if (user.email) setSuEmail(user.email.toLowerCase())
        if (user.phone) {
          const { code, local } = splitPhoneNumber(user.phone)
          setCc(code)
          setPhone(local)
        }

      }

      loadUser()

      return () => {
        cancelled = true
      }
    }, [requestedMode, requestedStep])

    useEffect(() => {
      if (countdown <= 0) return
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }, [countdown])

    useEffect(() => {
      if (step === "verify-email") {
        setCountdown(getEmailOtpSecondsRemaining(suEmail))
        return
      }

      setCountdown(0)
    }, [step, suEmail])

    useEffect(() => {
      if (requestedStep !== "terms" || step !== "terms") return

      const currentUrl = `${window.location.pathname}${window.location.search}`
      window.history.pushState(null, "", currentUrl)

      const handlePopState = () => {
        window.history.pushState(null, "", currentUrl)
      }

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
        router.push("/feed")
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
        setCountdown(remaining)
        setStep("verify-email")
        setSuError(`A code was already sent recently. Please wait ${remaining}s before requesting another one.`)
        return
      }
      setSuLoading(true)
      const { error } = await createClient().auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
      if (error) {
        if (/rate limit/i.test(error.message)) {
          const fallbackSeconds = EMAIL_OTP_COOLDOWN_SECONDS
          markEmailOtpSent(email)
          setCountdown(fallbackSeconds)
          setStep("verify-email")
          setSuError(`A code was already sent recently. Please wait ${fallbackSeconds}s before requesting another one.`)
        } else {
          setSuError(error.message)
        }
        setSuLoading(false)
        return
      }
      markEmailOtpSent(email)
      setStep("verify-email"); setCountdown(EMAIL_OTP_COOLDOWN_SECONDS); setSuLoading(false)
    }

    const verifyEmail = async () => {
      setSuError("")
      const code = emailCode.replace(/\s/g, "")
      if (code.length !== 6) { setSuError("Please enter the 6-digit code."); return }
      setSuLoading(true)
      const { error } = await createClient().auth.verifyOtp({ email: suEmail.trim().toLowerCase(), token: code, type: "email" })
      if (error) { setSuError("Invalid code. Try again."); setSuLoading(false); return }
      // Set the password on the now-verified account
      await createClient().auth.updateUser({ password: suPw })
      setStep("terms"); setSuLoading(false)
    }

    const acceptTerms = async () => {
      if (!ageTerms) { setSuError("You must agree to the Terms and Consumer Terms to continue."); return }
      setSuError("")
      setSuLoading(true)

      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      const metadata =
        user?.user_metadata && typeof user.user_metadata === "object"
          ? (user.user_metadata as Record<string, unknown>)
          : {}

      const { error } = await sb.auth.updateUser({
        data: {
          ...metadata,
          accepted_terms_at: new Date().toISOString(),
          accepted_consumer_terms_at: new Date().toISOString(),
          marketing_opt_in: ageMkt,
        },
      })

      if (error) {
        setSuError(error.message)
        setSuLoading(false)
        return
      }

      setSuLoading(false)
      setStep("dob")
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
      setSuLoading(false)
      setStep("phone")
    }

    const finishSignup = async (skipPhone = false) => {
      setSuError("")

      const digits = phone.replace(/\D/g, "")
      if (!skipPhone && phone.trim() && digits.length < 7) {
        setSuError("Please enter a valid phone number or skip for now.")
        return
      }

      setSuLoading(true)
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()

      if (user) {
        const profileUpdate: { onboarding_complete: boolean; phone?: string | null } = {
          onboarding_complete: true,
        }

        if (skipPhone || !phone.trim()) {
          profileUpdate.phone = null
        } else {
          profileUpdate.phone = `${cc}${digits}`
        }

        await sb.from("profiles").update(profileUpdate).eq("id", user.id)
      }

      setSuLoading(false)
      router.push("/feed")
    }

    const handleGoogle = async () => {
      await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/login?mode=signup&step=terms")}`,
        },
      })
    }

    const otpReady = (v: string) => v.replace(/\s/g, "").length === 6
    const stepIdx = SIGNUP_STEPS.indexOf(step)
    const suStrength = pwStrength(suPw)
    const hideSignupBackButton = step === "terms" && requestedStep === "terms"

    /* shared input class for dark panel */
    const darkInput = "w-full h-11 bg-white/8 border border-white/12 rounded-xl text-white placeholder:text-white/25 text-sm px-4 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
    const greenBtn = "w-full h-11 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 disabled:cursor-not-allowed"

    return (
      <div className="min-h-screen flex">

        {/* ══════════════════════════════════════
          LEFT — dark panel with full auth UI
      ══════════════════════════════════════ */}
        <div className="w-full md:w-[460px] lg:w-[500px] flex-shrink-0 flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 px-8 py-10 relative overflow-hidden">

          {/* background glows */ }
          <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 w-56 h-56 rounded-full bg-teal-500/8 blur-3xl" />

          {/* Logo + back nav */ }
          <div className="relative mb-12 flex items-center justify-between">
            <Link href="/" className="flex items-center group hover:opacity-80 transition-opacity">
              <Image src="/images/peerfit-logo.png" alt="PeerFit" width={ 180 } height={ 120 } className="h-16 w-auto object-contain -my-3 [filter:brightness(0)_invert(1)]" />
            </Link>
            <Link href="/" className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />Back to home
            </Link>
          </div>

          {/* Hero headline */ }
          <div className="relative mb-10">
            <h1 className="text-[2.6rem] lg:text-5xl font-black leading-[1.08] tracking-tight text-white mb-4"
              style={ { fontFamily: "var(--font-space-grotesk)" } }>
              Train smarter.<br />
              <span className="text-emerald-400">Stay consistent.</span>
            </h1>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-xs">
              Find local games, connect with nearby players, and build the habits that actually stick.
            </p>
          </div>

          {/* ── Auth form ── */ }
          <div className="relative flex-1 flex flex-col min-h-0">

            {/* Tab switcher */ }
            <div className="flex items-end border-b border-white/10 mb-7">
              { (["signin", "signup"] as const).map((tab) => (
                <button key={ tab }
                  onClick={ () => { setActive(tab); setSuError(""); setSiError("") } }
                  className={ `pb-3 mr-7 text-sm font-semibold border-b-2 -mb-px transition-all ${active === tab
                      ? "text-white border-emerald-400"
                      : "text-white/30 border-transparent hover:text-white/55"
                    }` }
                >
                  { tab === "signin" ? "Sign in" : "Create account" }
                </button>
              )) }
              {/* Progress dots — only visible on signup, sits inline with tabs */ }
              { active === "signup" && (
                <div className="ml-auto pb-3 flex items-center gap-1.5">
                  { step !== "email" && !hideSignupBackButton && (
                    <button onClick={ () => { setStep(PREV_STEP[step]); setSuError("") } }
                      className="flex items-center gap-0.5 text-white/35 hover:text-white/65 text-xs transition-colors mr-2">
                      <ChevronLeft className="w-3.5 h-3.5" />Back
                    </button>
                  ) }
                  { SIGNUP_STEPS.map((s, i) => (
                    <div key={ s } className={ `h-1 rounded-full transition-all duration-300 ${s === step ? "w-5 bg-emerald-400" : i < stepIdx ? "w-2 bg-emerald-700" : "w-2 bg-white/10"
                      }` } />
                  )) }
                </div>
              ) }
            </div>

            {/* ────────── SIGN IN ────────── */ }
            { active === "signin" && (
              <form onSubmit={ handleSignIn } className="space-y-4 min-h-[420px]">
                {/* Google */ }
                <button type="button" onClick={ handleGoogle }
                  className="w-full h-11 flex items-center justify-center gap-3 bg-white/8 hover:bg-white/13 border border-white/12 rounded-xl text-white/85 text-sm font-medium transition-all">
                  <GoogleIcon />Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/25 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Email */ }
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input type="email" placeholder="your@email.com" value={ siEmail }
                      onChange={ (e) => setSiEmail(e.target.value) }
                      className={ `${darkInput} pl-10` } required />
                  </div>
                </div>

                {/* Password */ }
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Password</label>
                    <Link href="/forgot-password" className="text-xs text-emerald-400/80 hover:text-emerald-400 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input type={ showPw ? "text" : "password" } placeholder="Your password" value={ siPw }
                      onChange={ (e) => setSiPw(e.target.value) }
                      className={ `${darkInput} pl-10 pr-10` } required />
                    <button type="button" onClick={ () => setShowPw(!showPw) }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55">
                      { showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" /> }
                    </button>
                  </div>
                </div>

                {/* Remember me */ }
                <div className="flex items-center gap-2">
                  <Checkbox id="rem" checked={ rememberMe } onCheckedChange={ (c) => setRememberMe(!!c) }
                    className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                  <Label htmlFor="rem" className="text-sm text-white/45 cursor-pointer">Remember me</Label>
                </div>

                { siError && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-300">{ siError }</div>
                ) }

                <button type="submit" disabled={ siLoading } className={ greenBtn }>
                  { siLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></> }
                </button>
              </form>
            ) }

            {/* ────────── SIGN UP (stepped) ────────── */ }
            { active === "signup" && (
              <div className="min-h-[420px] flex flex-col">

                {/* ── Step: email ── */ }
                { step === "email" && (
                  <div className="space-y-4 flex-1">
                    <button type="button" onClick={ handleGoogle }
                      className="w-full h-11 flex items-center justify-center gap-3 bg-white/8 hover:bg-white/13 border border-white/12 rounded-xl text-white/85 text-sm font-medium transition-all">
                      <GoogleIcon />Continue with Google
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-white/25 text-xs">or continue with email</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input type="email" placeholder="your@email.com" value={ suEmail }
                          onChange={ (e) => setSuEmail(e.target.value) }
                          className={ `${darkInput} pl-10` } />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input type={ showSuPw ? "text" : "password" } placeholder="Min 8 chars, upper, lower & number"
                          value={ suPw } onChange={ (e) => setSuPw(e.target.value) }
                          onKeyDown={ (e) => e.key === "Enter" && sendEmailCode() }
                          className={ `${darkInput} pl-10 pr-10` } />
                        <button type="button" onClick={ () => setShowSuPw(!showSuPw) }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55">
                          { showSuPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" /> }
                        </button>
                      </div>
                      {/* Strength bar — fixed height so it never shifts layout */ }
                      <div className="mt-2 h-5">
                        { suPw && (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1 flex-1">
                              { [1, 2, 3].map((n) => (
                                <div key={ n } className={ `h-1 flex-1 rounded-full transition-all duration-300 ${n <= suStrength.bars ? suStrength.color : "bg-white/10"
                                  }` } />
                              )) }
                            </div>
                            <span className={ `text-[10px] font-semibold ${suStrength.bars === 1 ? "text-red-400" : suStrength.bars === 2 ? "text-amber-400" : "text-emerald-400"
                              }` }>{ suStrength.label }</span>
                          </div>
                        ) }
                      </div>
                    </div>

                    { suError && <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-300">{ suError }</div> }

                    <button onClick={ sendEmailCode } disabled={ suLoading } className={ greenBtn }>
                      { suLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></> }
                    </button>
                  </div>
                ) }

                {/* ── Step: verify-email ── */ }
                { step === "verify-email" && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-emerald-500/12 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-white/45 text-sm">We sent a 6-digit code to</p>
                      <p className="text-white font-semibold mt-0.5">{ suEmail }</p>
                    </div>

                    <OtpInput value={ emailCode } onChange={ setEmailCode } />

                    { suError && <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-300 text-center">{ suError }</div> }

                    <button onClick={ verifyEmail } disabled={ suLoading || !otpReady(emailCode) } className={ greenBtn }>
                      { suLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify Email <CheckCircle2 className="w-4 h-4" /></> }
                    </button>

                    <p className="text-center text-sm">
                      { countdown > 0
                        ? <span className="text-white/25">Resend in { countdown }s</span>
                        : <button onClick={ sendEmailCode } className="text-emerald-400 hover:text-emerald-300 font-medium">Resend code</button> }
                    </p>
                  </div>
                ) }

                {/* ── Step: terms ── */ }
                { step === "terms" && (
                  <div className="space-y-4">
                    <p className="text-white/45 text-sm">Before you continue, review and agree to our terms.</p>
                    { requestedStep === "terms" && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        Your Google account is connected. Finish these last details to complete your PeerFit profile.
                      </div>
                    ) }

                    <div className="space-y-4 bg-white/5 border border-white/8 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox checked={ ageTerms } onCheckedChange={ (c) => setAgeTerms(!!c) }
                          className="mt-0.5 shrink-0 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                        <span className="text-sm text-white/65 leading-snug">
                          I agree to PeerFit's{ " " }
                          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-medium">Terms &amp; Conditions</Link>
                          { " " }and{ " " }
                          <Link href="/consumer-terms" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-medium">Consumer Rights</Link>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox checked={ ageMkt } onCheckedChange={ (c) => setAgeMkt(!!c) }
                          className="mt-0.5 shrink-0 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                        <span className="text-sm text-white/45 leading-snug">
                          Email me news, sport releases &amp; offers{ " " }
                          <span className="text-white/25 text-xs">(optional — opt out anytime)</span>
                        </span>
                      </label>
                    </div>

                    { suError && <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-300">{ suError }</div> }

                    <button onClick={ acceptTerms } disabled={ !ageTerms } className={ greenBtn }>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) }

                {/* ── Step: dob ── */ }
                { step === "dob" && (
                  <div className="space-y-5">
                    <p className="text-white/45 text-sm">What's your date of birth?</p>

                    <div className="grid grid-cols-3 gap-3">
                      { [
                        { label: "Day", val: dobD, set: setDobD, ph: "DD", min: 1, max: 31 },
                        { label: "Month", val: dobM, set: setDobM, ph: "MM", min: 1, max: 12 },
                        { label: "Year", val: dobY, set: setDobY, ph: "YYYY", min: 1900, max: new Date().getFullYear() },
                      ].map(({ label, val, set, ph }) => (
                        <div key={ label }>
                          <label className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1.5 block text-center">{ label }</label>
                          <input type="number" placeholder={ ph } value={ val }
                            onChange={ (e) => set(e.target.value) }
                            onKeyDown={ (e) => {
                              if (e.key === "Enter" && dobD && dobM && dobY && !suLoading) {
                                e.preventDefault()
                                saveDob()
                              }
                            } }
                            className="w-full h-12 text-center text-lg font-bold bg-white/8 border border-white/12 rounded-xl text-white placeholder:text-white/18 focus:outline-none focus:border-emerald-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      )) }
                    </div>

                    <p className="text-xs text-white/25 text-center">You must be at least 13 years old.</p>

                    { suError && <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-300">{ suError }</div> }

                    <button onClick={ saveDob } disabled={ suLoading || !dobD || !dobM || !dobY } className={ greenBtn }>
                      { suLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></> }
                    </button>
                  </div>
                ) }

                { step === "phone" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/45 text-sm">Add a phone number if you want. You can skip this for now.</p>
                      <p className="mt-1 text-xs text-white/25">We will only save it in the correct format. No verification code required.</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Phone number</label>
                      <div className="flex gap-2">
                        <select
                          value={ cc }
                          onChange={ (e) => setCc(e.target.value) }
                          className="h-11 px-2.5 text-sm bg-white/8 border border-white/12 rounded-xl text-white shrink-0 focus:outline-none focus:border-emerald-500/50"
                        >
                          { COUNTRY_CODES.map((c) => (
                            <option key={ c.label } value={ c.code } className="bg-slate-800 text-white">{ c.label }</option>
                          )) }
                        </select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                          <input
                            type="tel"
                            placeholder="7911 123456"
                            value={ phone }
                            onChange={ (e) => setPhone(e.target.value) }
                            onKeyDown={ (e) => {
                              if (e.key === "Enter" && !suLoading) {
                                e.preventDefault()
                                finishSignup()
                              }
                            } }
                            className={ `${darkInput} pl-10` }
                          />
                        </div>
                      </div>
                    </div>

                    { suError && <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-300">{ suError }</div> }

                    <button onClick={ () => finishSignup() } disabled={ suLoading } className={ greenBtn }>
                      { suLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finish Sign Up <ArrowRight className="w-4 h-4" /></> }
                    </button>

                    <button
                      onClick={ () => finishSignup(true) }
                      disabled={ suLoading }
                      className="w-full text-sm font-medium text-white/45 transition-colors hover:text-white/70 disabled:opacity-40"
                    >
                      Skip for now
                    </button>
                  </div>
                ) }

              </div>
            ) }
          </div>

          {/* Footer */ }
          <p className="relative text-[11px] text-white/18 mt-8 leading-relaxed">
            By continuing you agree to our{ " " }
            <Link href="/terms" className="text-white/35 hover:text-white/55 underline">Terms</Link>
            { " " }&amp;{ " " }
            <Link href="/privacy" className="text-white/35 hover:text-white/55 underline">Privacy Policy</Link>
          </p>
        </div>

        {/* ══════════════════════════════════════
          RIGHT — sport imagery + features
      ══════════════════════════════════════ */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-50 relative overflow-hidden">

          {/* Sport image mosaic */ }
          <div className="flex-1 relative min-h-0">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-2 p-6 pb-0">
              { SPORT_TILES.map(({ img, label }) => (
                <div key={ label } className="relative rounded-2xl overflow-hidden group">
                  <Image src={ img } alt={ label } fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <span className="absolute bottom-3 left-3.5 text-white text-[10px] font-black tracking-widest uppercase opacity-90">
                    { label }
                  </span>
                </div>
              )) }
            </div>
            {/* fade to section below */ }
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
          </div>

          {/* Features + testimonial */ }
          <div className="px-10 pb-10 pt-4 flex-shrink-0">

            <div className="space-y-4 mb-7">
              { [
                { icon: <MapPin className="w-4 h-4" />, title: "Find local games", desc: "Browse activities near you and join with a single tap." },
                { icon: <Users className="w-4 h-4" />, title: "Connect with players", desc: "Meet people at your level, for your sport, right in your area." },
                { icon: <Zap className="w-4 h-4" />, title: "Build lasting habits", desc: "Stay consistent with a community that keeps you accountable." },
              ].map(({ icon, title, desc }) => (
                <div key={ title } className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    { icon }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{ title }</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{ desc }</p>
                  </div>
                </div>
              )) }
            </div>

            {/* Testimonial card */ }
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "Found a 5-a-side team in my area within a week. Now we play every Thursday without fail."
              </p>
              <div className="flex items-center gap-2.5 mt-3.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black">
                  J
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">James K.</p>
                  <p className="text-xs text-slate-400">London · Football</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  { [...Array(5)].map((_, i) => (
                    <svg key={ i } className="w-3.5 h-3.5 text-emerald-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )) }
                </div>
              </div>
            </div>
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
