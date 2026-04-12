"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Calendar,
  User,
  Settings,
  Edit,
  Home,
  Shield,
  LogOut,
  ChevronDown,
  Activity,
  Clock,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Save,
  X,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  full_name: string | null
  location: string | null
  created_at: string
  bio: string | null
  avatar_url: string | null
}

interface UserSport {
  sport_id: number
  skill_level: string
  sports: { name: string; emoji: string }
}

interface DbActivity {
  id: string
  title: string
  location: string
  date: string
  time: string
  sports: { name: string; emoji: string } | null
  activity_participants: { user_id: string }[]
  max_participants: number
  host_id: string
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":")
  const hour = parseInt(h)
  const ampm = hour >= 12 ? "PM" : "AM"
  return `${hour % 12 || 12}:${m} ${ampm}`
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userSports, setUserSports] = useState<UserSport[]>([])
  const [upcomingActivities, setUpcomingActivities] = useState<DbActivity[]>([])
  const [totalJoined, setTotalJoined] = useState(0)
  const [loading, setLoading] = useState(true)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: "", location: "", bio: "" })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const today = new Date().toISOString().split("T")[0]

      const [{ data: profileData }, { data: sportsData }, { data: joinedData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_sports").select("sport_id, skill_level, sports (name, emoji)").eq("user_id", user.id),
        supabase.from("activity_participants").select("activity_id").eq("user_id", user.id),
      ])

      if (profileData) {
        setProfile(profileData as Profile)
        setEditForm({
          full_name: profileData.full_name ?? "",
          location: profileData.location ?? "",
          bio: profileData.bio ?? "",
        })
      }
      if (sportsData) setUserSports(sportsData as unknown as UserSport[])
      if (joinedData) setTotalJoined(joinedData.length)

      // Fetch upcoming activities user joined or hosted
      const joinedIds = joinedData?.map((j: { activity_id: string }) => j.activity_id) ?? []
      if (joinedIds.length > 0) {
        const { data: activities } = await supabase
          .from("activities")
          .select("id, title, location, date, time, host_id, max_participants, sports (name, emoji), activity_participants (user_id)")
          .in("id", joinedIds)
          .gte("date", today)
          .order("date", { ascending: true })
          .limit(5)
        if (activities) setUpcomingActivities(activities as unknown as DbActivity[])
      }

      setLoading(false)
    }
    init()
  }, [router, supabase])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editForm.full_name || null,
        location: editForm.location || null,
        bio: editForm.bio || null,
      })
      .eq("id", profile.id)

    if (!error) {
      setProfile((prev) => prev ? { ...prev, ...editForm } : prev)
      setEditing(false)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
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
                  <Image src="/images/peerfit-logo.png" alt="PeerFit Logo" width={100} height={100} className="w-12 h-12 object-contain" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    PeerFit
                  </span>
                  <p className="text-xs text-muted-foreground">Find your sports community</p>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-2">
                <Link href="/feed">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all">
                    <Home className="w-4 h-4" />Feed
                  </Button>
                </Link>
                <Link href="/activities">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all">
                    <Calendar className="w-4 h-4" />Activities
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-primary bg-primary/10 rounded-xl px-4 py-2">
                  <User className="w-4 h-4" />Profile
                </Button>
              </nav>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded-xl p-2" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <Avatar className="w-9 h-9 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback>{getInitials(profile?.full_name ?? null)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{profile?.full_name ?? "My Profile"}</p>
                  <p className="text-xs text-muted-foreground">Active member</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>

              {profileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-background border rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-primary bg-primary/10">
                      <User className="w-4 h-4" />Profile
                    </Button>
                    <Link href="/settings">
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Settings className="w-4 h-4" />Settings
                      </Button>
                    </Link>
                    <Separator className="my-2" />
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2 text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" />Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="mb-8 bg-background/60 backdrop-blur-xl border shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent h-32 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <CardContent className="p-8 -mt-16 relative">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="relative flex-shrink-0">
                <Avatar className="w-32 h-32 ring-4 ring-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    {getInitials(profile?.full_name ?? null)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                          className="mt-1"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <Input
                          value={editForm.location}
                          onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                          className="mt-1"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Bio</Label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                        rows={3}
                        placeholder="Tell others about yourself and your sporting interests..."
                        className="w-full mt-1 p-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-accent">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        <X className="w-4 h-4 mr-2" />Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-4xl font-bold mb-3">{profile?.full_name ?? "Your Name"}</h1>
                      <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-4">
                        {profile?.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-medium">{profile.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {profile?.created_at
                              ? `Joined ${new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="font-medium">Verified Member</span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setEditing(true)} className="bg-gradient-to-r from-primary to-accent shadow-lg px-6">
                      <Edit className="w-4 h-4 mr-2" />Edit Profile
                    </Button>
                  </div>
                )}

                {!editing && (
                  <>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
                      {profile?.bio ?? "No bio yet. Click Edit Profile to add something about yourself!"}
                    </p>

                    <div className="flex flex-wrap gap-3 mb-2">
                      {userSports.length > 0 ? (
                        userSports.map((us) => (
                          <Badge key={us.sport_id} className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-medium">
                            {us.sports?.emoji} {us.sports?.name}
                            <span className="ml-2 text-xs text-muted-foreground font-normal">· {us.skill_level}</span>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No sports added yet — update them in Settings.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="activities" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-background/60 backdrop-blur-xl border border-border/50 shadow-lg h-14">
            <TabsTrigger value="activities" className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Activities
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    Upcoming Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm mb-4">No upcoming activities.</p>
                      <Link href="/feed">
                        <Button size="sm" className="bg-gradient-to-r from-primary to-accent">Browse Activities</Button>
                      </Link>
                    </div>
                  ) : (
                    upcomingActivities.map((activity) => (
                      <div key={activity.id} className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">
                            {activity.sports?.emoji} {activity.title}
                          </h4>
                          <Badge className="bg-primary text-primary-foreground">
                            {new Date(activity.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">{activity.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{formatTime(activity.time)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    Activity Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 rounded-xl text-center">
                      <p className="text-3xl font-bold text-primary">{totalJoined}</p>
                      <p className="text-sm text-muted-foreground mt-1">Activities Joined</p>
                    </div>
                    <div className="p-4 bg-accent/5 rounded-xl text-center">
                      <p className="text-3xl font-bold text-accent">{userSports.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Sports</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Monthly Goal (10 activities)</span>
                      <span className="text-sm font-bold text-primary">{Math.min(totalJoined, 10)}/10</span>
                    </div>
                    <Progress value={Math.min((totalJoined / 10) * 100, 100)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Your Achievements</CardTitle>
                <p className="text-muted-foreground">Unlock badges by staying active and engaging with the community</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className={`text-center p-8 rounded-2xl border ${totalJoined >= 1 ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20" : "bg-muted/20 border-border/30 opacity-50"}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${totalJoined >= 1 ? "bg-primary" : "bg-muted"}`}>
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">First Step</h3>
                    <p className="text-sm text-muted-foreground mb-3">Join your first activity</p>
                    <Badge className={totalJoined >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}>
                      {totalJoined >= 1 ? "Earned" : "Locked"}
                    </Badge>
                  </div>
                  <div className={`text-center p-8 rounded-2xl border ${totalJoined >= 5 ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200" : "bg-muted/20 border-border/30 opacity-50"}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${totalJoined >= 5 ? "bg-yellow-500" : "bg-muted"}`}>
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Active Player</h3>
                    <p className="text-sm text-muted-foreground mb-3">Join 5+ activities</p>
                    <Badge className={totalJoined >= 5 ? "bg-yellow-500 text-white" : "bg-muted text-muted-foreground"}>
                      {totalJoined >= 5 ? "Earned" : `${totalJoined}/5`}
                    </Badge>
                  </div>
                  <div className={`text-center p-8 rounded-2xl border ${totalJoined >= 10 ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200" : "bg-muted/20 border-border/30 opacity-50"}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${totalJoined >= 10 ? "bg-blue-600" : "bg-muted"}`}>
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Dedicated Athlete</h3>
                    <p className="text-sm text-muted-foreground mb-3">Join 10+ activities</p>
                    <Badge className={totalJoined >= 10 ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}>
                      {totalJoined >= 10 ? "Earned" : `${totalJoined}/10`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Reviews & Feedback</CardTitle>
                <p className="text-muted-foreground">Reviews from other players will appear here after activities</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No reviews yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Join activities to start receiving reviews from other players.</p>
                  <Link href="/feed" className="mt-4 inline-block">
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent mt-4">Find Activities</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
