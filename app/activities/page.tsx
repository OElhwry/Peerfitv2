  "use client"

  import AppNav from "@/components/app-nav"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"
  import { createClient } from "@/lib/supabase/client"
  import {
    Activity,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    MapPin,
    Plus,
    Star,
    Trophy
  } from "lucide-react"
  import Link from "next/link"
  import { useRouter } from "next/navigation"
  import { useEffect, useState } from "react"

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
    activity_participants: { user_id: string; profiles: { full_name: string | null; avatar_url: string | null } | null }[]
  }

  function formatTime(timeStr: string): string {
    const [h, m] = timeStr.split(":")
    const hour = parseInt(h)
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`
  }

  function getInitials(name: string | null): string {
    if (!name) return "?"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  function getActivityEnd(date: string, time: string, mins: number): Date {
    return new Date(new Date(`${date}T${time}`).getTime() + mins * 60000)
  }

  function isInProgress(a: DbActivity): boolean {
    const start = new Date(`${a.date}T${a.time}`)
    const end = getActivityEnd(a.date, a.time, a.duration_minutes)
    const now = new Date()
    return now >= start && now < end
  }

  function isCompleted(a: DbActivity): boolean {
    return new Date() >= getActivityEnd(a.date, a.time, a.duration_minutes)
  }

  const SPORT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    football: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-400/30", dot: "bg-emerald-500" },
    soccer: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-400/30", dot: "bg-emerald-500" },
    basketball: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-400/30", dot: "bg-orange-500" },
    tennis: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-400/30", dot: "bg-yellow-500" },
    swimming: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-400/30", dot: "bg-blue-500" },
    running: { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-400/30", dot: "bg-violet-500" },
    cycling: { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-400/30", dot: "bg-teal-500" },
    gym: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-400/30", dot: "bg-red-500" },
    default: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", dot: "bg-primary" },
  }

  function getSportColor(sportName: string | null | undefined) {
    const n = sportName?.toLowerCase() ?? ""
    for (const [key, val] of Object.entries(SPORT_COLORS)) {
      if (key !== "default" && n.includes(key)) return val
    }
    return SPORT_COLORS.default
  }

  export default function ActivitiesPage() {
    const router = useRouter()
    const supabase = createClient()

    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [activities, setActivities] = useState<DbActivity[]>([])
    const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [myTab, setMyTab] = useState<"mine" | "upcoming">("mine")

    useEffect(() => {
      async function init() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }
        setUserId(user.id)

        const today = new Date().toISOString().split("T")[0]
        setSelectedDay(today)

        const [{ data: allActivities }, { data: joined }] = await Promise.all([
          supabase
            .from("activities")
            .select(`*, sports(name,emoji), host:profiles!host_id(full_name,avatar_url), activity_participants(user_id, profiles:user_id(full_name,avatar_url))`)
            .eq("status", "open")
            .gte("date", today)
            .order("date").order("time")
            .limit(60),
          supabase.from("activity_participants").select("activity_id").eq("user_id", user.id),
        ])

        if (allActivities) setActivities(allActivities as unknown as DbActivity[])
        if (joined) setJoinedIds(new Set(joined.map((j: { activity_id: string }) => j.activity_id)))
        setLoading(false)
      }
      init()
    }, [router, supabase])

    // Calendar
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date().toISOString().split("T")[0]

    const toDateStr = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`

    const activityDots = (dateStr: string) => activities.filter((a) => a.date === dateStr).slice(0, 4)

    const dayActivities = selectedDay ? activities.filter((a) => a.date === selectedDay) : []

    const myActivities = activities.filter((a) => joinedIds.has(a.id) || a.host_id === userId)
    const upcoming = activities.filter((a) => !joinedIds.has(a.id) && a.host_id !== userId).slice(0, 12)

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AppNav />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Page header */ }
          <div className="flex items-start sm:items-center justify-between mb-5 sm:mb-6 gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold" style={ { fontFamily: "var(--font-space-grotesk)" } }>Activities</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Your schedule and upcoming sessions</p>
            </div>
            <Link href="/feed" className="shrink-0">
              <Button className="bg-gradient-to-r from-primary to-accent gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Create Activity</span><span className="sm:hidden">Create</span>
              </Button>
            </Link>
          </div>

          { loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left: Calendar */ }
              <div className="lg:col-span-1 space-y-4">
                {/* Stats pills */ }
                <div className="grid grid-cols-3 gap-2">
                  { [
                    { icon: Activity, label: "Joined", value: joinedIds.size, color: "text-primary bg-primary/8 border-primary/15" },
                    { icon: Calendar, label: "Upcoming", value: myActivities.length, color: "text-accent bg-accent/8 border-accent/15" },
                    { icon: Trophy, label: "My events", value: activities.filter(a => a.host_id === userId).length, color: "text-yellow-600 bg-yellow-500/8 border-yellow-500/15" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={ label } className={ `rounded-xl p-3 border text-center ${color}` }>
                      <p className="text-lg font-bold">{ value }</p>
                      <p className="text-[10px] font-medium mt-0.5">{ label }</p>
                    </div>
                  )) }
                </div>

                {/* Calendar */ }
                <div className="bg-background/70 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                  {/* Month header */ }
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                    <button onClick={ prevMonth } className="w-7 h-7 rounded-lg hover:bg-muted/40 flex items-center justify-center transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <p className="text-sm font-bold">{ MONTH_NAMES[month] }</p>
                      <p className="text-xs text-muted-foreground">{ year }</p>
                    </div>
                    <button onClick={ nextMonth } className="w-7 h-7 rounded-lg hover:bg-muted/40 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day names */ }
                  <div className="grid grid-cols-7 px-2 pt-2">
                    { DAY_NAMES.map((d) => (
                      <div key={ d } className="text-center text-[10px] font-semibold text-muted-foreground py-1">{ d }</div>
                    )) }
                  </div>

                  {/* Days grid */ }
                  <div className="grid grid-cols-7 gap-px px-2 pb-3">
                    { Array.from({ length: firstDay }).map((_, i) => <div key={ `empty-${i}` } />) }
                    { Array.from({ length: daysInMonth }).map((_, i) => {
                      const d = i + 1
                      const dateStr = toDateStr(d)
                      const dots = activityDots(dateStr)
                      const isT = dateStr === today
                      const isSel = dateStr === selectedDay
                      const hasActs = dots.length > 0

                      return (
                        <button
                          key={ d }
                          onClick={ () => setSelectedDay(dateStr) }
                          className={ `relative flex flex-col items-center py-1.5 rounded-lg transition-all ${isSel
                              ? "bg-primary text-primary-foreground"
                              : isT
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted/40"
                            }` }
                        >
                          <span className={ `text-xs ${isSel ? "text-white" : ""}` }>{ d }</span>
                          { hasActs && (
                            <div className="flex gap-0.5 mt-0.5">
                              { dots.slice(0, 3).map((a, idx) => {
                                const col = getSportColor(a.sports?.name)
                                return <span key={ idx } className={ `w-1 h-1 rounded-full ${isSel ? "bg-white/70" : col.dot}` } />
                              }) }
                            </div>
                          ) }
                        </button>
                      )
                    }) }
                  </div>
                </div>

                {/* Selected day panel */ }
                { selectedDay && (
                  <div className="bg-background/70 border border-border/50 rounded-2xl p-4 shadow-sm">
                    <p className="text-sm font-semibold mb-3 text-muted-foreground">
                      { new Date(selectedDay + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) }
                    </p>
                    { dayActivities.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No activities this day</p>
                    ) : (
                      <div className="space-y-2">
                        { dayActivities.map((a) => {
                          const col = getSportColor(a.sports?.name)
                          const isJoined = joinedIds.has(a.id)
                          const isHost = a.host_id === userId
                          const live = isInProgress(a)
                          return (
                            <div key={ a.id } className={ `flex items-center gap-2.5 p-2.5 rounded-xl border ${col.bg} ${col.border}` }>
                              <span className="text-lg shrink-0">{ a.sports?.emoji ?? "🏃" }</span>
                              <div className="flex-1 min-w-0">
                                <p className={ `text-xs font-semibold truncate ${col.text}` }>{ a.title }</p>
                                <p className="text-[10px] text-muted-foreground">{ formatTime(a.time) } · { a.location }</p>
                              </div>
                              <div className="shrink-0 flex flex-col items-end gap-0.5">
                                { live && <span className="text-[9px] text-red-500 font-bold">LIVE</span> }
                                { isHost && <span className={ `text-[9px] font-bold ${col.text}` }>Host</span> }
                                { !isHost && isJoined && <span className="text-[9px] font-bold text-green-600">Joined</span> }
                              </div>
                            </div>
                          )
                        }) }
                      </div>
                    ) }
                  </div>
                ) }
              </div>

              {/* Right: My sessions + upcoming */ }
              <div className="lg:col-span-2">
                {/* Tab bar */ }
                <div className="flex gap-1 p-1 bg-muted/40 rounded-2xl border border-border/40 mb-4 sm:mb-5 w-full sm:w-fit">
                  { ([
                    { key: "mine" as const, label: `My Sessions${myActivities.length > 0 ? ` (${myActivities.length})` : ""}` },
                    { key: "upcoming" as const, label: `Upcoming${upcoming.length > 0 ? ` (${upcoming.length})` : ""}` },
                  ]).map(({ key, label }) => (
                    <button
                      key={ key }
                      onClick={ () => setMyTab(key) }
                      className={ `flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${myTab === key
                          ? "bg-background shadow-sm text-foreground border border-border/60"
                          : "text-muted-foreground hover:text-foreground"
                        }` }
                    >
                      { label }
                    </button>
                  )) }
                </div>

                {/* My sessions grid */ }
                { myTab === "mine" && (
                  myActivities.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
                      <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">No sessions yet</p>
                      <p className="text-xs text-muted-foreground mb-4">Join or create activities to see them here</p>
                      <Link href="/feed">
                        <Button size="sm" className="bg-gradient-to-r from-primary to-accent gap-1.5">
                          <Plus className="w-3.5 h-3.5" />Browse Activities
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      { myActivities.map((a) => {
                        const col = getSportColor(a.sports?.name)
                        const isHost = a.host_id === userId
                        const participantCount = a.activity_participants?.length ?? 0
                        const spotsLeft = a.max_participants - participantCount
                        const live = isInProgress(a)
                        const done = isCompleted(a)
                        const participants = (a.activity_participants ?? []).slice(0, 3)

                        return (
                          <div key={ a.id } className={ `rounded-2xl border overflow-hidden transition-all hover:shadow-md ${live ? "border-red-400/50 shadow-red-500/5" : "border-border/50"} bg-background/70` }>
                            {/* Top color strip */ }
                            <div className={ `h-1 w-full ${live ? "bg-gradient-to-r from-red-400 to-rose-500 animate-pulse" : `bg-gradient-to-r ${col.dot} opacity-60`}` }
                              style={ live ? {} : { background: "linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))" } }
                            />
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className={ `w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${col.bg} border ${col.border}` }>
                                  { a.sports?.emoji ?? "🏃" }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate leading-tight">{ a.title }</p>
                                  <p className={ `text-[10px] font-semibold mt-0.5 ${col.text}` }>{ a.sports?.name }</p>
                                </div>
                                { live ? (
                                  <Badge className="text-[10px] bg-red-500 text-white border-red-400 gap-0.5 animate-pulse shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />Live
                                  </Badge>
                                ) : isHost ? (
                                  <Badge className={ `text-[10px] ${col.bg} ${col.text} border ${col.border} shrink-0` }>Host</Badge>
                                ) : done ? (
                                  <Badge className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-400/20 shrink-0">Done</Badge>
                                ) : (
                                  <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-400/20 shrink-0">Joined</Badge>
                                ) }
                              </div>

                              <div className="space-y-1.5 mb-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3 shrink-0" />
                                  { new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) }
                                  { " · " }
                                  <Clock className="w-3 h-3 shrink-0" />
                                  { formatTime(a.time) }
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{ a.location }</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex -space-x-1.5">
                                    { participants.map((p, i) => (
                                      <Avatar key={ i } className="w-5 h-5 ring-1 ring-background">
                                        <AvatarImage src={ p.profiles?.avatar_url ?? undefined } />
                                        <AvatarFallback className={ `text-[8px] font-bold ${col.bg} ${col.text}` }>
                                          { getInitials(p.profiles?.full_name ?? null) }
                                        </AvatarFallback>
                                      </Avatar>
                                    )) }
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">{ participantCount }/{ a.max_participants }</span>
                                </div>
                                <span className={ `text-[10px] font-semibold ${spotsLeft === 0 ? "text-red-500" : spotsLeft <= 2 ? "text-orange-500" : "text-muted-foreground"}` }>
                                  { spotsLeft === 0 ? "Full" : `${spotsLeft} left` }
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }) }
                    </div>
                  )
                ) }

                {/* All upcoming grid */ }
                { myTab === "upcoming" && (
                  upcoming.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
                      <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">No upcoming activities</p>
                      <p className="text-xs text-muted-foreground mb-4">Check back soon or create your own</p>
                      <Link href="/feed">
                        <Button size="sm" className="bg-gradient-to-r from-primary to-accent gap-1.5">
                          <Plus className="w-3.5 h-3.5" />Browse Feed
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      { upcoming.map((a) => {
                        const col = getSportColor(a.sports?.name)
                        const participantCount = a.activity_participants?.length ?? 0
                        const spotsLeft = a.max_participants - participantCount
                        const live = isInProgress(a)

                        return (
                          <div key={ a.id } className={ `rounded-2xl border overflow-hidden transition-all hover:shadow-md ${live ? "border-red-400/50" : "border-border/50"} bg-background/70 group` }>
                            <div className={ `h-1 bg-gradient-to-r ${live ? "from-red-400 to-rose-500 animate-pulse" : ""}` }
                              style={ live ? {} : { background: `linear-gradient(to right, ${col.dot.replace("bg-", "")} 0%, transparent 100%)` } }
                            />
                            <div className="p-3.5">
                              <div className="flex items-start gap-2.5 mb-2.5">
                                <div className={ `w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${col.bg} border ${col.border}` }>
                                  { a.sports?.emoji ?? "🏃" }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-xs truncate leading-tight group-hover:text-primary transition-colors">{ a.title }</p>
                                  <p className={ `text-[10px] font-medium ${col.text}` }>{ a.sports?.name }</p>
                                </div>
                              </div>

                              <div className="space-y-1 mb-3">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Calendar className="w-2.5 h-2.5" />
                                  { new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) }
                                  { " · " }{ formatTime(a.time) }
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span className="truncate">{ a.location }</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Star className="w-2.5 h-2.5" />{ a.skill_level }
                                  <span className="ml-auto font-semibold">{ participantCount }/{ a.max_participants }</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                { live && (
                                  <Badge className="text-[9px] bg-red-500 text-white border-red-400 gap-0.5 animate-pulse">
                                    <span className="w-1 h-1 rounded-full bg-white inline-block" />Live
                                  </Badge>
                                ) }
                                <span className={ `text-[10px] font-semibold ${spotsLeft === 0 ? "text-red-500" : "text-muted-foreground"} ml-auto` }>
                                  { spotsLeft === 0 ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left` }
                                </span>
                                <Link href="/feed">
                                  <Button size="sm" className={ `h-7 px-2.5 text-[10px] font-semibold ${col.bg} ${col.text} border ${col.border} hover:opacity-80` } variant="outline">
                                    Join
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        )
                      }) }
                    </div>
                  )
                ) }
              </div>
            </div>
          ) }
        </div>
      </div>
    )
  }
