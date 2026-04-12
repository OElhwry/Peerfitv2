"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type DbActivity = {
  id: string
  title: string
  location: string
  date: string
  time: string
  duration_minutes: number
  max_participants: number
  skill_level: string
  host_id: string
  sports: { name: string; emoji: string } | null
  host: { full_name: string | null; avatar_url: string | null } | null
  activity_participants: { user_id: string }[]
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":")
  const hour = parseInt(h)
  const ampm = hour >= 12 ? "PM" : "AM"
  return `${hour % 12 || 12}:${m} ${ampm}`
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function ActivitiesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [activities, setActivities] = useState<DbActivity[]>([])
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const today = new Date().toISOString().split("T")[0]

      const [{ data: profile }, { data: allActivities }, { data: joined }] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single(),
        supabase
          .from("activities")
          .select(`*, sports (name, emoji), host:profiles!host_id (full_name, avatar_url), activity_participants (user_id)`)
          .eq("status", "open")
          .gte("date", today)
          .order("date", { ascending: true })
          .order("time", { ascending: true })
          .limit(50),
        supabase.from("activity_participants").select("activity_id").eq("user_id", user.id),
      ])

      if (profile) setUserProfile(profile)
      if (allActivities) setActivities(allActivities as unknown as DbActivity[])
      if (joined) setJoinedIds(new Set(joined.map((j: { activity_id: string }) => j.activity_id)))
      setLoading(false)
    }
    init()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Calendar helpers
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const diff = d.getDate() - d.getDay()
    return new Date(d.setDate(diff))
  }

  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekStart = getWeekStart(currentWeek)
  const weekDays = getWeekDays(weekStart)

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newDate)
  }

  const getActivitiesForDate = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-CA") // YYYY-MM-DD
    return activities.filter((a) => a.date === dateStr)
  }

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

  const formatMonthYear = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // Activities the user joined (for "My Activities" list)
  const myActivities = activities.filter((a) => joinedIds.has(a.id) || a.host_id === userId)
  const allUpcoming = activities.slice(0, 10)

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
                    <Home className="w-4 h-4" />
                    <span className="text-sm font-medium">Feed</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-primary bg-primary/10 rounded-xl px-4 py-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Activities</span>
                </Button>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/feed">
                <Button size="lg" className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-6 py-3 hidden md:flex">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Activity
                </Button>
              </Link>

              <div className="relative">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded-xl p-2 transition-colors"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarImage src={userProfile?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                      {getInitials(userProfile?.full_name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>

                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-50">
                    <div className="p-2">
                      <Link href="/profile">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                          <User className="w-4 h-4" />Profile
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                          <Settings className="w-4 h-4" />Settings
                        </Button>
                      </Link>
                      <Separator className="my-2" />
                      <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut className="w-4 h-4" />Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            My Activities
          </h1>
          <p className="text-muted-foreground">View and manage your sports activities</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Calendar */}
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">{formatMonthYear(currentWeek)}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")} className="hover:bg-primary/10">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())} className="hover:bg-primary/10">
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateWeek("next")} className="hover:bg-primary/10">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 md:gap-4">
                  {weekDays.map((day, index) => {
                    const dayActivities = getActivitiesForDate(day)
                    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

                    return (
                      <div
                        key={index}
                        className={`min-h-32 p-2 md:p-4 rounded-xl border transition-all ${
                          isToday(day) ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className="text-center mb-3">
                          <p className="text-xs font-medium text-muted-foreground">{dayNames[index]}</p>
                          <p className={`text-lg font-bold ${isToday(day) ? "text-primary" : ""}`}>{day.getDate()}</p>
                        </div>

                        <div className="space-y-2">
                          {dayActivities.map((activity) => {
                            const isJoined = joinedIds.has(activity.id)
                            const isHost = activity.host_id === userId
                            return (
                              <div
                                key={activity.id}
                                className={`p-2 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
                                  isJoined || isHost ? "bg-primary/10 border-primary/20" : "bg-background/80 border-border/50"
                                }`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-sm">{activity.sports?.emoji ?? "🏃"}</span>
                                  <p className="text-xs font-semibold truncate">{activity.title}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(activity.time)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{activity.location}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  <span>{activity.activity_participants?.length ?? 0}/{activity.max_participants}</span>
                                </div>
                              </div>
                            )
                          })}
                          {dayActivities.length === 0 && (
                            <div className="text-center py-4">
                              <p className="text-xs text-muted-foreground">No activities</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* My Activities */}
            {myActivities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">My Activities</h2>
                <div className="grid gap-4">
                  {myActivities.map((activity) => {
                    const participantCount = activity.activity_participants?.length ?? 0
                    const isHost = activity.host_id === userId
                    return (
                      <Card key={activity.id} className="bg-background/60 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-2xl">
                                {activity.sports?.emoji ?? "🏃"}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">{activity.title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(activity.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTime(activity.time)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <Badge variant="secondary">
                                {participantCount}/{activity.max_participants} players
                              </Badge>
                              {isHost && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Host</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Upcoming */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Upcoming Near You</h2>
                <Link href="/feed">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              {allUpcoming.length === 0 ? (
                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No upcoming activities yet.</p>
                    <Link href="/feed">
                      <Button className="bg-gradient-to-r from-primary to-accent">
                        <Plus className="w-4 h-4 mr-2" />Browse Activities
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {allUpcoming.map((activity) => {
                    const participantCount = activity.activity_participants?.length ?? 0
                    const spotsLeft = activity.max_participants - participantCount
                    const isJoined = joinedIds.has(activity.id)
                    const isHost = activity.host_id === userId
                    return (
                      <Card key={activity.id} className="bg-background/60 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-2xl">
                                {activity.sports?.emoji ?? "🏃"}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">{activity.title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(activity.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTime(activity.time)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <Badge variant="secondary">
                                {participantCount}/{activity.max_participants} players
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                <span className={`font-semibold ${spotsLeft === 0 ? "text-red-500" : "text-accent"}`}>{spotsLeft}</span> spots left
                              </div>
                              {isHost ? (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Your Activity</Badge>
                              ) : isJoined ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Joined</Badge>
                              ) : (
                                <Link href="/feed">
                                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent">Join</Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
