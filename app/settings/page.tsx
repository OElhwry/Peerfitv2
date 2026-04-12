"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Lock,
  Eye,
  Calendar,
  Home,
  Settings,
  LogOut,
  ChevronDown,
  Save,
  Edit,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [locationSharing, setLocationSharing] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Account form state
  const [accountForm, setAccountForm] = useState({
    full_name: "",
    email: "",
    location: "",
  })
  const [userId, setUserId] = useState<string | null>(null)

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

  const handleSaveSettings = async () => {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/feed" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <Image
                    src="/images/peerfit-logo.png"
                    alt="PeerFit Logo"
                    width={100}
                    height={100}
                    className="w-12 h-12 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span
                    className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    PeerFit
                  </span>
                  <p className="text-xs text-muted-foreground">Find your sports community</p>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-2">
                <Link href="/feed">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-sm font-medium">Feed</span>
                  </Button>
                </Link>
                <Link href="/activities">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Activities</span>
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded-xl p-2 transition-colors"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src="/abstract-geometric-shapes.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    U
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>

              {profileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <User className="w-4 h-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-primary bg-primary/10">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                    <Separator className="my-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
        </div>

        <div className="grid gap-6">
          {/* Account Settings */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/abstract-geometric-shapes.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-lg">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">Update your profile photo</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Change
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={accountForm.full_name}
                    onChange={(e) => setAccountForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full mt-1 p-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={accountForm.email}
                    disabled
                    className="w-full mt-1 p-3 bg-muted/30 border border-border/50 rounded-xl opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    value={accountForm.location}
                    onChange={(e) => setAccountForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="City, Country"
                    className="w-full mt-1 p-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive activity updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get notified about new activities and messages</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Activity Reminders</h3>
                  <p className="text-sm text-muted-foreground">Remind me about upcoming activities</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Profile Visibility</h3>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <Switch checked={profileVisibility} onCheckedChange={setProfileVisibility} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Location Sharing</h3>
                  <p className="text-sm text-muted-foreground">Share your location for nearby activities</p>
                </div>
                <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Eye className="w-4 h-4" />
                  Download My Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                App Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Language</label>
                <select className="w-full mt-1 p-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Time Zone</label>
                <select className="w-full mt-1 p-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>GMT (London)</option>
                  <option>EST (New York)</option>
                  <option>PST (Los Angeles)</option>
                  <option>CET (Berlin)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Distance Unit</label>
                <select className="w-full mt-1 p-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>Miles</option>
                  <option>Kilometers</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4 items-center">
            {saved && <span className="text-sm text-green-600 font-medium">Settings saved!</span>}
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
