"use client"

import AppNav from "@/components/app-nav"
import { createClient } from "@/lib/supabase/client"
import { Bell, Eye, EyeOff, Loader2, Lock, LogOut, Save, Shield, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const inputCls = "w-full bg-paper/8 border border-paper/15 text-paper placeholder:text-paper/30 focus:outline-none focus:border-brand-pitch px-3 py-2.5 text-sm transition-colors"
const labelCls = "t-eyebrow text-paper/40 text-[10px] block mb-1.5"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  const [accountForm, setAccountForm] = useState({
    full_name: "",
    email: "",
    location: "",
  })

  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" })
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, location")
        .eq("id", user.id)
        .single()

      setAccountForm({
        full_name: profile?.full_name ?? "",
        email: user.email ?? "",
        location: profile?.location ?? "",
      })
    }
    loadProfile()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleSave = async () => {
    if (!userId) return
    setPasswordError("")
    setSaveError("")

    const hasPassword = passwordForm.password.length > 0

    if (hasPassword) {
      if (passwordForm.password.length < 8) {
        setPasswordError("Password must be at least 8 characters.")
        return
      }
      if (passwordForm.password !== passwordForm.confirmPassword) {
        setPasswordError("Passwords do not match.")
        return
      }
    }

    setSaving(true)

    const profileUpdate = supabase
      .from("profiles")
      .update({ full_name: accountForm.full_name || null, location: accountForm.location || null })
      .eq("id", userId)

    const passwordUpdate = hasPassword
      ? supabase.auth.updateUser({ password: passwordForm.password })
      : Promise.resolve({ error: null })

    const [{ error: profileError }, { error: pwError }] = await Promise.all([profileUpdate, passwordUpdate])

    setSaving(false)

    if (profileError) { setSaveError("Failed to save profile. Please try again."); return }
    if (pwError) { setPasswordError(pwError.message); return }

    if (hasPassword) setPasswordForm({ password: "", confirmPassword: "" })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-ink text-paper pb-20 md:pb-0">
      <AppNav />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        <div className="mb-8">
          <p className="t-eyebrow text-paper/40 mb-1">ACCOUNT</p>
          <h1 className="t-display-md text-paper" style={{ fontSize: "32px" }}>Settings</h1>
        </div>

        <div className="space-y-px">
          {/* Account Details */}
          <section className="bg-paper/5 border border-paper/10 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-3.5 h-3.5 text-brand-pitch" />
              <p className="t-eyebrow text-paper/60 text-xs">ACCOUNT DETAILS</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>FULL NAME</label>
                <input
                  type="text"
                  value={accountForm.full_name}
                  onChange={(e) => setAccountForm((f) => ({ ...f, full_name: e.target.value }))}
                  className={inputCls}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className={labelCls}>EMAIL</label>
                <input
                  type="email"
                  value={accountForm.email}
                  disabled
                  className={`${inputCls} opacity-40 cursor-not-allowed`}
                />
                <p className="t-mono text-paper/30 text-[10px] mt-1">Cannot be changed here</p>
              </div>
              <div>
                <label className={labelCls}>LOCATION</label>
                <input
                  type="text"
                  value={accountForm.location}
                  onChange={(e) => setAccountForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="City, Country"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-paper/5 border border-paper/10 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-3.5 h-3.5 text-brand-pitch" />
              <p className="t-eyebrow text-paper/60 text-xs">NOTIFICATIONS</p>
            </div>
            <p className="t-body text-paper/40 text-sm">
              Email notification preferences are coming soon. You&apos;ll be able to control activity reminders, friend requests, and more from here.
            </p>
          </section>

          {/* Privacy */}
          <section className="bg-paper/5 border border-paper/10 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-brand-pitch" />
              <p className="t-eyebrow text-paper/60 text-xs">PRIVACY</p>
            </div>
            <p className="t-body text-paper/40 text-sm">
              Privacy controls are coming soon. You&apos;ll be able to manage profile visibility, activity history, and data preferences here.
            </p>
          </section>

          {/* Change Password */}
          <section className="bg-paper/5 border border-paper/10 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-brand-pitch" />
              <p className="t-eyebrow text-paper/60 text-xs">CHANGE PASSWORD</p>
            </div>
            <p className="t-mono text-paper/30 text-[10px] mb-4">Leave blank to keep your current password.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>NEW PASSWORD</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="At least 8 characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/30 hover:text-paper transition-colors"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>CONFIRM PASSWORD</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/30 hover:text-paper transition-colors"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            {passwordForm.password && (
              <p className={`t-mono text-[10px] mt-2 ${passwordForm.password === passwordForm.confirmPassword && passwordForm.confirmPassword ? "text-brand-pitch" : "text-paper/40"}`}>
                {passwordForm.password === passwordForm.confirmPassword && passwordForm.confirmPassword
                  ? "PASSWORDS MATCH"
                  : passwordForm.confirmPassword ? "PASSWORDS DO NOT MATCH" : ""}
              </p>
            )}
            {passwordError && (
              <div role="alert" className="mt-3 border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400 text-sm">
                {passwordError}
              </div>
            )}
          </section>

          {/* Sign out */}
          <section className="bg-paper/5 border border-paper/10 border-red-500/10 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <LogOut className="w-3.5 h-3.5 text-red-400/70" />
              <p className="t-eyebrow text-paper/60 text-xs">SIGN OUT</p>
            </div>
            <p className="t-body text-paper/40 text-sm mb-4">Sign out of your account on this device.</p>
            <button
              onClick={handleSignOut}
              className="t-eyebrow text-xs border border-red-500/25 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 px-4 py-2.5 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />SIGN OUT
            </button>
          </section>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
          {saveError && (
            <p role="alert" className="text-red-400 text-sm w-full sm:w-auto text-right">{saveError}</p>
          )}
          {saved && (
            <p role="status" aria-live="polite" className="t-eyebrow text-brand-pitch text-xs w-full sm:w-auto text-right">
              SAVED
            </p>
          )}
          <button
            onClick={() => router.back()}
            className="t-eyebrow text-xs text-paper/50 hover:text-paper border border-paper/15 hover:border-paper/30 px-4 py-2.5 transition-colors flex-1 sm:flex-none"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="t-eyebrow text-xs bg-brand-pitch text-ink hover:opacity-90 disabled:opacity-50 px-4 py-2.5 flex items-center gap-2 transition-opacity flex-1 sm:flex-none justify-center"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </div>
    </div>
  )
}
