"use client"

import AppNav from "@/components/app-nav"
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
  Save,
  Star,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react"
import Image from "next/image"
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

function getSportImage(sportName: string | null | undefined): string {
  const n = sportName?.toLowerCase() ?? ""
  if (n.includes("football") || n.includes("soccer")) return "/images/sports/football.jpg"
  if (n.includes("basketball")) return "/images/sports/basketball.jpg"
  if (n.includes("tennis")) return "/images/sports/tennis.jpg"
  if (n.includes("badminton")) return "/images/sports/badminton.jpg"
  if (n.includes("swim")) return "/images/sports/swimming.jpg"
  if (n.includes("run") || n.includes("athletics")) return "/images/sports/running.jpg"
  if (n.includes("cycl") || n.includes("bike")) return "/images/sports/cycling.jpg"
  if (n.includes("gym") || n.includes("fitness")) return "/images/sports/gym.jpg"
  if (n.includes("rugby")) return "/images/sports/rugby.jpg"
  if (n.includes("volleyball")) return "/images/sports/volleyball.jpg"
  if (n.includes("cricket")) return "/images/sports/cricket.jpg"
  if (n.includes("boxing")) return "/images/sports/boxing.jpg"
  if (n.includes("padel")) return "/images/sports/padel.jpg"
  if (n.includes("golf")) return "/images/sports/golf.jpg"
  if (n.includes("yoga")) return "/images/sports/yoga.jpg"
  if (n.includes("hockey")) return "/images/sports/hockey.jpg"
  return "/images/sports/football.jpg"
}

function getBannerGradient(sportName: string | null | undefined): string {
  const n = sportName?.toLowerCase() ?? ""
  const base = "#141210"
  const glow = (color: string) =>
    `radial-gradient(ellipse at 15% 60%, ${color} 0%, transparent 65%), radial-gradient(ellipse at 85% 20%, ${color}55 0%, transparent 55%), ${base}`
  if (n.includes("football") || n.includes("soccer")) return glow("#1a5c2a")
  if (n.includes("basketball")) return glow("#7a3510")
  if (n.includes("tennis") || n.includes("padel")) return glow("#5c6e10")
  if (n.includes("badminton")) return glow("#105c7a")
  if (n.includes("swim")) return glow("#0e4a7a")
  if (n.includes("run") || n.includes("athletics")) return glow("#7a4a10")
  if (n.includes("cycl") || n.includes("bike")) return glow("#4a0e7a")
  if (n.includes("gym") || n.includes("fitness")) return glow("#7a0e35")
  if (n.includes("rugby")) return glow("#2a5c0e")
  if (n.includes("volleyball")) return glow("#7a5c10")
  if (n.includes("cricket")) return glow("#2e5c0e")
  if (n.includes("boxing")) return glow("#7a1010")
  if (n.includes("golf")) return glow("#0e6635")
  if (n.includes("yoga")) return glow("#5c0e7a")
  if (n.includes("hockey")) return glow("#0e3566")
  return glow("#2a2520")
}

function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange?.(star)}
          className={`transition-all ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}>
          <Star className={`${size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"} ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-paper/20"}`} />
        </button>
      ))}
    </div>
  )
}

function getVibeInfo(completed: number, sports: number, avgRating: string | null, total: number) {
  if (avgRating && Number(avgRating) >= 4.8 && completed >= 10) return { label: "The Legend" }
  if (completed >= 20) return { label: "The Grinder" }
  if (sports >= 5) return { label: "The Explorer" }
  if (avgRating && Number(avgRating) >= 4.5) return { label: "Top Rated" }
  if (completed >= 10) return { label: "The Veteran" }
  if (completed >= 5) return { label: "Active Player" }
  if (sports >= 3) return { label: "Multi-Sport" }
  if (total >= 1) return { label: "Rising Star" }
  return { label: "New Arrival" }
}

function getSpecialty(sports: { sports: { name: string } }[]): string | null {
  if (sports.length === 0) return null
  const names = sports.map((s) => s.sports.name.toLowerCase())
  const has = (...keys: string[]) => keys.some((k) => names.some((n) => n.includes(k)))

  const endurance = [has("swim"), has("run"), has("cycl"), has("athletic")].filter(Boolean).length
  if (endurance >= 3) return "TRIATHLETE"
  if (endurance >= 2) return "ENDURANCE BUILDER"

  const rackets = [has("tennis"), has("padel"), has("badminton")].filter(Boolean).length
  if (rackets >= 2) return "RACKET MASTER"

  if ((has("football") || has("soccer")) && has("basketball")) return "DUAL BALLER"
  if ((has("football") || has("soccer")) && has("rugby")) return "FIELD WARRIOR"
  if (has("basketball") && has("volley")) return "AIR GAME"
  if (has("box") && (has("gym") || has("fitness"))) return "FIGHT-READY"
  if (has("yoga") && (has("gym") || has("fitness"))) return "BALANCED BUILD"

  if (sports.length === 1) {
    if (has("football") || has("soccer")) return "STRIKER"
    if (has("basketball")) return "BALL HANDLER"
    if (has("tennis")) return "BASELINER"
    if (has("padel")) return "PADEL HEAD"
    if (has("badminton")) return "SHUTTLE PRO"
    if (has("swim")) return "LANE SWIMMER"
    if (has("run") || has("athletic")) return "DISTANCE RUNNER"
    if (has("cycl") || has("bike")) return "CYCLIST"
    if (has("gym") || has("fitness")) return "LIFTER"
    if (has("rugby")) return "FORWARD"
    if (has("box")) return "PUGILIST"
    if (has("yoga")) return "FLOW SEEKER"
    if (has("golf")) return "FAIRWAY HUNTER"
    if (has("cricket")) return "ALL-ROUNDER"
    if (has("hockey")) return "STICK PRO"
    if (has("volley")) return "NET PLAYER"
    return null
  }

  if (sports.length >= 5) return "ALL-AROUNDER"
  if (sports.length >= 3) return "MULTI-SPORT"
  return "DUAL ATHLETE"
}

function SkillSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts: [string, string][] = [["Beginner", "BEG"], ["Intermediate", "INT"], ["Advanced", "ADV"]]
  return (
    <div className="inline-flex border border-paper/15 shrink-0">
      {opts.map(([full, short]) => (
        <button
          key={full}
          type="button"
          onClick={() => onChange(full)}
          className={`t-eyebrow text-[10px] px-2 py-2 transition-colors ${
            value === full ? "bg-brand-pitch text-ink" : "bg-paper/[0.04] text-paper/50 hover:text-paper hover:bg-paper/10"
          }`}
        >
          {short}
        </button>
      ))}
    </div>
  )
}

const inputCls = "w-full bg-paper/8 border border-paper/15 text-paper placeholder:text-paper/30 focus:outline-none focus:border-brand-pitch px-3 py-2.5 text-sm transition-colors"
const labelCls = "t-eyebrow text-paper/40 text-[10px] block mb-1.5"

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
  const [allSports, setAllSports] = useState<{ id: number; name: string; emoji: string }[]>([])
  const [editingSports, setEditingSports] = useState<UserSport[]>([])
  const [addingSport, setAddingSport] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState("")

  const [ratingModal, setRatingModal] = useState<{ activityId: string; revieweeId: string; revieweeName: string } | null>(null)
  const [ratingValue, setRatingValue] = useState(5)
  const [ratingComment, setRatingComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  const [profileTab, setProfileTab] = useState<"upcoming" | "completed" | "badges" | "reviews">("upcoming")
  const [rotatingIdx, setRotatingIdx] = useState(0)

  useEffect(() => {
    if (userSports.length <= 1) return
    const id = setInterval(() => setRotatingIdx((i) => (i + 1) % userSports.length), 3200)
    return () => clearInterval(id)
  }, [userSports.length])

  const [bgSlots, setBgSlots] = useState<[string, string]>([getBannerGradient(null), ""])
  const [activeBgSlot, setActiveBgSlot] = useState<0 | 1>(0)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const today = new Date().toISOString().split("T")[0]

      const [{ data: profileData }, { data: sportsData }, { data: joinedData }, { data: allSportsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_sports").select("sport_id, skill_level, sports(name,emoji)").eq("user_id", user.id),
        supabase.from("activity_participants").select("activity_id").eq("user_id", user.id),
        supabase.from("sports").select("id, name, emoji").order("name"),
      ])

      if (profileData) {
        setProfile(profileData as Profile)
        setEditForm({ full_name: profileData.full_name ?? "", location: profileData.location ?? "", bio: profileData.bio ?? "" })
      }
      if (sportsData) setUserSports(sportsData as unknown as UserSport[])
      if (allSportsData) setAllSports(allSportsData as { id: number; name: string; emoji: string }[])
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
          const { data: reviewerProfiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", reviewerIds)
          for (const r of (reviewerProfiles ?? []) as { id: string; full_name: string | null; avatar_url: string | null }[]) {
            profileMap[r.id] = { full_name: r.full_name, avatar_url: r.avatar_url }
          }
        }
        setReceivedReviews(
          (receivedData as { id: string; activity_id: string; reviewer_id: string; rating: number; comment: string | null; created_at: string }[]).map((rev) => ({
            ...rev, profiles: profileMap[rev.reviewer_id] ?? null,
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
    if (error) { setSaveError(error.message); setSaving(false); return }

    // sync sports: delete all then re-insert
    await supabase.from("user_sports").delete().eq("user_id", userId)
    if (editingSports.length > 0) {
      await supabase.from("user_sports").insert(
        editingSports.map((s) => ({ user_id: userId, sport_id: s.sport_id, skill_level: s.skill_level }))
      )
    }

    setProfile((prev) => prev ? { ...prev, full_name: editForm.full_name.trim() || null, location: editForm.location.trim() || null, bio: editForm.bio.trim() || null } : prev)
    setUserSports(editingSports)
    setSaving(false)
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
  const rotatingSport = userSports.length > 0 ? userSports[rotatingIdx % userSports.length] : null
  const vibe = getVibeInfo(completedActivities.length, userSports.length, avgRating, totalJoined)
  const specialty = getSpecialty(userSports)

  useEffect(() => {
    if (!rotatingSport) return
    const newBg = getBannerGradient(rotatingSport.sports.name)
    setActiveBgSlot((prev) => {
      const next: 0 | 1 = prev === 0 ? 1 : 0
      setBgSlots((slots) => {
        const u: [string, string] = [slots[0], slots[1]]
        u[next] = newBg
        return u
      })
      return next
    })
  }, [rotatingSport?.sport_id])

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-pitch border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : ""

  const profileTabs = [
    { key: "upcoming" as const, label: "UPCOMING" },
    { key: "completed" as const, label: completedActivities.length > 0 ? `COMPLETED (${completedActivities.length})` : "COMPLETED" },
    { key: "badges" as const, label: "BADGES" },
    { key: "reviews" as const, label: receivedReviews.length > 0 ? `REVIEWS (${receivedReviews.length})` : "REVIEWS" },
  ]

  const showNudge = (!profile?.full_name || profile.full_name === "Your Name" || !profile?.location || !profile?.avatar_url) && !editing

  return (
    <div className="min-h-screen bg-ink text-paper pb-24 md:pb-8">
      <AppNav />

      {/* Incomplete profile nudge */}
      {showNudge && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
          <div className="bg-brand-pitch/10 border border-brand-pitch/25 px-4 py-4 mb-4">
            <p className="t-eyebrow text-brand-pitch text-[10px] mb-2">PROFILE BOOST</p>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-paper">Finish setting up your profile</p>
                <p className="t-mono text-paper/50 text-[10px] mt-1">
                  {!profile?.full_name || profile.full_name === "Your Name" ? "Add your real name" : "Add your city"}
                  {(!profile?.full_name || profile.full_name === "Your Name") && !profile?.location && " and city"}
                  {!profile?.avatar_url && ", plus a profile photo"}
                  {" "}so other players know who you are.
                </p>
              </div>
              <button
                onClick={() => { setEditing(true); setEditingSports(userSports); setAddingSport(false) }}
                className="shrink-0 t-eyebrow text-[10px] border border-brand-pitch/40 text-brand-pitch hover:bg-brand-pitch hover:text-ink px-3 py-1.5 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                EDIT <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="max-w-4xl mx-auto mt-4 sm:mt-6 border border-paper/10 overflow-hidden">

        {/* Banner — identity lives inside at the bottom */}
        <div className="relative h-52 sm:h-64 overflow-hidden" style={{ backgroundColor: "#141210" }}>

          {/* Two-layer cross-fading gradient — each sport gets its unique colour */}
          <div
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ background: bgSlots[0], opacity: activeBgSlot === 0 ? 1 : 0 }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ background: bgSlots[1], opacity: activeBgSlot === 1 ? 1 : 0 }}
          />

          {/* Sport name watermark — cycles through user's sports */}
          {rotatingSport && (
            <div className="absolute bottom-0 right-0 pb-4 pr-4 sm:pr-6 pointer-events-none select-none overflow-hidden">
              <span
                key={`wm-${rotatingSport.sport_id}`}
                className="font-['Anton'] leading-none uppercase text-paper/[0.12] block pf-letter-rise"
                style={{ fontSize: "clamp(3rem, 10vw, 6.5rem)" }}
              >
                {rotatingSport.sports.name}
              </span>
            </div>
          )}

          {/* Top controls */}
          <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 flex items-start justify-between">
            <div>
              {completedActivities.length >= 3 && (
                <div className="flex items-center gap-1.5 bg-ink/70 border border-paper/15 t-eyebrow text-xs px-3 py-1.5">
                  <Flame className="w-3.5 h-3.5 text-brand-pitch" />
                  {completedActivities.length} SESSIONS
                </div>
              )}
            </div>
            {!editing && (
              <button
                onClick={() => { setEditing(true); setEditingSports(userSports); setAddingSport(false) }}
                className="flex items-center gap-1.5 bg-ink/70 border border-paper/15 text-paper/70 hover:text-paper t-eyebrow text-xs px-3 py-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />EDIT
              </button>
            )}
          </div>

          {/* Bottom gradient scrim so text is always readable */}
          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-ink/80 to-transparent pointer-events-none" />

          {/* Identity + stats — pinned to bottom of banner */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 flex items-end justify-between gap-4">

            {/* Left: avatar + name */}
            <div className="flex items-end gap-4 min-w-0">
              <div className="shrink-0 relative">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-paper/10 border-2 border-paper/20 overflow-hidden group">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center t-display-sm text-paper/60" style={{ fontSize: "22px" }}>{getInitials(profile?.full_name ?? null)}</div>
                  }
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 rounded-full flex items-center justify-center bg-ink/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploadingAvatar ? <Loader2 className="w-4 h-4 text-paper animate-spin" /> : <Camera className="w-4 h-4 text-paper" />}
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                {avatarError && <p className="text-[10px] text-red-400 mt-1 max-w-[100px]">{avatarError}</p>}
              </div>

              {!editing && (
                <div className="min-w-0 pb-0.5">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="t-display-sm text-paper leading-tight" style={{ fontSize: "20px" }}>{profile?.full_name || "Your Name"}</h1>
                    {avgRating && (
                      <span className="t-mono text-paper/60 text-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{avgRating}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="t-eyebrow text-[10px] text-brand-pitch border border-brand-pitch/30 px-2 py-0.5">
                      {vibe.label.toUpperCase()}
                    </span>
                    {specialty && (
                      <span className="t-eyebrow text-[10px] text-paper/80 border border-paper/20 bg-paper/[0.06] px-2 py-0.5">
                        {specialty}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 t-mono text-paper/50 text-[10px]">
                    {profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {memberSince}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: rotating sport card — cycles through user's sports */}
            {!editing && rotatingSport && (() => {
              const lvl = rotatingSport.skill_level === "Advanced" ? 3 : rotatingSport.skill_level === "Intermediate" ? 2 : 1
              const pos = (rotatingIdx % userSports.length) + 1
              return (
                <div className="hidden sm:flex flex-col items-end justify-end pb-1 shrink-0 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-pitch animate-pulse" />
                    <p className="t-mono text-[10px] text-paper/45 tabular-nums tracking-widest">
                      {String(pos).padStart(2, "0")}
                      <span className="text-paper/20 mx-1">/</span>
                      {String(userSports.length).padStart(2, "0")}
                    </p>
                  </div>
                  <p
                    key={`rot-name-${rotatingSport.sport_id}`}
                    className="font-['Anton'] text-paper/90 uppercase leading-none pf-letter-rise"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
                  >
                    {rotatingSport.sports.name}
                  </p>
                  {rotatingSport.skill_level && (
                    <div key={`rot-skill-${rotatingSport.sport_id}`} className="flex items-center gap-2 pf-letter-rise">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className={`block h-0.5 w-4 transition-colors duration-500 ${n <= lvl ? "bg-brand-pitch" : "bg-paper/15"}`}
                          />
                        ))}
                      </div>
                      <span className="t-eyebrow text-[9px] text-paper/40">{rotatingSport.skill_level.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Profile panel — bio + edit form only */}
        <div className="bg-paper/[0.03] border-t border-paper/10 px-4 sm:px-6 pb-5 sm:pb-6">
          {!editing && profile?.bio && (
            <p className="t-body text-paper/50 text-sm pt-4 leading-relaxed max-w-2xl">{profile.bio}</p>
          )}

          {/* Edit form */}
          {editing && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>FULL NAME</label>
                  <input value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} className={inputCls} placeholder="Your name" />
                </div>
                <div>
                  <label className={labelCls}>LOCATION</label>
                  <input value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} className={inputCls} placeholder="City, Country" />
                </div>
              </div>
              <div>
                <label className={labelCls}>BIO</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                  rows={2}
                  placeholder="Tell others about yourself..."
                  className="w-full bg-paper/8 border border-paper/15 text-paper placeholder:text-paper/30 focus:outline-none focus:border-brand-pitch px-3 py-2.5 text-sm transition-colors resize-none"
                />
              </div>
              {/* Sports */}
              <div>
                <label className={labelCls}>YOUR SPORTS</label>
                <div className="space-y-2 mb-2">
                  {editingSports.map((s) => (
                    <div key={s.sport_id} className="flex items-center gap-2">
                      <span className="flex-1 min-w-0 bg-paper/[0.04] border border-paper/10 pl-1.5 pr-3 py-1.5 text-sm text-paper flex items-center gap-2.5">
                        <span className="relative w-7 h-7 border border-paper/15 overflow-hidden shrink-0">
                          <Image src={getSportImage(s.sports.name)} alt="" fill sizes="28px" className="object-cover" />
                          <span className="absolute inset-0 bg-ink/25" />
                        </span>
                        <span className="truncate">{s.sports.name}</span>
                      </span>
                      <SkillSelector
                        value={s.skill_level}
                        onChange={(v) => setEditingSports((prev) => prev.map((x) => x.sport_id === s.sport_id ? { ...x, skill_level: v } : x))}
                      />
                      <button
                        onClick={() => setEditingSports((prev) => prev.filter((x) => x.sport_id !== s.sport_id))}
                        className="p-2 text-paper/40 hover:text-red-400 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add sport — tile picker */}
                {addingSport ? (
                  <div className="border border-paper/15 bg-ink/40 p-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="t-eyebrow text-paper/50 text-[10px]">PICK A SPORT TO ADD</p>
                      <button
                        onClick={() => setAddingSport(false)}
                        className="text-paper/40 hover:text-paper transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {(() => {
                      const available = allSports.filter((s) => !editingSports.find((e) => e.sport_id === s.id))
                      if (available.length === 0) {
                        return <p className="t-mono text-paper/40 text-[10px] text-center py-3">All sports added.</p>
                      }
                      return (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                          {available.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setEditingSports((prev) => [
                                  ...prev,
                                  { sport_id: s.id, skill_level: "Beginner", sports: { name: s.name, emoji: s.emoji } },
                                ])
                              }}
                              className="group flex flex-col items-start gap-1 bg-paper/[0.04] hover:bg-brand-pitch/10 border border-paper/10 hover:border-brand-pitch/40 p-2.5 text-left transition-colors"
                            >
                              <span className="text-base leading-none">{s.emoji}</span>
                              <span className="t-mono text-paper/70 group-hover:text-paper text-[10px] truncate w-full">{s.name}</span>
                            </button>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingSport(true)}
                    className="t-eyebrow text-[10px] border border-paper/15 text-paper/50 hover:text-paper hover:border-paper/30 px-3 py-2 transition-colors"
                  >+ ADD SPORT</button>
                )}
              </div>

              {saveError && <div className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400 text-sm">{saveError}</div>}
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="t-eyebrow text-xs bg-brand-pitch text-ink hover:opacity-90 disabled:opacity-50 px-4 py-2.5 flex items-center gap-2 transition-opacity">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}SAVE
                </button>
                <button onClick={() => { setEditing(false); setSaveError("") }} className="t-eyebrow text-xs border border-paper/20 text-paper/50 hover:text-paper px-4 py-2.5 flex items-center gap-2 transition-colors">
                  <X className="w-3.5 h-3.5" />CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page content */}
      {!editing && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6 pb-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-paper/10 border border-paper/10 mb-6">
            {[
              { label: "SESSIONS", value: totalJoined },
              { label: "COMPLETED", value: completedActivities.length },
              { label: "REVIEWS", value: receivedReviews.length },
              { label: "RATING", value: avgRating ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="py-4 text-center">
                <p className="t-display-md text-brand-pitch" style={{ fontSize: "26px" }}>{value}</p>
                <p className="t-eyebrow text-paper/40 text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Sports mastery */}
          {userSports.length > 0 && (
            <div className="mb-6">
              <p className="t-eyebrow text-paper/40 text-[10px] mb-3">SPORTS</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {userSports.map((us) => {
                  const lvl = us.skill_level === "Advanced" ? 3 : us.skill_level === "Intermediate" ? 2 : 1
                  const isFav = us.sports.name === favSport
                  return (
                    <div key={us.sport_id} className={`relative border border-paper/10 flex items-center gap-3 p-3 ${isFav ? "bg-brand-pitch/5" : "bg-paper/[0.03]"}`}>
                      {isFav && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-pitch" />}
                      <div className="relative w-9 h-9 border border-paper/15 overflow-hidden shrink-0">
                        <Image src={getSportImage(us.sports.name)} alt="" fill sizes="36px" className="object-cover" />
                        <div className="absolute inset-0 bg-ink/30" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-paper truncate">{us.sports.name}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex items-center gap-0.5 shrink-0">
                            {[1, 2, 3].map((n) => (
                              <span
                                key={n}
                                className={`block h-0.5 w-3 ${n <= lvl ? "bg-brand-pitch" : "bg-paper/15"}`}
                              />
                            ))}
                          </div>
                          <span className="t-mono text-paper/30 text-[9px] shrink-0 truncate">{us.skill_level.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab bar */}
          <div className="flex border-b border-paper/10 mb-6 overflow-x-auto">
            {profileTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setProfileTab(key)}
                className={`flex-shrink-0 px-4 py-3 t-eyebrow text-xs border-b-2 -mb-px transition-colors ${
                  profileTab === key ? "text-paper border-brand-pitch" : "text-paper/40 border-transparent hover:text-paper/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Upcoming ── */}
          {profileTab === "upcoming" && (
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Upcoming sessions */}
              <div className="bg-paper/5 border border-paper/10">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-paper/10">
                  <Activity className="w-3.5 h-3.5 text-brand-pitch" />
                  <p className="t-eyebrow text-paper/60 text-xs">UPCOMING SESSIONS</p>
                </div>
                <div className="divide-y divide-paper/8">
                  {upcomingActivities.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <p className="t-body text-paper/40 text-sm mb-4">No upcoming sessions.</p>
                      <Link href="/feed" className="t-eyebrow text-xs border border-brand-pitch text-brand-pitch px-4 py-2 hover:bg-brand-pitch hover:text-ink transition-colors">
                        BROWSE ACTIVITIES
                      </Link>
                    </div>
                  ) : upcomingActivities.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="relative w-9 h-9 border border-paper/15 overflow-hidden shrink-0">
                        <Image src={getSportImage(a.sports?.name)} alt="" fill sizes="36px" className="object-cover" />
                        <div className="absolute inset-0 bg-ink/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-paper truncate">{a.title}</p>
                        <p className="t-mono text-paper/40 text-[10px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {formatTime(a.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="bg-paper/5 border border-paper/10">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-paper/10">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-pitch" />
                  <p className="t-eyebrow text-paper/60 text-xs">PROGRESS</p>
                </div>
                <div className="px-4 py-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="t-mono text-paper/40 text-[10px]">GOAL: 10 SESSIONS</span>
                      <span className="t-mono text-brand-pitch text-[10px]">{Math.min(completedActivities.length, 10)}/10</span>
                    </div>
                    <div className="h-1 bg-paper/10">
                      <div className="h-full bg-brand-pitch transition-all" style={{ width: `${Math.min((completedActivities.length / 10) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-paper/10">
                    {[
                      { label: "ALL TIME", value: totalJoined },
                      { label: "UPCOMING", value: upcomingActivities.length },
                      { label: "COMPLETED", value: completedActivities.length },
                      { label: "SPORTS", value: userSports.length },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-ink py-3 text-center">
                        <p className="t-display-sm text-brand-pitch" style={{ fontSize: "22px" }}>{value}</p>
                        <p className="t-eyebrow text-paper/40 text-[9px] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Completed — photo grid ── */}
          {profileTab === "completed" && (
            completedActivities.length === 0 ? (
              <div className="bg-paper/5 border border-paper/10 py-16 text-center">
                <Trophy className="w-8 h-8 text-paper/20 mx-auto mb-3" />
                <p className="t-eyebrow text-paper/40 text-xs mb-1">NO TROPHIES YET</p>
                <p className="t-body text-paper/30 text-sm">Sessions you complete will appear here.</p>
                <Link href="/feed" className="inline-block mt-5 t-eyebrow text-xs border border-brand-pitch text-brand-pitch px-4 py-2 hover:bg-brand-pitch hover:text-ink transition-colors">
                  FIND ACTIVITIES
                </Link>
              </div>
            ) : (
              <>
                <p className="t-mono text-paper/30 text-[10px] mb-4">
                  {completedActivities.length} SESSION{completedActivities.length !== 1 ? "S" : ""} COMPLETED
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-paper/10">
                  {completedActivities.map((a) => {
                    const others = (a.activity_participants ?? []).filter((p) => p.user_id !== profile?.id)
                    return (
                      <div key={a.id} className="bg-ink flex flex-col">
                        {/* Sport photo header */}
                        <div className="relative h-28 overflow-hidden">
                          <Image src={getSportImage(a.sports?.name)} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                          <div className="absolute inset-0 bg-ink/55" />
                          {a.sports?.name && (
                            <div className="absolute top-2 left-2">
                              <span className="t-eyebrow text-[9px] text-paper/70 bg-ink/60 px-2 py-1">{a.sports.name.toUpperCase()}</span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2">
                            <span className="t-eyebrow text-[9px] text-brand-pitch border border-brand-pitch/30 px-1.5 py-0.5 bg-ink/70 inline-flex items-center gap-0.5">
                              <Trophy className="w-2.5 h-2.5" />DONE
                            </span>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1 px-4 py-3">
                          <p className="text-sm font-semibold text-paper leading-tight mb-1">{a.title}</p>
                          <p className="t-mono text-paper/40 text-[10px]">
                            {new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {formatTime(a.time)}
                          </p>
                          <p className="t-mono text-paper/30 text-[10px] mt-0.5">{a.location}</p>
                          {others.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-paper/8">
                              <p className="t-eyebrow text-paper/40 text-[9px] mb-1.5">RATE PLAYERS</p>
                              <div className="flex flex-wrap gap-2">
                                {others.map((p) => {
                                  const rated = alreadyRated(a.id, p.user_id)
                                  return (
                                    <div key={p.user_id} className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 rounded-full bg-paper/10 border border-paper/15 overflow-hidden shrink-0">
                                        {p.profiles?.avatar_url
                                          ? <img src={p.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                          : <div className="w-full h-full flex items-center justify-center text-[7px] text-paper/50">{getInitials(p.profiles?.full_name ?? null)}</div>
                                        }
                                      </div>
                                      {rated ? (
                                        <span className="t-mono text-brand-pitch text-[10px] flex items-center gap-0.5">
                                          <CheckCircle2 className="w-3 h-3" />Rated
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => setRatingModal({ activityId: a.id, revieweeId: p.user_id, revieweeName: p.profiles?.full_name ?? "Player" })}
                                          className="t-mono text-paper/50 hover:text-brand-pitch text-[10px] flex items-center gap-0.5 transition-colors"
                                        >
                                          <Star className="w-2.5 h-2.5" />Rate {p.profiles?.full_name?.split(" ")[0] ?? "Player"}
                                        </button>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          )}

          {/* ── Badges ── */}
          {profileTab === "badges" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-paper/10">
              {[
                { title: "First Step", desc: "Join your first activity", icon: Activity, threshold: 1, current: totalJoined },
                { title: "Active Player", desc: "Complete 5 sessions", icon: Star, threshold: 5, current: completedActivities.length },
                { title: "Dedicated Athlete", desc: "Complete 10 sessions", icon: Trophy, threshold: 10, current: completedActivities.length },
                { title: "Social Butterfly", desc: "Receive 3+ reviews", icon: Users, threshold: 3, current: receivedReviews.length },
                { title: "Multi-Sport", desc: "Play 3+ sports", icon: Zap, threshold: 3, current: userSports.length },
                { title: "Top Rated", desc: "Achieve a 4.5+ average rating", icon: Star, threshold: 1, current: avgRating && Number(avgRating) >= 4.5 ? 1 : 0 },
              ].map(({ title, desc, icon: Icon, threshold, current }) => {
                const earned = current >= threshold
                const pct = Math.min(Math.round((current / threshold) * 100), 100)
                return (
                  <div key={title} className={`bg-ink flex flex-col items-center text-center p-5 transition-opacity ${!earned ? "opacity-45" : ""}`}>
                    <div className={`w-12 h-12 flex items-center justify-center mb-3 border ${earned ? "border-brand-pitch/40 bg-brand-pitch/10" : "border-paper/10 bg-paper/5"}`}>
                      <Icon className={`w-6 h-6 ${earned ? "text-brand-pitch" : "text-paper/30"}`} />
                    </div>
                    <p className="text-sm font-semibold text-paper mb-0.5">{title}</p>
                    <p className="t-mono text-paper/40 text-[10px] mb-3 leading-relaxed">{desc}</p>
                    {earned ? (
                      <span className="t-eyebrow text-[9px] text-brand-pitch border border-brand-pitch/30 px-2 py-1">EARNED</span>
                    ) : (
                      <div className="w-full space-y-1.5">
                        <div className="h-0.5 bg-paper/10 w-full">
                          <div className="h-full bg-paper/30" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="t-mono text-paper/30 text-[9px]">{Math.min(current, threshold)}/{threshold}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Reviews ── */}
          {profileTab === "reviews" && (
            <div className="bg-paper/5 border border-paper/10">
              <div className="px-4 py-3 border-b border-paper/10 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="t-eyebrow text-paper/60 text-xs">REVIEWS & RATINGS</p>
                  <p className="t-mono text-paper/30 text-[10px] mt-0.5">What other players say about you</p>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-2 bg-paper/5 border border-paper/10 px-3 py-2">
                    <StarRating value={Math.round(Number(avgRating))} size="sm" />
                    <span className="text-sm font-bold text-yellow-400">{avgRating}</span>
                    <span className="t-mono text-paper/40 text-[10px]">({receivedReviews.length})</span>
                  </div>
                )}
              </div>
              <div className="divide-y divide-paper/8">
                {receivedReviews.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Users className="w-8 h-8 text-paper/20 mx-auto mb-3" />
                    <p className="t-body text-paper/40 text-sm">No reviews yet. Complete sessions to receive ratings.</p>
                  </div>
                ) : receivedReviews.map((r) => (
                  <div key={r.id} className="flex gap-3 px-4 py-4">
                    <div className="w-9 h-9 rounded-full bg-paper/10 border border-paper/15 overflow-hidden shrink-0">
                      {r.profiles?.avatar_url
                        ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center t-mono text-paper/50 text-[10px]">{getInitials(r.profiles?.full_name ?? null)}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-paper">{r.profiles?.full_name ?? "Player"}</p>
                        <StarRating value={r.rating} size="sm" />
                      </div>
                      {r.comment && (
                        <p className="t-body text-paper/60 text-sm leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                      )}
                      <p className="t-mono text-paper/30 text-[10px] mt-1.5">
                        {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ink border border-paper/15 w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-paper/10">
              <div>
                <p className="t-eyebrow text-paper/40 text-[10px] mb-0.5">RATE PLAYER</p>
                <p className="text-sm font-semibold text-paper">{ratingModal.revieweeName}</p>
              </div>
              <button onClick={() => { setRatingModal(null); setRatingValue(5); setRatingComment("") }} className="text-paper/40 hover:text-paper transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="text-center">
                <p className="t-mono text-paper/40 text-xs mb-3">How was playing with them?</p>
                <StarRating value={ratingValue} onChange={setRatingValue} />
                <p className="t-eyebrow text-brand-pitch text-xs mt-2">
                  {["", "POOR", "FAIR", "GOOD", "GREAT", "EXCELLENT"][ratingValue]}
                </p>
              </div>
              <div>
                <label className="t-eyebrow text-paper/40 text-[10px] block mb-1.5">COMMENT (OPTIONAL)</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={2}
                  className="w-full bg-paper/8 border border-paper/15 text-paper placeholder:text-paper/30 focus:outline-none focus:border-brand-pitch px-3 py-2.5 text-sm transition-colors resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setRatingModal(null); setRatingValue(5); setRatingComment("") }} className="flex-1 t-eyebrow text-xs border border-paper/20 text-paper/50 hover:text-paper py-2.5 transition-colors">
                  CANCEL
                </button>
                <button onClick={handleSubmitReview} disabled={submittingReview} className="flex-1 t-eyebrow text-xs bg-brand-pitch text-ink hover:opacity-90 disabled:opacity-50 py-2.5 flex items-center justify-center gap-2 transition-opacity">
                  {submittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "SUBMIT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
