"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Lock, Save, Loader2, Moon, Sun } from "lucide-react"
import AppNav from "@/components/app-nav"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const { theme, setTheme } = useTheme()

  // Account form
  const [accountForm, setAccountForm] = useState({
    full_name: "",
    email: "",
    location: "",
  })

  // Notification preferences (UI only — no DB column yet)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [activityReminders, setActivityReminders] = useState(true)

  // Privacy
  const [profileVisibility, setProfileVisibility] = useState(true)

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
    setSaving(true)
    await supabase
      .from("profiles")
      .update({
        full_name: accountForm.full_name || null,
        location: accountForm.location || null,
      })
      .eq("id", userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handlePasswordSave = async () => {
    if (passwordForm.password.length < 8) {
      setPasswordError("Your password must be at least 8 characters.")
      return
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("Your passwords do not match.")
      return
    }

    setPasswordError("")
    setPasswordMessage("")
    setPasswordSaving(true)

    const { error } = await supabase.auth.updateUser({ password: passwordForm.password })

    if (error) {
      setPasswordError(error.message)
      setPasswordSaving(false)
      return
    }

    setPasswordForm({ password: "", confirmPassword: "" })
    setPasswordSaving(false)
    setPasswordMessage("Password updated.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppNav />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">Manage your account and privacy preferences</p>
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

          {/* Notifications */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="w-4 h-4 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive activity updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Activity Reminders</p>
                  <p className="text-xs text-muted-foreground">Get reminded about upcoming activities</p>
                </div>
                <Switch checked={activityReminders} onCheckedChange={setActivityReminders} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-4 h-4 text-primary" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Public Profile</p>
                  <p className="text-xs text-muted-foreground">Let others find and view your profile</p>
                </div>
                <Switch checked={profileVisibility} onCheckedChange={setProfileVisibility} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-primary" />
                Email Sign-In Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Set a password so you can sign in with your email and password as well as Google.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="At least 8 characters"
                    className="w-full p-2.5 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    className="w-full p-2.5 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
              </div>
              {passwordError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600">
                  {passwordError}
                </div>
              )}
              {passwordMessage && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-700 font-medium">
                  {passwordMessage}
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handlePasswordSave} disabled={passwordSaving} size="sm" className="gap-2">
                  {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Save Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
            <Button variant="outline" onClick={() => router.back()} size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="gap-2"
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
