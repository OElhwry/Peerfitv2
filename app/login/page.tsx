"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"

const REMEMBER_KEY = "peerfit_remember_email"

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [active, setActive] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  )

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showSignInPw, setShowSignInPw] = useState(false)
  const [signInLoading, setSignInLoading] = useState(false)
  const [signInError, setSignInError] = useState("")

  // Sign Up state
  const [signUpName, setSignUpName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [showSignUpPw, setShowSignUpPw] = useState(false)
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signUpError, setSignUpError] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      setSignInEmail(saved)
      setRememberMe(true)
    }
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInLoading(true)
    setSignInError("")
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInEmail.trim().toLowerCase(),
      password: signInPassword,
    })

    if (error) {
      setSignInError(
        error.message.includes("Invalid login credentials")
          ? "Incorrect email or password."
          : error.message
      )
      setSignInLoading(false)
      return
    }

    if (data.session) {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, signInEmail.trim().toLowerCase())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      router.push("/feed")
    }
    setSignInLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpLoading(true)
    setSignUpError("")

    if (signUpPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signUpPassword)) {
      setSignUpError("Password needs 8+ chars with uppercase, lowercase & a number.")
      setSignUpLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: signUpEmail.trim().toLowerCase(),
      password: signUpPassword,
      options: { data: { full_name: signUpName.trim() } },
    })

    if (error) {
      setSignUpError(
        error.message.includes("already registered")
          ? "An account with this email already exists."
          : error.message
      )
      setSignUpLoading(false)
      return
    }

    if (data.user) {
      await supabase.from("profiles").update({
        full_name: signUpName.trim() || null,
        onboarding_complete: true,
      }).eq("id", data.user.id)
      router.push("/feed")
    }
    setSignUpLoading(false)
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/peerfit-logo.png" alt="PeerFit" width={36} height={36} className="object-contain" />
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-space-grotesk)" }}>
            PeerFit
          </span>
        </Link>
        <p className="text-sm text-slate-500 hidden sm:block">Find People. Play Sports. Stay Active.</p>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {active === "signin" ? "Welcome back!" : "Join PeerFit"}
            </h1>
            <p className="text-slate-500">
              {active === "signin" ? "Sign in to continue your sports journey" : "Create your account and start playing"}
            </p>
          </div>

          {/* Dual panel */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* ── SIGN IN PANEL ── */}
            <div
              className={`flex-1 rounded-2xl border bg-white shadow-lg transition-all duration-300 overflow-hidden ${
                active === "signin"
                  ? "opacity-100 shadow-xl ring-2 ring-emerald-200"
                  : "opacity-40 cursor-pointer hover:opacity-60"
              }`}
              onClick={() => active !== "signin" && setActive("signin")}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Sign In</h2>
                  {active !== "signin" && (
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
                      Click to switch
                    </span>
                  )}
                </div>

                <form
                  onSubmit={handleSignIn}
                  className="space-y-4"
                  onClick={(e) => active !== "signin" && e.preventDefault()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={active === "signin" ? handleGoogle : undefined}
                    disabled={active !== "signin"}
                    className="w-full h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 gap-3 bg-transparent"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-400">or email</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        disabled={active !== "signin"}
                        className="pl-10 h-11 border-slate-200 focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline font-medium" tabIndex={active !== "signin" ? -1 : 0}>
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type={showSignInPw ? "text" : "password"}
                        placeholder="Your password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        disabled={active !== "signin"}
                        className="pl-10 pr-10 h-11 border-slate-200 focus:border-emerald-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPw(!showSignInPw)}
                        disabled={active !== "signin"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSignInPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(c) => setRememberMe(!!c)}
                      disabled={active !== "signin"}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">Remember me</Label>
                  </div>

                  {signInError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                      {signInError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={signInLoading || active !== "signin"}
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    {signInLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Divider — desktop only */}
            <div className="hidden md:flex flex-col items-center justify-center gap-3 px-2">
              <div className="w-px h-24 bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium bg-white border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center">or</span>
              <div className="w-px h-24 bg-slate-200" />
            </div>

            {/* ── SIGN UP PANEL ── */}
            <div
              className={`flex-1 rounded-2xl border bg-white shadow-lg transition-all duration-300 overflow-hidden ${
                active === "signup"
                  ? "opacity-100 shadow-xl ring-2 ring-emerald-200"
                  : "opacity-40 cursor-pointer hover:opacity-60"
              }`}
              onClick={() => active !== "signup" && setActive("signup")}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
                  {active !== "signup" && (
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
                      Click to switch
                    </span>
                  )}
                </div>

                <form
                  onSubmit={handleSignUp}
                  className="space-y-4"
                  onClick={(e) => active !== "signup" && e.preventDefault()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={active === "signup" ? handleGoogle : undefined}
                    disabled={active !== "signup"}
                    className="w-full h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 gap-3 bg-transparent"
                  >
                    <GoogleIcon />
                    Sign up with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-400">or email</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Your name"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        disabled={active !== "signup"}
                        className="pl-10 h-11 border-slate-200 focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        disabled={active !== "signup"}
                        className="pl-10 h-11 border-slate-200 focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type={showSignUpPw ? "text" : "password"}
                        placeholder="Min 8 chars, upper, lower & number"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        disabled={active !== "signup"}
                        className="pl-10 pr-10 h-11 border-slate-200 focus:border-emerald-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPw(!showSignUpPw)}
                        disabled={active !== "signup"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSignUpPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signUpPassword && (
                      <p className={`text-xs mt-1 font-medium ${
                        signUpPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signUpPassword)
                          ? "text-emerald-600"
                          : "text-amber-500"
                      }`}>
                        {signUpPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signUpPassword)
                          ? "✓ Strong password"
                          : "Needs uppercase, lowercase & number"}
                      </p>
                    )}
                  </div>

                  {signUpError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                      {signUpError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={signUpLoading || active !== "signup"}
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    {signUpLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </Button>

                  <p className="text-center text-xs text-slate-400">
                    Want full onboarding?{" "}
                    <Link href="/signup" className="text-emerald-600 hover:underline font-medium" tabIndex={active !== "signup" ? -1 : 0}>
                      Complete profile setup →
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-emerald-600 hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
