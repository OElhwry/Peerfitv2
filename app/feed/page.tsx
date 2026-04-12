"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  Search,
  SlidersHorizontal,
  Plus,
  Home,
  Bell,
  User,
  Heart,
  Share2,
  ChevronDown,
  Star,
  Activity,
  Settings,
  LogOut,
  X,
  Loader2,
  MessageCircle,
  Send,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import WeeklyCalendar from "@/components/weekly-calendar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type DbActivity = {
  id: string
  title: string
  description: string | null
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

type DbSport = { id: number; name: string; emoji: string }

type Message = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

function formatDate(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const d = new Date(dateStr + "T00:00:00")
  if (d.getTime() === today.getTime()) return "Today"
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow"
  return d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":")
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function ActivityFeedPage() {
  const router = useRouter()
  const supabase = createClient()

  const [activities, setActivities] = useState<DbActivity[]>([])
  const [dbSports, setDbSports] = useState<DbSport[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null)
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSport, setSelectedSport] = useState("All Sports")
  const [selectedDate, setSelectedDate] = useState("Any Time")
  const [selectedSkill, setSelectedSkill] = useState("All Levels")
  const [searchQuery, setSearchQuery] = useState("")
  const activeFilterCount = [
    selectedSport !== "All Sports",
    selectedDate !== "Any Time",
    selectedSkill !== "All Levels",
  ].filter(Boolean).length

  // UI
  const [likedActivities, setLikedActivities] = useState<Set<string>>(new Set())
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  // Create activity modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: "", sport_id: "", description: "", location: "",
    date: "", time: "", duration_minutes: "60", max_participants: "10", skill_level: "Any",
  })
  const [creating, setCreating] = useState(false)

  // Messaging
  const [openChatId, setOpenChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [newMessage, setNewMessage] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const fetchActivities = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]
    const { data } = await supabase
      .from("activities")
      .select(`*, sports(name,emoji), host:profiles!host_id(full_name,avatar_url), activity_participants(user_id)`)
      .eq("status", "open")
      .gte("date", today)
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(20)
    if (data) setActivities(data as unknown as DbActivity[])
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const [{ data: profile }, { data: sports }, { data: joined }] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single(),
        supabase.from("sports").select("id, name, emoji").order("name"),
        supabase.from("activity_participants").select("activity_id").eq("user_id", user.id),
      ])
      if (profile) setUserProfile(profile)
      if (sports) setDbSports(sports)
      if (joined) setJoinedIds(new Set(joined.map((j: { activity_id: string }) => j.activity_id)))
      await fetchActivities()
      setLoading(false)
    }
    init()
  }, [router, supabase, fetchActivities])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleJoinLeave = async (activityId: string) => {
    if (!userId) return
    setJoiningId(activityId)
    if (joinedIds.has(activityId)) {
      await supabase.from("activity_participants").delete().eq("activity_id", activityId).eq("user_id", userId)
      setJoinedIds((prev) => { const n = new Set(prev); n.delete(activityId); return n })
    } else {
      await supabase.from("activity_participants").insert({ activity_id: activityId, user_id: userId })
      setJoinedIds((prev) => new Set([...prev, activityId]))
    }
    await fetchActivities()
    setJoiningId(null)
  }

  const handleCreateActivity = async () => {
    if (!userId) return
    setCreating(true)
    const { data: newActivity, error } = await supabase
      .from("activities")
      .insert({
        title: createForm.title,
        sport_id: parseInt(createForm.sport_id),
        description: createForm.description || null,
        location: createForm.location,
        date: createForm.date,
        time: createForm.time,
        duration_minutes: parseInt(createForm.duration_minutes),
        max_participants: parseInt(createForm.max_participants),
        skill_level: createForm.skill_level,
        host_id: userId,
        status: "open",
      })
      .select("id")
      .single()

    if (!error && newActivity) {
      // Auto-add creator as participant
      await supabase.from("activity_participants").insert({ activity_id: newActivity.id, user_id: userId })
      setJoinedIds((prev) => new Set([...prev, newActivity.id]))
      setShowCreateModal(false)
      setCreateForm({ title: "", sport_id: "", description: "", location: "", date: "", time: "", duration_minutes: "60", max_participants: "10", skill_level: "Any" })
      await fetchActivities()
    }
    setCreating(false)
  }

  const openChat = async (activityId: string) => {
    if (openChatId === activityId) { setOpenChatId(null); return }
    setOpenChatId(activityId)
    if (messages[activityId]) return
    setLoadingMessages(true)
    const { data } = await supabase
      .from("activity_messages")
      .select("id, content, created_at, user_id, profiles:user_id(full_name, avatar_url)")
      .eq("activity_id", activityId)
      .order("created_at", { ascending: true })
      .limit(50)
    if (data) setMessages((prev) => ({ ...prev, [activityId]: data as unknown as Message[] }))
    setLoadingMessages(false)
  }

  const sendMessage = async (activityId: string) => {
    if (!userId || !newMessage.trim()) return
    setSendingMsg(true)
    const { data } = await supabase
      .from("activity_messages")
      .insert({ activity_id: activityId, user_id: userId, content: newMessage.trim() })
      .select("id, content, created_at, user_id, profiles:user_id(full_name, avatar_url)")
      .single()
    if (data) {
      setMessages((prev) => ({ ...prev, [activityId]: [...(prev[activityId] ?? []), data as unknown as Message] }))
      setNewMessage("")
    }
    setSendingMsg(false)
  }

  const sportFilterOptions = ["All Sports", ...dbSports.map((s) => s.name)]
  const dateOptions = ["Any Time", "Today", "Tomorrow", "This Week", "This Weekend"]
  const skillLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"]

  const filteredActivities = activities.filter((a) => {
    if (selectedSport !== "All Sports" && a.sports?.name !== selectedSport) return false
    if (selectedSkill !== "All Levels" && a.skill_level !== selectedSkill && a.skill_level !== "Any") return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!a.title.toLowerCase().includes(q) && !a.location.toLowerCase().includes(q) && !a.sports?.name.toLowerCase().includes(q)) return false
    }
    if (selectedDate !== "Any Time") {
      const today = new Date().toISOString().split("T")[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
      const endOfWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
      if (selectedDate === "Today" && a.date !== today) return false
      if (selectedDate === "Tomorrow" && a.date !== tomorrow) return false
      if (selectedDate === "This Week" && (a.date < today || a.date > endOfWeek)) return false
      if (selectedDate === "This Weekend") {
        const day = new Date(a.date + "T00:00:00").getDay()
        if (day !== 0 && day !== 6) return false
      }
    }
    return true
  })

  const activeDates = [...new Set(activities.map((a) => a.date))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <div className="relative">
                <Image src="/images/peerfit-logo.png" alt="PeerFit" width={40} height={40} className="w-9 h-9 object-contain" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                PeerFit
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-primary bg-primary/10 rounded-xl px-3 py-1.5 text-sm">
                <Home className="w-4 h-4 mr-1.5" />Feed
              </Button>
              <Link href="/activities">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-3 py-1.5 text-sm">
                  <Calendar className="w-4 h-4 mr-1.5" />Activities
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-3 py-1.5 text-sm">
                  <User className="w-4 h-4 mr-1.5" />Profile
                </Button>
              </Link>
            </nav>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Filters button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`relative gap-1.5 rounded-xl text-sm ${activeFilterCount > 0 ? "border-primary text-primary" : ""}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <Button
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md gap-1.5 rounded-xl text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>

              {/* Bell */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 w-9 h-9" onClick={() => setNotificationOpen(!notificationOpen)}>
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </Button>
                {notificationOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-background border border-border rounded-xl shadow-xl z-50">
                    <div className="p-3 border-b border-border">
                      <p className="font-semibold text-sm">Notifications</p>
                    </div>
                    <div className="p-3 text-sm text-muted-foreground text-center py-6">
                      No new notifications
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <div className="flex items-center gap-1.5 cursor-pointer hover:bg-muted/30 rounded-xl px-2 py-1.5 transition-colors" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                  <Avatar className="w-7 h-7 ring-2 ring-primary/20">
                    <AvatarImage src={userProfile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                      {getInitials(userProfile?.full_name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:block">{userProfile?.full_name?.split(" ")[0] ?? "Me"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-44 bg-background border border-border rounded-xl shadow-xl z-50">
                    <div className="p-1.5">
                      <Link href="/profile"><Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm"><User className="w-4 h-4" />Profile</Button></Link>
                      <Link href="/settings"><Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm"><Settings className="w-4 h-4" />Settings</Button></Link>
                      <Separator className="my-1" />
                      <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" />Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters dropdown panel */}
        {showFilters && (
          <div className="border-t border-border/50 bg-background/95">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-36">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Sport</label>
                  <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="w-full p-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {sportFilterOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="min-w-36">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">When</label>
                  <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {dateOptions.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="min-w-36">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Skill Level</label>
                  <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full p-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {skillLevels.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedSport("All Sports"); setSelectedDate("Any Time"); setSelectedSkill("All Levels") }}
                    className="text-muted-foreground hover:text-foreground gap-1.5 text-sm">
                    <X className="w-3.5 h-3.5" />Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <WeeklyCalendar activeDates={activeDates} />

            {/* Stats card */}
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-md">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">Your Activity</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-bold text-primary">{joinedIds.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Open nearby</span>
                  <span className="font-bold text-accent">{activities.length}</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all" style={{ width: `${Math.min((joinedIds.size / 5) * 100, 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main feed */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Activity Feed</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {loading ? "Loading..." : `${filteredActivities.length} ${filteredActivities.length === 1 ? "activity" : "activities"} found`}
                </p>
              </div>
              <Button size="sm" onClick={() => setShowCreateModal(true)} className="md:hidden bg-gradient-to-r from-primary to-accent gap-1.5 rounded-xl">
                <Plus className="w-4 h-4" />Create
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                  <Activity className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">No activities found</h3>
                <p className="text-muted-foreground mb-6 text-sm">Be the first to create one!</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-primary to-accent gap-2">
                  <Plus className="w-4 h-4" />Create Activity
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const participantCount = activity.activity_participants?.length ?? 0
                  const spotsLeft = activity.max_participants - participantCount
                  const isJoined = joinedIds.has(activity.id)
                  const isLoading = joiningId === activity.id
                  const isHost = activity.host_id === userId
                  const isFull = spotsLeft <= 0
                  const chatOpen = openChatId === activity.id
                  const activityMessages = messages[activity.id] ?? []

                  return (
                    <Card key={activity.id} className="group hover:shadow-lg transition-all duration-200 bg-background/70 backdrop-blur-sm border-border/50 hover:border-primary/20">
                      <CardContent className="p-5">
                        {/* Host row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 ring-2 ring-primary/10">
                              <AvatarImage src={activity.host?.avatar_url ?? undefined} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-semibold">
                                {getInitials(activity.host?.full_name ?? null)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold">{activity.host?.full_name ?? "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                              {activity.sports?.emoji} {activity.sports?.name}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {activity.skill_level}
                            </Badge>
                          </div>
                        </div>

                        {/* Title + spots */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{activity.description}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0 bg-muted/30 rounded-lg p-2 min-w-16">
                            <div className="flex items-center gap-1 text-sm font-semibold justify-end">
                              <Users className="w-3.5 h-3.5 text-primary" />
                              {participantCount}/{activity.max_participants}
                            </div>
                            <p className={`text-xs mt-0.5 font-medium ${isFull ? "text-red-500" : "text-accent"}`}>
                              {isFull ? "Full" : `${spotsLeft} left`}
                            </p>
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/20 rounded-xl mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{activity.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-secondary shrink-0" />
                            <span className="text-xs text-muted-foreground">{formatTime(activity.time)} · {formatDuration(activity.duration_minutes)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                            <span className="text-xs text-muted-foreground">{activity.skill_level}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => toggleLike(activity.id)}
                              className={`h-8 px-3 gap-1.5 text-xs ${likedActivities.has(activity.id) ? "text-red-500 bg-red-50" : "text-muted-foreground hover:text-red-400"}`}>
                              <Heart className={`w-3.5 h-3.5 ${likedActivities.has(activity.id) ? "fill-current" : ""}`} />
                              {likedActivities.has(activity.id) ? 1 : 0}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openChat(activity.id)}
                              className={`h-8 px-3 gap-1.5 text-xs ${chatOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"}`}>
                              <MessageCircle className="w-3.5 h-3.5" />
                              {activityMessages.length > 0 ? activityMessages.length : "Chat"}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-3 gap-1.5 text-xs text-muted-foreground hover:text-green-500">
                              <Share2 className="w-3.5 h-3.5" />Share
                            </Button>
                          </div>

                          {isHost ? (
                            <Badge className="px-3 py-1 text-xs bg-primary/10 text-primary border-primary/20">Your Activity</Badge>
                          ) : (
                            <Button
                              onClick={() => handleJoinLeave(activity.id)}
                              disabled={isLoading || (isFull && !isJoined)}
                              size="sm"
                              className={`h-8 px-4 text-xs rounded-lg ${
                                isJoined
                                  ? "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 border border-border"
                                  : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md"
                              }`}
                            >
                              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isJoined ? "Leave" : isFull ? "Full" : "Join"}
                            </Button>
                          )}
                        </div>

                        {/* Chat panel */}
                        {chatOpen && (
                          <div className="mt-4 border-t border-border/50 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold">Activity Chat</p>
                              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setOpenChatId(null)}>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                              {loadingMessages ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                </div>
                              ) : activityMessages.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-4">No messages yet. Start the conversation!</p>
                              ) : (
                                activityMessages.map((msg) => (
                                  <div key={msg.id} className={`flex gap-2 ${msg.user_id === userId ? "flex-row-reverse" : ""}`}>
                                    <Avatar className="w-6 h-6 shrink-0">
                                      <AvatarImage src={msg.profiles?.avatar_url ?? undefined} />
                                      <AvatarFallback className="text-xs">{getInitials(msg.profiles?.full_name ?? null)}</AvatarFallback>
                                    </Avatar>
                                    <div className={`max-w-xs rounded-xl px-3 py-2 ${msg.user_id === userId ? "bg-primary text-primary-foreground" : "bg-muted/40"}`}>
                                      {msg.user_id !== userId && (
                                        <p className="text-xs font-semibold mb-0.5 text-muted-foreground">{msg.profiles?.full_name ?? "User"}</p>
                                      )}
                                      <p className="text-sm">{msg.content}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(activity.id) } }}
                                className="text-sm h-8"
                              />
                              <Button size="sm" onClick={() => sendMessage(activity.id)} disabled={sendingMsg || !newMessage.trim()}
                                className="h-8 w-8 p-0 bg-gradient-to-r from-primary to-accent shrink-0">
                                {sendingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 lg:hidden shadow-2xl z-40">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" size="sm" className="flex flex-col gap-0.5 text-primary bg-primary/10 rounded-xl px-3 py-1.5">
            <Home className="w-5 h-5" /><span className="text-xs">Feed</span>
          </Button>
          <Link href="/activities">
            <Button variant="ghost" size="sm" className="flex flex-col gap-0.5 text-muted-foreground rounded-xl px-3 py-1.5">
              <Calendar className="w-5 h-5" /><span className="text-xs">Activities</span>
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="rounded-2xl w-12 h-12 bg-gradient-to-r from-primary to-accent shadow-lg -mt-4">
            <Plus className="w-5 h-5" />
          </Button>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="flex flex-col gap-0.5 text-muted-foreground rounded-xl px-3 py-1.5">
              <User className="w-5 h-5" /><span className="text-xs">Profile</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex flex-col gap-0.5 text-muted-foreground rounded-xl px-3 py-1.5">
            <LogOut className="w-5 h-5" /><span className="text-xs">Out</span>
          </Button>
        </div>
      </nav>

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-background border-border shadow-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Create Activity</CardTitle>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setShowCreateModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-3 max-h-[72vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs font-medium">Title</Label>
                  <Input placeholder="e.g. 5-a-side Football" value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Sport</Label>
                  <select value={createForm.sport_id} onChange={(e) => setCreateForm((f) => ({ ...f, sport_id: e.target.value }))} className="w-full mt-1 p-2 h-9 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select sport</option>
                    {dbSports.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Skill Level</Label>
                  <select value={createForm.skill_level} onChange={(e) => setCreateForm((f) => ({ ...f, skill_level: e.target.value }))} className="w-full mt-1 p-2 h-9 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {["Any", "Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-medium">Location</Label>
                  <Input placeholder="e.g. Hyde Park, London" value={createForm.location} onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Date</Label>
                  <Input type="date" value={createForm.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setCreateForm((f) => ({ ...f, date: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Time</Label>
                  <Input type="time" value={createForm.time} onChange={(e) => setCreateForm((f) => ({ ...f, time: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Duration (min)</Label>
                  <Input type="number" min="15" step="15" value={createForm.duration_minutes} onChange={(e) => setCreateForm((f) => ({ ...f, duration_minutes: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Max Players</Label>
                  <Input type="number" min="2" max="100" value={createForm.max_participants} onChange={(e) => setCreateForm((f) => ({ ...f, max_participants: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-medium">Description (optional)</Label>
                  <textarea placeholder="What should players expect?" value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full mt-1 p-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">You'll automatically be added as the first participant.</p>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 text-sm h-9" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button
                  className="flex-1 text-sm h-9 bg-gradient-to-r from-primary to-accent"
                  disabled={creating || !createForm.title || !createForm.sport_id || !createForm.location || !createForm.date || !createForm.time}
                  onClick={handleCreateActivity}
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  {creating ? "Creating..." : "Create Activity"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  function toggleLike(id: string) {
    setLikedActivities((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
}
