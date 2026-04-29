  "use client"

  import AppNav from "@/components/app-nav"
  import { createClient } from "@/lib/supabase/client"
  import { getSportImage } from "@/lib/sport-image"
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
  } from "lucide-react"
  import Image from "next/image"
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

    const dayHasActivities = (dateStr: string) => activities.some((a) => a.date === dateStr)

    const dayActivities = selectedDay ? activities.filter((a) => a.date === selectedDay) : []

    const myActivities = activities.filter((a) => joinedIds.has(a.id) || a.host_id === userId)
    const upcoming = activities.filter((a) => !joinedIds.has(a.id) && a.host_id !== userId).slice(0, 12)
    const myEvents = activities.filter((a) => a.host_id === userId).length

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

    const MONTH_NAMES = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
    const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"]

    return (
      <div className="min-h-screen bg-ink pb-20 md:pb-0">
        <AppNav />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

          {/* Page header */ }
          <div className="flex items-end justify-between mb-6 gap-3">
            <div className="min-w-0">
              <h1 className="t-display-lg text-paper">Activities</h1>
              <p className="t-body text-paper/50 mt-1.5">Your schedule and upcoming sessions.</p>
            </div>
            <Link
              href="/feed"
              className="hidden sm:inline-flex shrink-0 h-10 px-5 items-center gap-2 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono-lg transition-colors"
            >
              <Plus className="w-4 h-4" />CREATE ACTIVITY
            </Link>
            <Link
              href="/feed"
              className="sm:hidden shrink-0 h-10 px-3 inline-flex items-center gap-1.5 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono transition-colors"
            >
              <Plus className="w-4 h-4" />CREATE
            </Link>
          </div>

          { loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-brand-pitch animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats ribbon — edge-to-edge, three cells */ }
              <div className="flex items-stretch border-y border-paper/10 divide-x divide-paper/10 mb-6">
                { [
                  { value: joinedIds.size, label: "JOINED" },
                  { value: myActivities.length, label: "UPCOMING" },
                  { value: myEvents, label: "HOSTING" },
                ].map(({ value, label }) => (
                  <div key={ label } className="flex-1 text-center py-4 px-2">
                    <p className="t-display-md text-brand-pitch leading-none">{ value }</p>
                    <p className="t-mono text-paper/40 text-xs mt-2">{ label }</p>
                  </div>
                )) }
              </div>

              <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Left: Calendar + selected day */ }
                <div className="lg:col-span-1 space-y-4">

                  {/* Calendar */ }
                  <div className="bg-paper/5 border border-paper/10">
                    {/* Month header */ }
                    <div className="flex items-center justify-between px-4 py-3 border-b border-paper/10">
                      <button onClick={ prevMonth } className="w-7 h-7 flex items-center justify-center text-paper/50 hover:text-paper transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="text-center">
                        <p className="t-eyebrow text-paper">{ MONTH_NAMES[month] }</p>
                        <p className="t-mono text-paper/40 text-xs mt-0.5">{ year }</p>
                      </div>
                      <button onClick={ nextMonth } className="w-7 h-7 flex items-center justify-center text-paper/50 hover:text-paper transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Day names */ }
                    <div className="grid grid-cols-7 px-2 pt-3">
                      { DAY_NAMES.map((d, i) => (
                        <div key={ i } className="text-center t-mono text-paper/30 text-[10px] py-1">{ d }</div>
                      )) }
                    </div>

                    {/* Days grid */ }
                    <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
                      { Array.from({ length: firstDay }).map((_, i) => <div key={ `empty-${i}` } />) }
                      { Array.from({ length: daysInMonth }).map((_, i) => {
                        const d = i + 1
                        const dateStr = toDateStr(d)
                        const isT = dateStr === today
                        const isSel = dateStr === selectedDay
                        const hasActs = dayHasActivities(dateStr)

                        return (
                          <button
                            key={ d }
                            onClick={ () => setSelectedDay(dateStr) }
                            className={ `relative flex flex-col items-center py-2 transition-colors ${isSel
                                ? "bg-brand-pitch text-ink"
                                : isT
                                  ? "border border-brand-pitch/40 text-brand-pitch"
                                  : "border border-transparent hover:bg-paper/5 text-paper"
                              }` }
                          >
                            <span className={ `t-display-sm leading-none ${isSel ? "" : isT ? "" : ""}` } style={ { fontSize: "15px" } }>
                              { d }
                            </span>
                            <span className={ `w-1 h-1 mt-1.5 ${hasActs ? (isSel ? "bg-ink" : "bg-brand-pitch") : "bg-transparent"}` } />
                          </button>
                        )
                      }) }
                    </div>
                  </div>

                  {/* Selected day panel */ }
                  { selectedDay && (
                    <div className="bg-paper/5 border border-paper/10">
                      <p className="t-eyebrow text-paper/40 px-4 pt-4">
                        { new Date(selectedDay + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase() }
                      </p>
                      <div className="px-4 pb-4 mt-3">
                        { dayActivities.length === 0 ? (
                          <p className="t-body text-paper/40 text-center py-5">No activities this day</p>
                        ) : (
                          <div className="space-y-2">
                            { dayActivities.map((a) => {
                              const isJoined = joinedIds.has(a.id)
                              const isHost = a.host_id === userId
                              const live = isInProgress(a)
                              return (
                                <div key={ a.id } className="flex items-center gap-2.5 py-2 border-b border-paper/8 last:border-0">
                                  <div className="relative w-7 h-7 border border-paper/15 overflow-hidden shrink-0">
                                    <Image src={ getSportImage(a.sports?.name).src } alt="" fill sizes="28px" className="object-cover" />
                                    <div className="absolute inset-0 bg-ink/35" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="t-body text-paper truncate">{ a.title }</p>
                                    <p className="t-mono text-paper/40 text-[10px]">{ formatTime(a.time) } · { a.location }</p>
                                  </div>
                                  <div className="shrink-0 flex flex-col items-end gap-0.5">
                                    { live && <span className="t-eyebrow text-red-400 text-[9px]">LIVE</span> }
                                    { isHost && <span className="t-eyebrow text-brand-pitch text-[9px]">HOST</span> }
                                    { !isHost && isJoined && <span className="t-eyebrow text-paper/60 text-[9px]">JOINED</span> }
                                  </div>
                                </div>
                              )
                            }) }
                          </div>
                        ) }
                      </div>
                    </div>
                  ) }
                </div>

                {/* Right: My sessions + upcoming */ }
                <div className="lg:col-span-2">

                  {/* Tab bar */ }
                  <div className="flex items-end gap-6 border-b border-paper/10 mb-5">
                    { ([
                      { key: "mine" as const, label: "MY SESSIONS", count: myActivities.length },
                      { key: "upcoming" as const, label: "UPCOMING", count: upcoming.length },
                    ]).map(({ key, label, count }) => (
                      <button
                        key={ key }
                        onClick={ () => setMyTab(key) }
                        className={ `pb-2.5 t-eyebrow border-b-2 -mb-px transition-colors ${myTab === key
                            ? "text-paper border-brand-pitch"
                            : "text-paper/30 border-transparent hover:text-paper/60"
                          }` }
                      >
                        { label }{ count > 0 && <span className="ml-1.5 text-paper/40">({ count })</span> }
                      </button>
                    )) }
                  </div>

                  {/* My sessions grid */ }
                  { myTab === "mine" && (
                    myActivities.length === 0 ? (
                      <EmptyPanel
                        icon={ <Activity className="w-7 h-7 text-brand-pitch" /> }
                        title="No sessions yet"
                        body="Join or create activities to see them here."
                        ctaLabel="BROWSE ACTIVITIES"
                      />
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        { myActivities.map((a) => {
                          const isHost = a.host_id === userId
                          const participantCount = a.activity_participants?.length ?? 0
                          const spotsLeft = a.max_participants - participantCount
                          const live = isInProgress(a)
                          const done = isCompleted(a)
                          const participants = (a.activity_participants ?? []).slice(0, 3)

                          return (
                            <div key={ a.id } className={ `relative bg-paper/3 border transition-colors ${live ? "border-red-400/40" : "border-paper/10 hover:border-paper/20"}` }>
                              { live && <span className="absolute top-0 left-0 bottom-0 w-0.5 bg-red-400" /> }
                              <div className="p-4">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="relative w-11 h-11 border border-paper/15 overflow-hidden shrink-0">
                                    <Image src={ getSportImage(a.sports?.name).src } alt="" fill sizes="44px" className="object-cover" />
                                    <div className="absolute inset-0 bg-ink/35" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-paper truncate leading-tight">{ a.title }</p>
                                    <p className="t-eyebrow text-brand-pitch mt-1">{ a.sports?.name?.toUpperCase() }</p>
                                  </div>
                                  { live ? (
                                    <span className="shrink-0 flex items-center gap-1 t-eyebrow text-paper bg-red-500/90 px-2 py-1 animate-pulse">
                                      <span className="w-1.5 h-1.5 bg-paper" />LIVE
                                    </span>
                                  ) : isHost ? (
                                    <span className="shrink-0 t-eyebrow text-brand-pitch border border-brand-pitch/30 bg-brand-pitch/10 px-2 py-1">HOST</span>
                                  ) : done ? (
                                    <span className="shrink-0 t-eyebrow text-paper/40 border border-paper/15 bg-paper/5 px-2 py-1">DONE</span>
                                  ) : (
                                    <span className="shrink-0 t-eyebrow text-brand-pitch border border-brand-pitch/30 bg-brand-pitch/10 px-2 py-1">JOINED</span>
                                  ) }
                                </div>

                                <div className="space-y-1.5 mb-3">
                                  <div className="flex items-center gap-1.5 t-mono text-paper/55 text-[11px]">
                                    <Calendar className="w-3 h-3 shrink-0" />
                                    { new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toUpperCase() }
                                    <span className="text-paper/25">·</span>
                                    <Clock className="w-3 h-3 shrink-0" />
                                    { formatTime(a.time) }
                                  </div>
                                  <div className="flex items-center gap-1.5 t-mono text-paper/55 text-[11px]">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{ a.location }</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-paper/8">
                                  <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                      { participants.map((p, i) => (
                                        <div key={ i } className="w-5 h-5 rounded-full ring-2 ring-ink bg-paper/10 overflow-hidden flex items-center justify-center shrink-0">
                                          { p.profiles?.avatar_url
                                            ? <img src={ p.profiles.avatar_url } alt="" className="w-full h-full object-cover" />
                                            : <span className="text-[7px] font-bold text-paper/70">{ getInitials(p.profiles?.full_name ?? null) }</span>
                                          }
                                        </div>
                                      )) }
                                    </div>
                                    <span className="t-mono text-paper/55 text-[11px]">{ participantCount }/{ a.max_participants }</span>
                                  </div>
                                  <span className={ `t-mono text-[11px] font-bold ${spotsLeft === 0 ? "text-red-400" : spotsLeft <= 2 ? "text-amber-400" : "text-brand-pitch"}` }>
                                    { spotsLeft === 0 ? "FULL" : `${spotsLeft} LEFT` }
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
                      <EmptyPanel
                        icon={ <Calendar className="w-7 h-7 text-brand-pitch" /> }
                        title="No upcoming activities"
                        body="Check back soon or create your own."
                        ctaLabel="BROWSE FEED"
                      />
                    ) : (
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        { upcoming.map((a) => {
                          const participantCount = a.activity_participants?.length ?? 0
                          const spotsLeft = a.max_participants - participantCount
                          const live = isInProgress(a)

                          return (
                            <Link
                              key={ a.id }
                              href="/feed"
                              className={ `relative group block bg-paper/3 border transition-colors ${live ? "border-red-400/40" : "border-paper/10 hover:border-brand-pitch/40"}` }
                            >
                              { live && <span className="absolute top-0 left-0 bottom-0 w-0.5 bg-red-400" /> }
                              <div className="p-3.5">
                                <div className="flex items-start gap-2.5 mb-2.5">
                                  <div className="relative w-10 h-10 border border-paper/15 overflow-hidden shrink-0">
                                    <Image src={ getSportImage(a.sports?.name).src } alt="" fill sizes="40px" className="object-cover" />
                                    <div className="absolute inset-0 bg-ink/35" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs text-paper truncate leading-tight group-hover:text-brand-pitch transition-colors">{ a.title }</p>
                                    <p className="t-eyebrow text-brand-pitch mt-0.5">{ a.sports?.name?.toUpperCase() }</p>
                                  </div>
                                </div>

                                <div className="space-y-1 mb-3">
                                  <div className="flex items-center gap-1 t-mono text-paper/55 text-[10px]">
                                    <Calendar className="w-2.5 h-2.5" />
                                    { new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toUpperCase() }
                                    <span className="text-paper/25">·</span>{ formatTime(a.time) }
                                  </div>
                                  <div className="flex items-center gap-1 t-mono text-paper/55 text-[10px]">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span className="truncate">{ a.location }</span>
                                  </div>
                                  <div className="flex items-center gap-1 t-mono text-paper/55 text-[10px]">
                                    <Star className="w-2.5 h-2.5" />{ a.skill_level?.toUpperCase() }
                                    <span className="ml-auto font-bold text-paper">{ participantCount }/{ a.max_participants }</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-paper/8">
                                  { live ? (
                                    <span className="t-eyebrow text-paper bg-red-500/90 px-2 py-1 animate-pulse flex items-center gap-1">
                                      <span className="w-1 h-1 bg-paper" />LIVE
                                    </span>
                                  ) : (
                                    <span className={ `t-mono text-[10px] font-bold ${spotsLeft === 0 ? "text-red-400" : spotsLeft <= 2 ? "text-amber-400" : "text-brand-pitch"}` }>
                                      { spotsLeft === 0 ? "FULL" : `${spotsLeft} ${spotsLeft !== 1 ? "SPOTS" : "SPOT"} LEFT` }
                                    </span>
                                  ) }
                                  <span className="ml-auto t-eyebrow text-paper/40 group-hover:text-brand-pitch transition-colors">JOIN &gt;</span>
                                </div>
                              </div>
                            </Link>
                          )
                        }) }
                      </div>
                    )
                  ) }
                </div>
              </div>
            </>
          ) }
        </div>
      </div>
    )
  }

  function EmptyPanel({ icon, title, body, ctaLabel }: { icon: React.ReactNode; title: string; body: string; ctaLabel: string }) {
    return (
      <div className="text-center py-16 border border-paper/10 bg-paper/3">
        <div className="w-14 h-14 mx-auto mb-4 border border-brand-pitch/30 bg-brand-pitch/10 flex items-center justify-center">
          { icon }
        </div>
        <h3 className="t-display-sm text-paper mb-2">{ title }</h3>
        <p className="t-body text-paper/50 mb-5 max-w-xs mx-auto">{ body }</p>
        <Link
          href="/feed"
          className="inline-flex h-10 px-5 items-center gap-2 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono-lg transition-colors"
        >
          <Plus className="w-4 h-4" />{ ctaLabel }
        </Link>
      </div>
    )
  }
