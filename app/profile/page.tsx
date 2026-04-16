  "use client"

  import AppNav from "@/components/app-nav"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Progress } from "@/components/ui/progress"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  import { createClient } from "@/lib/supabase/client"
  import {
    Activity,
    ArrowRight,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Edit,
    Flame,
    Loader2,
    MapPin,
    Palette,
    Save,
    Shield,
    Star,
    TrendingUp, Trophy, Users,
    X,
    Zap,
  } from "lucide-react"
  import Link from "next/link"
  import { useRouter } from "next/navigation"
  import type React from "react"
  import { useEffect, useRef, useState } from "react"

  // ── types ──────────────────────────────────────────────────────────────────────
  interface Profile {
    id: string
    full_name: string | null
    location: string | null
    created_at: string
    bio: string | null
    avatar_url: string | null
    favourite_sport: string | null
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
    duration_minutes: number
    sports: { name: string; emoji: string } | null
    activity_participants: { user_id: string; profiles: { full_name: string | null; avatar_url: string | null } | null }[]
    max_participants: number
    host_id: string
  }

  interface Review {
    id: string
    activity_id: string
    reviewer_id: string
    rating: number
    comment: string | null
    created_at: string
    profiles: { full_name: string | null; avatar_url: string | null } | null
  }

  // ── helpers ────────────────────────────────────────────────────────────────────
  function getInitials(name: string | null): string {
    if (!name) return "?"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  function formatTime(timeStr: string): string {
    const [h, m] = timeStr.split(":")
    const hour = parseInt(h)
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`
  }

  function activityIsCompleted(date: string, time: string, durationMinutes: number): boolean {
    return new Date() >= new Date(new Date(`${date}T${time}`).getTime() + durationMinutes * 60000)
  }

  function getBannerStyle(sport: string | null | undefined): string {
    const n = sport?.toLowerCase() ?? ""
    if (n.includes("football") || n.includes("soccer")) return "from-emerald-600 via-teal-500 to-emerald-700"
    if (n.includes("basketball")) return "from-orange-500 via-amber-400 to-orange-600"
    if (n.includes("tennis") || n.includes("badminton")) return "from-yellow-400 via-lime-400 to-yellow-500"
    if (n.includes("swim")) return "from-blue-500 via-cyan-400 to-blue-600"
    if (n.includes("run") || n.includes("athletics")) return "from-violet-600 via-purple-500 to-violet-700"
    if (n.includes("cycl") || n.includes("bike")) return "from-teal-500 via-cyan-400 to-teal-600"
    if (n.includes("gym") || n.includes("fitness")) return "from-red-500 via-rose-500 to-red-600"
    if (n.includes("rugby")) return "from-amber-600 via-orange-500 to-amber-700"
    if (n.includes("volleyball")) return "from-sky-500 via-blue-400 to-sky-600"
    if (n.includes("cricket")) return "from-lime-500 via-green-500 to-lime-600"
    return "from-primary via-accent/80 to-primary/60"
  }

  function getSportBadgeStyle(sport: string | null | undefined): string {
    const n = sport?.toLowerCase() ?? ""
    if (n.includes("football") || n.includes("soccer")) return "bg-emerald-500/15 text-emerald-600 border-emerald-400/30"
    if (n.includes("basketball")) return "bg-orange-500/15 text-orange-600 border-orange-400/30"
    if (n.includes("tennis") || n.includes("badminton")) return "bg-yellow-500/15 text-yellow-600 border-yellow-400/30"
    if (n.includes("swim")) return "bg-blue-500/15 text-blue-600 border-blue-400/30"
    if (n.includes("run") || n.includes("athletics")) return "bg-violet-500/15 text-violet-600 border-violet-400/30"
    if (n.includes("cycl") || n.includes("bike")) return "bg-teal-500/15 text-teal-600 border-teal-400/30"
    if (n.includes("gym") || n.includes("fitness")) return "bg-red-500/15 text-red-600 border-red-400/30"
    return "bg-primary/15 text-primary border-primary/30"
  }

  const SKILL_LEVELS: Record<string, { dots: number; label: string; barW: string }> = {
    Beginner: { dots: 1, label: "Beginner", barW: "w-1/3" },
    Intermediate: { dots: 2, label: "Intermediate", barW: "w-2/3" },
    Advanced: { dots: 3, label: "Advanced", barW: "w-full" },
    Any: { dots: 2, label: "Any level", barW: "w-2/3" },
  }

  function SkillDots({ level }: { level: string }) {
    const filled = SKILL_LEVELS[level]?.dots ?? 1
    return (
      <div className="flex gap-0.5">
        { [1, 2, 3].map((i) => (
          <span key={ i } className={ `w-1.5 h-1.5 rounded-full ${i <= filled ? "bg-current" : "bg-current opacity-20"}` } />
        )) }
      </div>
    )
  }

  function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
    return (
      <div className="flex items-center gap-0.5">
        { [1, 2, 3, 4, 5].map((star) => (
          <button key={ star } type="button" onClick={ () => onChange?.(star) }
            className={ `transition-all ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}` }>
            <Star className={ `${size === "sm" ? "w-3.5 h-3.5" : "w-6 h-6"} ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}` } />
          </button>
        )) }
      </div>
    )
  }

  // ── banner presets ─────────────────────────────────────────────────────────────
  const BANNER_PRESETS = [
    { id: "auto", label: "My Sport", swatch: "bg-gradient-to-r from-primary via-accent/80 to-primary/60" },
    { id: "sunset", label: "Sunset", swatch: "bg-gradient-to-r from-orange-400 via-pink-500 to-rose-600", gradient: "from-orange-400 via-pink-500 to-rose-600" },
    { id: "ocean", label: "Ocean", swatch: "bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-500", gradient: "from-sky-500 via-cyan-400 to-teal-500" },
    { id: "forest", label: "Forest", swatch: "bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600", gradient: "from-green-600 via-emerald-500 to-teal-600" },
    { id: "night", label: "Night", swatch: "bg-gradient-to-r from-indigo-800 via-purple-700 to-violet-800", gradient: "from-indigo-800 via-purple-700 to-violet-800" },
    { id: "fire", label: "Fire", swatch: "bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500", gradient: "from-red-500 via-orange-400 to-yellow-500" },
    { id: "aurora", label: "Aurora", swatch: "bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500", gradient: "from-teal-500 via-purple-500 to-pink-500" },
    { id: "gold", label: "Gold", swatch: "bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-400", gradient: "from-yellow-500 via-amber-400 to-orange-400" },
    { id: "rose", label: "Rose", swatch: "bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-600", gradient: "from-rose-400 via-pink-500 to-fuchsia-600" },
    { id: "slate", label: "Slate", swatch: "bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700", gradient: "from-slate-600 via-gray-600 to-slate-700" },
  ]

  // ── vibe system ────────────────────────────────────────────────────────────────
  function getVibeInfo(completed: number, sports: number, avgRating: string | null, total: number) {
    if (avgRating && Number(avgRating) >= 4.8 && completed >= 10)
      return { label: "The Legend", emoji: "👑", color: "text-amber-600 bg-amber-500/10 border-amber-400/30" }
    if (completed >= 20)
      return { label: "The Grinder", emoji: "💪", color: "text-red-600 bg-red-500/10 border-red-400/30" }
    if (sports >= 5)
      return { label: "The Explorer", emoji: "🌍", color: "text-teal-600 bg-teal-500/10 border-teal-400/30" }
    if (avgRating && Number(avgRating) >= 4.5)
      return { label: "Top Rated", emoji: "⭐", color: "text-yellow-600 bg-yellow-500/10 border-yellow-400/30" }
    if (completed >= 10)
      return { label: "The Veteran", emoji: "🏆", color: "text-blue-600 bg-blue-500/10 border-blue-400/30" }
    if (completed >= 5)
      return { label: "Active Player", emoji: "🎯", color: "text-primary bg-primary/10 border-primary/30" }
    if (sports >= 3)
      return { label: "Multi-Sport", emoji: "🏅", color: "text-violet-600 bg-violet-500/10 border-violet-400/30" }
    if (total >= 1)
      return { label: "Rising Star", emoji: "🌟", color: "text-orange-600 bg-orange-500/10 border-orange-400/30" }
    return { label: "New Arrival", emoji: "👋", color: "text-muted-foreground bg-muted/50 border-border/50" }
  }

  // ── component ──────────────────────────────────────────────────────────────────
  export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()

    const [profile, setProfile] = useState<Profile | null>(null)
    const [userSports, setUserSports] = useState<UserSport[]>([])
    const [upcomingActivities, setUpcomingActivities] = useState<DbActivity[]>([])
    const [completedActivities, setCompletedActivities] = useState<DbActivity[]>([])
    const [totalJoined, setTotalJoined] = useState(0)
    const [receivedReviews, setReceivedReviews] = useState<Review[]>([])
    const [givenReviews, setGivenReviews] = useState<{ activity_id: string; reviewee_id: string }[]>([])
    const [loading, setLoading] = useState(true)

    const [userId, setUserId] = useState<string | null>(null)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [editForm, setEditForm] = useState({ full_name: "", location: "", bio: "" })

    const avatarInputRef = useRef<HTMLInputElement>(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [avatarError, setAvatarError] = useState("")

    const [ratingModal, setRatingModal] = useState<{ activityId: string; revieweeId: string; revieweeName: string } | null>(null)
    const [ratingValue, setRatingValue] = useState(5)
    const [ratingComment, setRatingComment] = useState("")
    const [submittingReview, setSubmittingReview] = useState(false)

    // banner preset (localStorage)
    const [bannerPresetId, setBannerPresetId] = useState("auto")

    useEffect(() => {
      const stored = localStorage.getItem("peerfit_banner_preset")
      if (stored) setBannerPresetId(stored)
    }, [])

    const handleBannerPreset = (id: string) => {
      setBannerPresetId(id)
      localStorage.setItem("peerfit_banner_preset", id)
    }

    useEffect(() => {
      async function init() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }
        setUserId(user.id)

        const today = new Date().toISOString().split("T")[0]

        const [{ data: profileData }, { data: sportsData }, { data: joinedData }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("user_sports").select("sport_id, skill_level, sports(name,emoji)").eq("user_id", user.id),
          supabase.from("activity_participants").select("activity_id").eq("user_id", user.id),
        ])

        if (profileData) {
          setProfile(profileData as Profile)
          setEditForm({ full_name: profileData.full_name ?? "", location: profileData.location ?? "", bio: profileData.bio ?? "" })
        }
        if (sportsData) setUserSports(sportsData as unknown as UserSport[])
        if (joinedData) setTotalJoined(joinedData.length)

        const [{ data: receivedData }, { data: givenData }] = await Promise.all([
          supabase.from("activity_reviews")
            .select("id, activity_id, reviewer_id, rating, comment, created_at")
            .eq("reviewee_id", user.id).order("created_at", { ascending: false })
            .then((r) => (r.error ? { data: null } : r)),
          supabase.from("activity_reviews").select("activity_id, reviewee_id")
            .eq("reviewer_id", user.id).then((r) => (r.error ? { data: null } : r)),
        ])
        if (receivedData) {
          const reviewerIds = [...new Set((receivedData as { reviewer_id: string }[]).map((r) => r.reviewer_id))]
          let profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}

          if (reviewerIds.length > 0) {
            const { data: reviewerProfiles } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .in("id", reviewerIds)

            for (const reviewer of (reviewerProfiles ?? []) as { id: string; full_name: string | null; avatar_url: string | null }[]) {
              profileMap[reviewer.id] = {
                full_name: reviewer.full_name,
                avatar_url: reviewer.avatar_url,
              }
            }
          }

          setReceivedReviews(
            (receivedData as { id: string; activity_id: string; reviewer_id: string; rating: number; comment: string | null; created_at: string }[]).map((review) => ({
              ...review,
              profiles: profileMap[review.reviewer_id] ?? null,
            }))
          )
        }
        if (givenData) setGivenReviews(givenData as { activity_id: string; reviewee_id: string }[])

        const joinedIds = joinedData?.map((j: { activity_id: string }) => j.activity_id) ?? []
        if (joinedIds.length > 0) {
          const { data: allActivities } = await supabase
            .from("activities")
            .select("id, title, location, date, time, duration_minutes, host_id, max_participants, sports(name,emoji), activity_participants(user_id, profiles:user_id(full_name,avatar_url))")
            .in("id", joinedIds).order("date", { ascending: false })

          if (allActivities) {
            const all = allActivities as unknown as DbActivity[]
            setUpcomingActivities(all.filter((a) => !activityIsCompleted(a.date, a.time, a.duration_minutes) && a.date >= today).reverse())
            setCompletedActivities(all.filter((a) => activityIsCompleted(a.date, a.time, a.duration_minutes)))
          }
        }

        setLoading(false)
      }
      init()
    }, [router, supabase])

    const handleSave = async () => {
      if (!userId) return
      setSaving(true); setSaveError("")
      const { error } = await supabase.from("profiles").update({
        full_name: editForm.full_name.trim() || null,
        location: editForm.location.trim() || null,
        bio: editForm.bio.trim() || null,
      }).eq("id", userId)
      setSaving(false)
      if (error) { setSaveError(error.message); return }
      setProfile((prev) => prev ? { ...prev, full_name: editForm.full_name.trim() || null, location: editForm.location.trim() || null, bio: editForm.bio.trim() || null } : prev)
      setEditing(false)
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !userId) return
      setAvatarError(""); setUploadingAvatar(true)
      const ext = file.name.split(".").pop()
      const path = `${userId}_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
        const { error: dbError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId)
        if (dbError) setAvatarError(dbError.message)
        else setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : prev)
      } else {
        setAvatarError(
          uploadError.message.includes("Bucket not found") ? "The 'avatars' bucket doesn't exist yet."
            : uploadError.message.includes("row-level security") ? "Storage policy is blocking uploads."
              : uploadError.message
        )
      }
      setUploadingAvatar(false); e.target.value = ""
    }

    const handleSubmitReview = async () => {
      if (!profile || !ratingModal) return
      setSubmittingReview(true)
      await supabase.from("activity_reviews").insert({
        activity_id: ratingModal.activityId, reviewer_id: profile.id,
        reviewee_id: ratingModal.revieweeId, rating: ratingValue, comment: ratingComment || null,
      })
      setGivenReviews((prev) => [...prev, { activity_id: ratingModal.activityId, reviewee_id: ratingModal.revieweeId }])
      setRatingModal(null); setRatingValue(5); setRatingComment(""); setSubmittingReview(false)
    }

    const alreadyRated = (activityId: string, revieweeId: string) =>
      givenReviews.some((r) => r.activity_id === activityId && r.reviewee_id === revieweeId)

    const avgRating = receivedReviews.length > 0
      ? (receivedReviews.reduce((s, r) => s + r.rating, 0) / receivedReviews.length).toFixed(1)
      : null

    const favSport = profile?.favourite_sport
    const favSportInfo = userSports.find((s) => s.sports.name === favSport) ?? userSports[0]

    const resolvedBanner = bannerPresetId === "auto"
      ? getBannerStyle(favSport ?? userSports[0]?.sports?.name)
      : (BANNER_PRESETS.find((p) => p.id === bannerPresetId) as { gradient?: string })?.gradient
      ?? getBannerStyle(favSport)

    const vibe = getVibeInfo(completedActivities.length, userSports.length, avgRating, totalJoined)

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )
    }

    const memberSince = profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : ""

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AppNav />

        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

          {/* Incomplete profile nudge */ }
          { (!profile?.full_name || profile.full_name === "Your Name" || !profile?.location || !profile?.avatar_url) && !editing && (
            <div className="mb-5 overflow-hidden rounded-[28px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.97),rgba(6,78,59,0.94))] px-4 py-4 shadow-[0_24px_70px_rgba(6,78,59,0.2)]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                <Camera className="h-3.5 w-3.5" />
                Profile boost
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold tracking-tight text-white">Finish setting up your profile</p>
                  <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-white/72">
                    { !profile?.full_name || profile.full_name === "Your Name"
                      ? "Add your real name"
                      : "Add your city" }
                    { (!profile?.full_name || profile.full_name === "Your Name") && !profile?.location && " and city" }
                    { ((!profile?.full_name || profile.full_name === "Your Name") || !profile?.location) && !profile?.avatar_url && ", plus a profile photo," }
                    { ((!profile?.full_name || profile.full_name === "Your Name") || !profile?.location) || !profile?.avatar_url ? " " : "Add a profile photo " }
                    so other players know who you are.
                  </p>
                </div>
                <button
                  onClick={ () => setEditing(true) }
                  className="shrink-0 rounded-2xl border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-emerald-100 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <span className="inline-flex items-center gap-2">
                    Edit profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              </div>
            </div>
          ) }

          {/* ── Hero card ──────────────────────────────────────────────────────── */ }
          <div className="mb-6 rounded-3xl overflow-hidden shadow-2xl border border-border/30">

            {/* Banner */ }
            <div className={ `h-36 sm:h-52 bg-gradient-to-br ${resolvedBanner} relative overflow-hidden` }>
              {/* light overlay */ }
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.25),transparent_55%)]" />

              {/* large centred sport emoji */ }
              { favSportInfo && (
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                  <span className="text-[7rem] opacity-[0.12] drop-shadow-2xl">{ favSportInfo.sports.emoji }</span>
                </div>
              ) }

              {/* scattered sport decorations */ }
              <div className="absolute bottom-4 right-5 flex gap-3 select-none pointer-events-none">
                { userSports.slice(0, 5).map((us, i) => (
                  <span key={ us.sport_id } style={ { opacity: 0.18 + i * 0.04, fontSize: `${1.6 - i * 0.12}rem` } }>
                    { us.sports.emoji }
                  </span>
                )) }
              </div>

              {/* streak badge */ }
              { completedActivities.length >= 3 && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/25 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                  <Flame className="w-3.5 h-3.5 text-orange-300" />
                  { completedActivities.length } sessions
                </div>
              ) }

              {/* edit / share buttons */ }
              <div className="absolute top-4 right-4 flex gap-2">
                { !editing && (
                  <button
                    onClick={ () => setEditing(true) }
                    className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow-lg hover:bg-black/35 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />Edit
                  </button>
                ) }
              </div>
            </div>

            {/* Profile body */ }
            <div className="bg-background/97 backdrop-blur-sm px-4 sm:px-6 pb-5 sm:pb-6">

              {/* Avatar + name row */ }
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-12 sm:-mt-14 mb-4 sm:mb-5">

                {/* Avatar */ }
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 group">
                    <div className={ `absolute -inset-1 rounded-full bg-gradient-to-br ${resolvedBanner} opacity-60 blur-sm` } />
                    <Avatar className="relative w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-background shadow-2xl">
                      <AvatarImage src={ profile?.avatar_url ?? undefined } />
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                        { getInitials(profile?.full_name ?? null) }
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={ () => avatarInputRef.current?.click() }
                      disabled={ uploadingAvatar }
                      className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      { uploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" /> }
                    </button>
                    <input ref={ avatarInputRef } type="file" accept="image/*" className="hidden" onChange={ handleAvatarUpload } />
                  </div>
                  { avatarError && <p className="text-xs text-red-600 mt-1 max-w-[120px]">{ avatarError }</p> }
                </div>

                { !editing && (
                  <div className="flex-1 pb-1 pt-1 sm:pt-0 min-w-0">
                    {/* Name + badges */ }
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h1 className="text-xl sm:text-2xl font-bold" style={ { fontFamily: "var(--font-space-grotesk)" } }>
                        { profile?.full_name ?? "Your Name" }
                      </h1>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1 py-0.5">
                        <Shield className="w-3 h-3" />Verified
                      </Badge>
                      { avgRating && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs gap-1 py-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{ avgRating }
                        </Badge>
                      ) }
                    </div>

                    {/* Vibe badge */ }
                    <div className={ `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold mb-2 ${vibe.color}` }>
                      <span>{ vibe.emoji }</span>{ vibe.label }
                    </div>

                    {/* Location + joined */ }
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                      { profile?.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" />{ profile.location }</span>
                      ) }
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" />Joined { memberSince }</span>
                    </div>

                    {/* Favourite sport badge */ }
                    { favSportInfo && (
                      <div className={ `inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${getSportBadgeStyle(favSportInfo.sports.name)}` }>
                        <span className="text-base">{ favSportInfo.sports.emoji }</span>
                        { favSportInfo.sports.name }
                        <span className="opacity-60 font-normal text-xs">· { favSportInfo.skill_level }</span>
                      </div>
                    ) }
                  </div>
                ) }
              </div>

              {/* Edit form */ }
              { editing ? (
                <div className="space-y-5 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <Input value={ editForm.full_name } onChange={ (e) => setEditForm((f) => ({ ...f, full_name: e.target.value })) } className="mt-1" placeholder="Your name" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <Input value={ editForm.location } onChange={ (e) => setEditForm((f) => ({ ...f, location: e.target.value })) } className="mt-1" placeholder="City, Country" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    <textarea
                      value={ editForm.bio }
                      onChange={ (e) => setEditForm((f) => ({ ...f, bio: e.target.value })) }
                      rows={ 2 }
                      placeholder="Tell others about yourself..."
                      className="w-full mt-1 p-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm"
                    />
                  </div>

                  {/* Banner picker */ }
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <Palette className="w-3.5 h-3.5 text-primary" />Banner theme
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      { BANNER_PRESETS.map((p) => (
                        <button
                          key={ p.id }
                          type="button"
                          onClick={ () => handleBannerPreset(p.id) }
                          title={ p.label }
                          className={ `w-8 h-8 rounded-full border-2 transition-all ${p.swatch} ${bannerPresetId === p.id ? "border-foreground scale-110 shadow-md" : "border-transparent hover:scale-105"}` }
                        />
                      )) }
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      { BANNER_PRESETS.find((p) => p.id === bannerPresetId)?.label ?? "Auto" } — saved to this device
                    </p>
                  </div>

                  { saveError && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-600">{ saveError }</div>
                  ) }
                  <div className="flex gap-3">
                    <Button onClick={ handleSave } disabled={ saving }>
                      { saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" /> }Save Changes
                    </Button>
                    <Button variant="outline" onClick={ () => { setEditing(false); setSaveError("") } }>
                      <X className="w-4 h-4 mr-2" />Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  { profile?.bio && (
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-2xl">{ profile.bio }</p>
                  ) }

                  {/* Stats row */ }
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    { [
                      { label: "Sessions", value: totalJoined, color: "text-primary", bg: "bg-primary/8 border-primary/12" },
                      { label: "Completed", value: completedActivities.length, color: "text-yellow-600", bg: "bg-yellow-500/8 border-yellow-500/12" },
                      { label: "Sports", value: userSports.length, color: "text-accent", bg: "bg-accent/8 border-accent/12" },
                      { label: "Reviews", value: receivedReviews.length, color: "text-blue-600", bg: "bg-blue-500/8 border-blue-500/12" },
                    ].map(({ label, value, color, bg }) => (
                      <div key={ label } className={ `rounded-2xl p-3 text-center border ${bg}` }>
                        <p className={ `text-xl sm:text-2xl font-bold ${color}` }>{ value }</p>
                        <p className="text-[10px] font-medium mt-0.5 opacity-70">{ label }</p>
                      </div>
                    )) }
                  </div>

                  {/* Sports mastery cards */ }
                  { userSports.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      { userSports.map((us) => {
                        const style = getSportBadgeStyle(us.sports.name)
                        const isFav = us.sports.name === favSport
                        const skill = SKILL_LEVELS[us.skill_level] ?? SKILL_LEVELS.Beginner
                        return (
                          <div key={ us.sport_id }
                            className={ `relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${style} ${isFav ? "ring-2 ring-current ring-offset-1 shadow-sm" : ""}` }
                          >
                            { isFav && <Zap className="absolute top-1.5 right-1.5 w-3 h-3 opacity-60" /> }
                            <span className="text-2xl">{ us.sports.emoji }</span>
                            <p className="text-xs font-semibold leading-tight">{ us.sports.name }</p>
                            <div className="w-full h-1 bg-current/15 rounded-full overflow-hidden">
                              <div className={ `h-full bg-current/60 rounded-full ${skill.barW}` } />
                            </div>
                            <p className="text-[9px] opacity-60">{ skill.label }</p>
                          </div>
                        )
                      }) }
                    </div>
                  ) }
                </>
              ) }
            </div>
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────────────── */ }
          <Tabs defaultValue="activities" className="space-y-5 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-background/60 backdrop-blur-xl border border-border/50 shadow-sm h-11 rounded-2xl p-1">
              { [
                { value: "activities", label: "Upcoming" },
                { value: "completed", label: `Trophies${completedActivities.length > 0 ? ` (${completedActivities.length})` : ""}` },
                { value: "achievements", label: "Badges" },
                { value: "reviews", label: `Reviews${receivedReviews.length > 0 ? ` (${receivedReviews.length})` : ""}` },
              ].map((t) => (
                <TabsTrigger key={ t.value } value={ t.value }
                  className="text-[11px] sm:text-xs font-medium rounded-xl px-1 sm:px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  { t.label }
                </TabsTrigger>
              )) }
            </TabsList>

            {/* Upcoming */ }
            <TabsContent value="activities">
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-background/60 border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2.5 text-base">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    { upcomingActivities.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm mb-3">No upcoming sessions.</p>
                        <Link href="/feed"><Button size="sm" className="bg-gradient-to-r from-primary to-accent">Browse Activities</Button></Link>
                      </div>
                    ) : upcomingActivities.slice(0, 4).map((a) => {
                      const style = getSportBadgeStyle(a.sports?.name)
                      return (
                        <div key={ a.id } className={ `flex items-center gap-3 p-3 rounded-xl border ${style}` }>
                          <span className="text-2xl">{ a.sports?.emoji ?? "🏃" }</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{ a.title }</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              { new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) } · { formatTime(a.time) }
                            </p>
                          </div>
                        </div>
                      )
                    }) }
                  </CardContent>
                </Card>

                <Card className="bg-background/60 border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2.5 text-base">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-muted-foreground">Goal: 10 sessions</span>
                        <span className="text-xs font-bold text-primary">{ Math.min(completedActivities.length, 10) }/10</span>
                      </div>
                      <Progress value={ Math.min((completedActivities.length / 10) * 100, 100) } className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      { [
                        { label: "All time", value: totalJoined, color: "text-primary" },
                        { label: "Upcoming", value: upcomingActivities.length, color: "text-accent" },
                        { label: "Completed", value: completedActivities.length, color: "text-yellow-600" },
                        { label: "Sports", value: userSports.length, color: "text-blue-600" },
                      ].map(({ label, value, color }) => (
                        <div key={ label } className="p-2.5 bg-muted/30 rounded-xl">
                          <p className={ `text-lg font-bold ${color}` }>{ value }</p>
                          <p className="text-[10px] text-muted-foreground">{ label }</p>
                        </div>
                      )) }
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trophy cabinet */ }
            <TabsContent value="completed">
              { completedActivities.length === 0 ? (
                <Card className="bg-background/60 border-border/50">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-yellow-500/50" />
                    </div>
                    <p className="font-semibold mb-1">No trophies yet</p>
                    <p className="text-sm text-muted-foreground">Sessions you complete will appear here.</p>
                    <Link href="/feed" className="inline-block mt-4">
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent">Find Activities</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h2 className="font-bold">Trophy Cabinet</h2>
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">{ completedActivities.length }</Badge>
                  </div>
                  { completedActivities.map((a) => {
                    const others = (a.activity_participants ?? []).filter((p) => p.user_id !== profile?.id)
                    const style = getSportBadgeStyle(a.sports?.name)
                    return (
                      <div key={ a.id } className="bg-background/70 border border-border/40 rounded-2xl overflow-hidden">
                        <div className="h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500" />
                        <div className="p-4 flex items-start gap-3">
                          <div className={ `w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${style}` }>
                            { a.sports?.emoji ?? "🏃" }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">{ a.title }</p>
                              <Badge className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-400/20 h-4 px-1.5 gap-0.5">
                                <Trophy className="w-2.5 h-2.5" />Done
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              { new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) } · { formatTime(a.time) } · { a.location }
                            </p>
                            { others.length > 0 && (
                              <div className="mt-2.5 pt-2.5 border-t border-border/40">
                                <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Rate your players</p>
                                <div className="flex flex-wrap gap-2">
                                  { others.map((p) => {
                                    const rated = alreadyRated(a.id, p.user_id)
                                    return (
                                      <div key={ p.user_id } className="flex items-center gap-1.5">
                                        <Avatar className="w-5 h-5">
                                          <AvatarImage src={ p.profiles?.avatar_url ?? undefined } />
                                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{ getInitials(p.profiles?.full_name ?? null) }</AvatarFallback>
                                        </Avatar>
                                        { rated ? (
                                          <span className="text-[10px] text-green-600 flex items-center gap-0.5 font-medium">
                                            <CheckCircle2 className="w-3 h-3" />Rated
                                          </span>
                                        ) : (
                                          <button
                                            onClick={ () => setRatingModal({ activityId: a.id, revieweeId: p.user_id, revieweeName: p.profiles?.full_name ?? "Player" }) }
                                            className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-medium"
                                          >
                                            <Star className="w-2.5 h-2.5" />Rate { p.profiles?.full_name?.split(" ")[0] ?? "Player" }
                                          </button>
                                        ) }
                                      </div>
                                    )
                                  }) }
                                </div>
                              </div>
                            ) }
                          </div>
                        </div>
                      </div>
                    )
                  }) }
                </div>
              ) }
            </TabsContent>

            {/* Achievements */ }
            <TabsContent value="achievements">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                { [
                  { title: "First Step", desc: "Join your first activity", icon: Activity, iconBg: "bg-primary", bg: "from-primary/10 to-accent/10", threshold: 1, current: totalJoined },
                  { title: "Active Player", desc: "Complete 5 sessions", icon: Star, iconBg: "bg-yellow-500", bg: "from-yellow-500/10 to-orange-500/10", threshold: 5, current: completedActivities.length },
                  { title: "Dedicated Athlete", desc: "Complete 10 sessions", icon: Trophy, iconBg: "bg-blue-600", bg: "from-blue-500/10 to-purple-500/10", threshold: 10, current: completedActivities.length },
                  { title: "Social Butterfly", desc: "Receive 3+ reviews", icon: Users, iconBg: "bg-green-600", bg: "from-green-500/10 to-emerald-500/10", threshold: 3, current: receivedReviews.length },
                  { title: "Multi-Sport", desc: "Play 3+ sports", icon: Zap, iconBg: "bg-violet-600", bg: "from-violet-500/10 to-purple-500/10", threshold: 3, current: userSports.length },
                  { title: "Top Rated", desc: "Achieve a 4.5+ average rating", icon: Star, iconBg: "bg-amber-500", bg: "from-amber-500/10 to-yellow-500/10", threshold: 1, current: avgRating && Number(avgRating) >= 4.5 ? 1 : 0 },
                ].map(({ title, desc, icon: Icon, iconBg, bg, threshold, current }) => {
                  const earned = current >= threshold
                  const pct = Math.min(Math.round((current / threshold) * 100), 100)
                  return (
                    <div key={ title }
                      className={ `rounded-2xl border p-5 text-center transition-all ${earned
                        ? `bg-gradient-to-br ${bg} border-transparent shadow-md`
                        : "bg-muted/10 border-border/30 opacity-60 hover:opacity-80"
                        }` }
                    >
                      <div className={ `w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm ${earned ? iconBg : "bg-muted"} ${earned ? "ring-4 ring-current/10" : ""}` }>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-sm mb-1">{ title }</h3>
                      <p className="text-xs text-muted-foreground mb-3">{ desc }</p>
                      { earned ? (
                        <Badge className={ `${iconBg} text-white border-transparent text-xs px-3` }>
                          Earned ✓
                        </Badge>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-muted-foreground/40 rounded-full transition-all" style={ { width: `${pct}%` } } />
                          </div>
                          <p className="text-[10px] text-muted-foreground">{ Math.min(current, threshold) }/{ threshold }</p>
                        </div>
                      ) }
                    </div>
                  )
                }) }
              </div>
            </TabsContent>

            {/* Reviews */ }
            <TabsContent value="reviews">
              <Card className="bg-background/60 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-lg">Reviews & Ratings</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">What other players say about you</p>
                    </div>
                    { avgRating && (
                      <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-2">
                        <StarRating value={ Math.round(Number(avgRating)) } size="sm" />
                        <span className="text-lg font-bold text-yellow-600">{ avgRating }</span>
                        <span className="text-xs text-muted-foreground">({ receivedReviews.length })</span>
                      </div>
                    ) }
                  </div>
                </CardHeader>
                <CardContent>
                  { receivedReviews.length === 0 ? (
                    <div className="text-center py-10">
                      <Users className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No reviews yet — complete sessions to receive ratings.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      { receivedReviews.map((r) => (
                        <div key={ r.id } className="relative p-4 bg-muted/20 rounded-2xl border border-border/40 overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-l-2xl" />
                          <div className="flex gap-3 pl-2">
                            <Avatar className="w-9 h-9 shrink-0">
                              <AvatarImage src={ r.profiles?.avatar_url ?? undefined } />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{ getInitials(r.profiles?.full_name ?? null) }</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                <p className="font-semibold text-sm">{ r.profiles?.full_name ?? "Player" }</p>
                                <StarRating value={ r.rating } size="sm" />
                              </div>
                              { r.comment && (
                                <p className="text-sm text-foreground/80 leading-relaxed italic">&ldquo;{ r.comment }&rdquo;</p>
                              ) }
                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                { new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }
                              </p>
                            </div>
                          </div>
                        </div>
                      )) }
                    </div>
                  ) }
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Rating modal */ }
        { ratingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm bg-background border-border shadow-2xl">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Rate { ratingModal.revieweeName }</CardTitle>
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={ () => { setRatingModal(null); setRatingValue(5); setRatingComment("") } }>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">How was playing with them?</p>
                  <StarRating value={ ratingValue } onChange={ setRatingValue } />
                  <p className="text-sm font-semibold mt-2 text-yellow-600">
                    { ["", "Poor", "Fair", "Good", "Great", "Excellent!"][ratingValue] }
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium">Comment (optional)</Label>
                  <textarea
                    value={ ratingComment }
                    onChange={ (e) => setRatingComment(e.target.value) }
                    placeholder="Share your experience..."
                    rows={ 2 }
                    className="w-full mt-1 p-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-9 text-sm" onClick={ () => { setRatingModal(null); setRatingValue(5); setRatingComment("") } }>Cancel</Button>
                  <Button className="flex-1 h-9 text-sm bg-gradient-to-r from-primary to-accent" disabled={ submittingReview } onClick={ handleSubmitReview }>
                    { submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit" }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) }
      </div>
    )
  }
