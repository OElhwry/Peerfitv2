"use client"

import AppNav from "@/components/app-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Bell, Eye, EyeOff, Loader2, Lock, Moon, Save, Shield, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

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
      .update({
        full_name: accountForm.full_name || null,
        location: accountForm.location || null,
      })
      .eq("id", userId)

    const passwordUpdate = hasPassword
      ? supabase.auth.updateUser({ password: passwordForm.password })
      : Promise.resolve({ error: null })

    const [{ error: profileError }, { error: pwError }] = await Promise.all([
      profileUpdate,
      passwordUpdate,
    ])

    setSaving(false)

    if (profileError) {
      setSaveError("Failed to save profile. Please try again.")
      return
    }
    if (pwError) {
      setPasswordError(pwError.message)
      return
    }

    if (hasPassword) setPasswordForm({ password: "", confirmPassword: "" })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20 md:pb-0">
      <AppNav />

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 font-heading">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
        </div>

        <div className="space-y-5">
          {/* Account Details */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={accountForm.full_name}
                    onChange={(e) => setAccountForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full p-2.5 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={accountForm.email}
                    disabled
                    className="w-full p-2.5 bg-muted/30 border border-border/50 rounded-xl opacity-50 cursor-not-allowed text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Location</label>
                  <input
                    type="text"
                    value={accountForm.location}
                    onChange={(e) => setAccountForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="City, Country"
                    className="w-full p-2.5 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Moon className="w-4 h-4 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-muted-foreground" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                  />
                  <Moon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications — informational only until DB columns exist */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="w-4 h-4 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Email notification preferences are coming soon. You&apos;ll be able to control activity reminders, friend requests, and more from here.
              </p>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-4 h-4 text-primary" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Privacy controls are coming soon. You&apos;ll be able to manage profile visibility, activity history, and data preferences here.
              </p>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Leave blank to keep your current password. Fill in both fields to update it.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="At least 8 characters"
                      className="w-full p-2.5 pr-10 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="Re-enter password"
                      className="w-full p-2.5 pr-10 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {passwordForm.password && (
                <p className={`text-xs font-medium ${passwordForm.password === passwordForm.confirmPassword && passwordForm.confirmPassword ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {passwordForm.password === passwordForm.confirmPassword && passwordForm.confirmPassword
                    ? "✓ Passwords match"
                    : passwordForm.confirmPassword
                    ? "Passwords do not match"
                    : ""}
                </p>
              )}
              {passwordError && (
                <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600">
                  {passwordError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {saveError && (
              <p role="alert" className="text-sm text-red-600 font-medium w-full sm:w-auto text-right">{saveError}</p>
            )}
            {saved && (
              <p role="status" aria-live="polite" className="text-sm text-emerald-600 font-medium w-full sm:w-auto text-right">
                ✓ Changes saved
              </p>
            )}
            <Button variant="outline" onClick={() => router.back()} size="sm" className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="gap-2 flex-1 sm:flex-none"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
