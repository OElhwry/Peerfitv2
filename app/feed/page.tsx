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
  Heart,
  Share2,
  Star,
  Activity,
  X,
  Loader2,
  MessageCircle,
  Send,
  ChevronUp,
  Pencil,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Lock,
  Globe,
  UserPlus,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import WeeklyCalendar from "@/components/weekly-calendar"
import AppNav from "@/components/app-nav"
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
  visibility: string
  created_at: string
  sports: { name: string; emoji: string } | null
  host: { full_name: string | null; avatar_url: string | null } | null
  activity_participants: { user_id: string; profiles: { full_name: string | null; avatar_url: string | null } | null }[]
}

type DbSport = { id: number; name: string; emoji: string }

type Message = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

type JoinRequester = {
  id: string
  user_id: string
  status: string
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

function formatPostedTime(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) {
    // Show actual clock time e.g. "17:07"
    return new Date(createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
  }
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

function getActivityEnd(date: string, time: string, durationMinutes: number): Date {
  return new Date(new Date(`${date}T${time}`).getTime() + durationMinutes * 60000)
}

function activityIsInProgress(date: string, time: string, durationMinutes: number): boolean {
  const start = new Date(`${date}T${time}`)
  const end = getActivityEnd(date, time, durationMinutes)
  const now = new Date()
  return now >= start && now < end
}

function activityIsCompleted(date: string, time: string, durationMinutes: number): boolean {
  return new Date() >= getActivityEnd(date, time, durationMinutes)
}

function getSportStyle(sportName: string | null | undefined): { bar: string; circle: string } {
  const n = sportName?.toLowerCase() ?? ""
  if (n.includes("football") || n.includes("soccer"))
    return { bar: "from-emerald-500 to-teal-400", circle: "from-emerald-500/15 to-teal-400/15 border-emerald-400/20" }
  if (n.includes("basketball"))
    return { bar: "from-orange-500 to-amber-400", circle: "from-orange-500/15 to-amber-400/15 border-orange-400/20" }
  if (n.includes("tennis") || n.includes("badminton") || n.includes("squash"))
    return { bar: "from-yellow-400 to-lime-400", circle: "from-yellow-400/15 to-lime-400/15 border-yellow-400/20" }
  if (n.includes("swim"))
    return { bar: "from-blue-500 to-cyan-400", circle: "from-blue-500/15 to-cyan-400/15 border-blue-400/20" }
  if (n.includes("run") || n.includes("athletics") || n.includes("track"))
    return { bar: "from-violet-500 to-purple-400", circle: "from-violet-500/15 to-purple-400/15 border-violet-400/20" }
  if (n.includes("cycl") || n.includes("bike"))
    return { bar: "from-teal-500 to-cyan-400", circle: "from-teal-500/15 to-cyan-400/15 border-teal-400/20" }
  if (n.includes("gym") || n.includes("fitness") || n.includes("weight") || n.includes("crossfit"))
    return { bar: "from-red-500 to-rose-400", circle: "from-red-500/15 to-rose-400/15 border-red-400/20" }
  if (n.includes("rugby") || n.includes("american football"))
    return { bar: "from-amber-600 to-orange-500", circle: "from-amber-600/15 to-orange-500/15 border-amber-400/20" }
  if (n.includes("volleyball") || n.includes("beach"))
    return { bar: "from-sky-500 to-blue-400", circle: "from-sky-500/15 to-blue-400/15 border-sky-400/20" }
  if (n.includes("hockey") || n.includes("ice"))
    return { bar: "from-indigo-500 to-blue-500", circle: "from-indigo-500/15 to-blue-500/15 border-indigo-400/20" }
  if (n.includes("cricket"))
    return { bar: "from-lime-500 to-green-500", circle: "from-lime-500/15 to-green-500/15 border-lime-400/20" }
  if (n.includes("golf"))
    return { bar: "from-green-600 to-emerald-400", circle: "from-green-600/15 to-emerald-400/15 border-green-400/20" }
  return { bar: "from-primary to-accent", circle: "from-primary/15 to-accent/15 border-primary/20" }
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
  const [selectedSpots, setSelectedSpots] = useState("Any Spots")
  const [searchQuery, setSearchQuery] = useState("")
  const activeFilterCount = [
    selectedSport !== "All Sports",
    selectedDate !== "Any Time",
    selectedSkill !== "All Levels",
    selectedSpots !== "Any Spots",
  ].filter(Boolean).length

  // UI
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({})
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set())
  const [shareToastId, setShareToastId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set())
  const [feedView, setFeedView] = useState<"all" | "friends" | "saved" | "live">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  // Friends & join requests
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<string>>(new Set()) // host user IDs I've sent friend requests to
  const [joinRequestIds, setJoinRequestIds] = useState<Set<string>>(new Set()) // activity IDs where I have a pending join request
  const [joinRequestCounts, setJoinRequestCounts] = useState<Record<string, number>>({}) // pending join req count per activity (for host)
  const [friendPrompt, setFriendPrompt] = useState<{ hostId: string; hostName: string } | null>(null)
  const [joinRequestsPanel, setJoinRequestsPanel] = useState<string | null>(null)
  const [joinRequestsList, setJoinRequestsList] = useState<Record<string, JoinRequester[]>>({})

  // Create activity modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: "", sport_id: "", description: "", location: "",
    date: "", time: "", duration_minutes: "60", max_participants: "10", skill_level: "Any",
    visibility: "public",
  })
  const [creating, setCreating] = useState(false)

  // Messaging
  const [openChatId, setOpenChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [newMessage, setNewMessage] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Edit/Delete
  const [editActivityId, setEditActivityId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: "", sport_id: "", description: "", location: "",
    date: "", time: "", duration_minutes: "60", max_participants: "10", skill_level: "Any",
    visibility: "public",
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchActivities = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]
    const { data } = await supabase
      .from("activities")
      .select(`*, sports(name,emoji), host:profiles!host_id(full_name,avatar_url), activity_participants(user_id, profiles:user_id(full_name, avatar_url))`)
      .eq("status", "open")
      .gte("date", today)
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(20)
    if (data) {
      setActivities(data as unknown as DbActivity[])
      const ids = (data as { id: string }[]).map((a) => a.id)
      if (ids.length > 0) {
        const [{ data: likesData }, { data: msgsData }, { data: jrData }] = await Promise.all([
          supabase.from("activity_likes").select("activity_id").in("activity_id", ids),
          supabase.from("activity_messages").select("activity_id").in("activity_id", ids),
          supabase.from("activity_join_requests").select("activity_id").in("activity_id", ids).eq("status", "pending"),
        ])
        if (likesData) {
          const counts: Record<string, number> = {}
          for (const l of likesData as { activity_id: string }[]) {
            counts[l.activity_id] = (counts[l.activity_id] ?? 0) + 1
          }
          setLikeCounts(counts)
        }
        if (msgsData) {
          const counts: Record<string, number> = {}
          for (const m of msgsData as { activity_id: string }[]) {
            counts[m.activity_id] = (counts[m.activity_id] ?? 0) + 1
          }
          setMessageCounts(counts)
        }
        if (jrData) {
          const counts: Record<string, number> = {}
          for (const r of jrData as { activity_id: string }[]) {
            counts[r.activity_id] = (counts[r.activity_id] ?? 0) + 1
          }
          setJoinRequestCounts(counts)
        }
      }
    }
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const [
        { data: profile },
        { data: sports },
        { data: joined },
        { data: liked },
        { data: saved },
        { data: friends },
        { data: pendingFriends },
        { data: myJoinRequests },
      ] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single(),
        supabase.from("sports").select("id, name, emoji").order("name"),
        supabase.from("activity_participants").select("activity_id").eq("user_id", user.id),
        supabase.from("activity_likes").select("activity_id").eq("user_id", user.id),
        supabase.from("activity_saves").select("activity_id").eq("user_id", user.id),
        supabase.from("friendships").select("requester_id, addressee_id").eq("status", "accepted")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
        supabase.from("friendships").select("addressee_id").eq("requester_id", user.id).eq("status", "pending"),
        supabase.from("activity_join_requests").select("activity_id").eq("user_id", user.id).eq("status", "pending"),
      ])

      if (profile) setUserProfile(profile)
      if (sports) setDbSports(sports)
      if (joined) setJoinedIds(new Set(joined.map((j: { activity_id: string }) => j.activity_id)))
      if (liked) setLikedIds(new Set(liked.map((l: { activity_id: string }) => l.activity_id)))
      if (saved) setSavedIds(new Set(saved.map((s: { activity_id: string }) => s.activity_id)))
      if (friends) {
        const ids = friends.map((f: { requester_id: string; addressee_id: string }) =>
          f.requester_id === user.id ? f.addressee_id : f.requester_id
        )
        setFriendIds(new Set(ids))
      }
      if (pendingFriends) {
        setPendingRequestIds(new Set(pendingFriends.map((f: { addressee_id: string }) => f.addressee_id)))
      }
      if (myJoinRequests) {
        setJoinRequestIds(new Set(myJoinRequests.map((r: { activity_id: string }) => r.activity_id)))
      }
      await fetchActivities()
      setLoading(false)
    }
    init()
  }, [router, supabase, fetchActivities])

  const handleJoinLeave = async (activityId: string, isPrivate: boolean, hostId: string, hostName: string) => {
    if (!userId) return
    setJoiningId(activityId)

    if (joinedIds.has(activityId)) {
      // Leave activity
      await supabase.from("activity_participants").delete().eq("activity_id", activityId).eq("user_id", userId)
      setJoinedIds((prev) => { const n = new Set(prev); n.delete(activityId); return n })
    } else if (joinRequestIds.has(activityId)) {
      // Cancel join request (private activity)
      await supabase.from("activity_join_requests").delete().eq("activity_id", activityId).eq("user_id", userId)
      setJoinRequestIds((prev) => { const n = new Set(prev); n.delete(activityId); return n })
      setJoinRequestCounts((prev) => ({ ...prev, [activityId]: Math.max((prev[activityId] ?? 1) - 1, 0) }))
    } else if (isPrivate) {
      // Request to join private activity
      await supabase.from("activity_join_requests").insert({ activity_id: activityId, user_id: userId, status: "pending" })
      setJoinRequestIds((prev) => new Set([...prev, activityId]))
      setJoinRequestCounts((prev) => ({ ...prev, [activityId]: (prev[activityId] ?? 0) + 1 }))
    } else {
      // Join public activity
      await supabase.from("activity_participants").insert({ activity_id: activityId, user_id: userId })
      setJoinedIds((prev) => new Set([...prev, activityId]))
      // Prompt friend request if not already friends or pending
      if (hostId !== userId && !friendIds.has(hostId) && !pendingRequestIds.has(hostId)) {
        setFriendPrompt({ hostId, hostName })
      }
    }

    await fetchActivities()
    setJoiningId(null)
  }

  const handleAddFriend = async (hostId: string) => {
    if (!userId) return
    await supabase.from("friendships").insert({ requester_id: userId, addressee_id: hostId, status: "pending" })
    await supabase.from("notifications").insert({ user_id: hostId, type: "friend_request", from_user_id: userId, read: false })
    setPendingRequestIds((prev) => new Set([...prev, hostId]))
    setFriendPrompt(null)
  }

  const openJoinRequestsPanel = async (activityId: string) => {
    if (joinRequestsPanel === activityId) { setJoinRequestsPanel(null); return }
    setJoinRequestsPanel(activityId)
    if (joinRequestsList[activityId]) return
    const { data } = await supabase
      .from("activity_join_requests")
      .select("id, user_id, status, profiles:user_id(full_name, avatar_url)")
      .eq("activity_id", activityId)
      .eq("status", "pending")
    if (data) setJoinRequestsList((prev) => ({ ...prev, [activityId]: data as unknown as JoinRequester[] }))
  }

  const handleManageJoinRequest = async (requestId: string, requestUserId: string, action: "accepted" | "declined", activityId: string) => {
    if (action === "accepted") {
      await supabase.from("activity_join_requests").update({ status: "accepted" }).eq("id", requestId)
      await supabase.from("activity_participants").insert({ activity_id: activityId, user_id: requestUserId })
      await fetchActivities()
    } else {
      await supabase.from("activity_join_requests").update({ status: "declined" }).eq("id", requestId)
    }
    setJoinRequestsList((prev) => ({
      ...prev,
      [activityId]: (prev[activityId] ?? []).filter((r) => r.id !== requestId),
    }))
    setJoinRequestCounts((prev) => ({ ...prev, [activityId]: Math.max((prev[activityId] ?? 1) - 1, 0) }))
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
        visibility: createForm.visibility,
      })
      .select("id")
      .single()

    if (!error && newActivity) {
      await supabase.from("activity_participants").insert({ activity_id: newActivity.id, user_id: userId })
      setJoinedIds((prev) => new Set([...prev, newActivity.id]))
      setShowCreateModal(false)
      setCreateForm({ title: "", sport_id: "", description: "", location: "", date: "", time: "", duration_minutes: "60", max_participants: "10", skill_level: "Any", visibility: "public" })
      await fetchActivities()
    }
    setCreating(false)
  }

  const openEditModal = (activity: DbActivity) => {
    setEditActivityId(activity.id)
    setEditForm({
      title: activity.title,
      sport_id: String(dbSports.find((s) => s.name === activity.sports?.name)?.id ?? ""),
      description: activity.description ?? "",
      location: activity.location,
      date: activity.date,
      time: activity.time,
      duration_minutes: String(activity.duration_minutes),
      max_participants: String(activity.max_participants),
      skill_level: activity.skill_level,
      visibility: activity.visibility ?? "public",
    })
  }

  const handleEditActivity = async () => {
    if (!editActivityId) return
    setSaving(true)
    await supabase.from("activities").update({
      title: editForm.title,
      sport_id: parseInt(editForm.sport_id),
      description: editForm.description || null,
      location: editForm.location,
      date: editForm.date,
      time: editForm.time,
      duration_minutes: parseInt(editForm.duration_minutes),
      max_participants: parseInt(editForm.max_participants),
      skill_level: editForm.skill_level,
      visibility: editForm.visibility,
    }).eq("id", editActivityId)
    setEditActivityId(null)
    await fetchActivities()
    setSaving(false)
  }

  const handleDeleteActivity = async (activityId: string) => {
    setDeleting(true)
    await supabase.from("activities").delete().eq("id", activityId)
    setDeleteConfirmId(null)
    setJoinedIds((prev) => { const n = new Set(prev); n.delete(activityId); return n })
    await fetchActivities()
    setDeleting(false)
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
      setMessageCounts((prev) => ({ ...prev, [activityId]: (prev[activityId] ?? 0) + 1 }))
      setNewMessage("")
    }
    setSendingMsg(false)
  }

  const sportFilterOptions = ["All Sports", ...dbSports.map((s) => s.name)]
  const dateOptions = ["Any Time", "Today", "Tomorrow", "This Week", "This Weekend", "Next 2 Weeks", "This Month"]
  const skillLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"]
  const spotsOptions = ["Any Spots", "Needs 1+", "Needs 3+", "Needs 5+", "Almost Full (1–2 left)"]

  const filteredActivities = activities
    .filter((a) => {
      const inProgress = activityIsInProgress(a.date, a.time, a.duration_minutes)
      const completed = activityIsCompleted(a.date, a.time, a.duration_minutes)

      // Live view: only in-progress sessions
      if (feedView === "live") return inProgress

      // All other views: hide completed sessions
      if (completed) return false

      if (feedView === "saved") return savedIds.has(a.id)
      if (feedView === "friends") {
        const hostedByFriend = friendIds.has(a.host_id)
        const hasParticipatingFriend = (a.activity_participants ?? []).some((p) => friendIds.has(p.user_id))
        if (!hostedByFriend && !hasParticipatingFriend) return false
      }
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
        const end2Weeks = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
        const endOfMonth = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
        if (selectedDate === "Today" && a.date !== today) return false
        if (selectedDate === "Tomorrow" && a.date !== tomorrow) return false
        if (selectedDate === "This Week" && (a.date < today || a.date > endOfWeek)) return false
        if (selectedDate === "Next 2 Weeks" && (a.date < today || a.date > end2Weeks)) return false
        if (selectedDate === "This Month" && (a.date < today || a.date > endOfMonth)) return false
        if (selectedDate === "This Weekend") {
          const day = new Date(a.date + "T00:00:00").getDay()
          if (day !== 0 && day !== 6) return false
        }
      }
      if (selectedSpots !== "Any Spots") {
        const spotsLeft = a.max_participants - (a.activity_participants?.length ?? 0)
        if (selectedSpots === "Needs 1+" && spotsLeft < 1) return false
        if (selectedSpots === "Needs 3+" && spotsLeft < 3) return false
        if (selectedSpots === "Needs 5+" && spotsLeft < 5) return false
        if (selectedSpots === "Almost Full (1–2 left)" && (spotsLeft < 1 || spotsLeft > 2)) return false
      }
      return true
    })
    .sort((a, b) => {
      const ta = new Date(a.created_at).getTime()
      const tb = new Date(b.created_at).getTime()
      return sortOrder === "newest" ? tb - ta : ta - tb
    })

  const handleToggleSave = async (activityId: string) => {
    if (!userId) return
    if (savedIds.has(activityId)) {
      setSavedIds((prev) => { const n = new Set(prev); n.delete(activityId); return n })
      await supabase.from("activity_saves").delete().eq("activity_id", activityId).eq("user_id", userId)
    } else {
      setSavedIds((prev) => new Set([...prev, activityId]))
      await supabase.from("activity_saves").insert({ activity_id: activityId, user_id: userId })
    }
  }

  const activeDates = [...new Set(activities.map((a) => a.date))]

  const handleToggleLike = async (activityId: string) => {
    if (!userId) return
    if (likedIds.has(activityId)) {
      setLikedIds((prev) => { const n = new Set(prev); n.delete(activityId); return n })
      setLikeCounts((prev) => ({ ...prev, [activityId]: Math.max((prev[activityId] ?? 1) - 1, 0) }))
      await supabase.from("activity_likes").delete().eq("activity_id", activityId).eq("user_id", userId)
    } else {
      setLikedIds((prev) => new Set([...prev, activityId]))
      setLikeCounts((prev) => ({ ...prev, [activityId]: (prev[activityId] ?? 0) + 1 }))
      await supabase.from("activity_likes").insert({ activity_id: activityId, user_id: userId })
    }
  }

  const handleShare = async (activity: DbActivity) => {
    const url = `${window.location.origin}/feed`
    const text = `Join me for ${activity.sports?.emoji ?? ""} ${activity.title} on ${formatDate(activity.date)} at ${formatTime(activity.time)} — ${activity.location}`
    if (navigator.share) {
      await navigator.share({ title: activity.title, text, url })
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setShareToastId(activity.id)
      setTimeout(() => setShareToastId(null), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20 md:pb-0">
      <AppNav onCreateActivity={() => setShowCreateModal(true)} />

      {/* Toolbar: search + filters + create */}
      <div className="bg-background/90 backdrop-blur-xl border-b border-border/50 sticky top-14 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 justify-center">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search by sport, location, or activity name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 text-sm transition-all"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`relative gap-2 rounded-xl text-sm shrink-0 h-10 px-4 font-medium border-border/60 ${activeFilterCount > 0 ? "border-primary text-primary bg-primary/5" : "hover:bg-muted/40"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="hidden md:flex bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md gap-2 rounded-xl text-sm shrink-0 h-10 px-5 font-semibold"
            >
              <Plus className="w-4 h-4" />Create Activity
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-border/50 bg-background/95 px-4 py-4">
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Sport</label>
                <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="w-full p-2.5 text-sm bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {sportFilterOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">When</label>
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2.5 text-sm bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {dateOptions.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Skill Level</label>
                <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full p-2.5 text-sm bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {skillLevels.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Spots Needed</label>
                <select value={selectedSpots} onChange={(e) => setSelectedSpots(e.target.value)} className="w-full p-2.5 text-sm bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {spotsOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <div className="col-span-2 sm:col-span-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedSport("All Sports"); setSelectedDate("Any Time"); setSelectedSkill("All Levels"); setSelectedSpots("Any Spots") }}
                    className="text-muted-foreground hover:text-foreground gap-1.5 text-sm">
                    <X className="w-3.5 h-3.5" />Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <WeeklyCalendar activeDates={activeDates} />

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
            {/* Feed view toggle + sort */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-2xl border border-border/40">
                {([
                  { key: "all", label: "All" },
                  { key: "friends", label: `Friends${friendIds.size > 0 ? ` (${friendIds.size})` : ""}` },
                  { key: "saved", label: `Saved${savedIds.size > 0 ? ` (${savedIds.size})` : ""}` },
                  { key: "live", label: "🔴 Live" },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFeedView(key)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      feedView === key
                        ? key === "live"
                          ? "bg-red-500 shadow-sm text-white border border-red-400/60"
                          : "bg-background shadow-sm text-foreground border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-2xl border border-border/40">
                {(["newest", "oldest"] as const).map((order) => (
                  <button
                    key={order}
                    onClick={() => setSortOrder(order)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      sortOrder === order
                        ? "bg-background shadow-sm text-foreground border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {order === "newest" ? "Newest first" : "Oldest first"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {feedView === "all" ? "Activity Feed" : feedView === "friends" ? "Friends' Activities" : feedView === "saved" ? "Saved Activities" : "Live Sessions"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {loading ? "Loading..." : `${filteredActivities.length} ${filteredActivities.length === 1 ? "activity" : "activities"}`}
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
                <h3 className="text-xl font-bold mb-2">
                  {feedView === "friends" ? "No friends' activities" : feedView === "saved" ? "No saved activities" : feedView === "live" ? "No live sessions right now" : "No activities found"}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  {feedView === "friends" ? "Add friends to see their activities here." : feedView === "saved" ? "Bookmark activities to save them here." : feedView === "live" ? "Check back when a session is underway." : "Be the first to create one!"}
                </p>
                {feedView === "all" && (
                  <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-primary to-accent gap-2">
                    <Plus className="w-4 h-4" />Create Activity
                  </Button>
                )}
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
                  const fillPct = Math.round((participantCount / activity.max_participants) * 100)
                  const sportStyle = getSportStyle(activity.sports?.name)
                  const visibleParticipants = (activity.activity_participants ?? []).slice(0, 3)
                  const extraParticipants = participantCount > 3 ? participantCount - 3 : 0
                  const isPrivate = (activity.visibility ?? "public") === "private"
                  const hasJoinRequest = joinRequestIds.has(activity.id)
                  const joinReqCount = joinRequestCounts[activity.id] ?? 0
                  const isFriend = friendIds.has(activity.host_id)
                  const isPendingFriend = pendingRequestIds.has(activity.host_id)
                  const inProgress = activityIsInProgress(activity.date, activity.time, activity.duration_minutes)

                  return (
                    <Card key={activity.id} className={`group hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm overflow-hidden ${inProgress ? "border-red-400/50 shadow-red-500/10 shadow-lg" : "border-border/50 hover:border-border/80"}`}>
                      {/* Top accent bar — pulses red when live */}
                      <div className={`h-1 bg-gradient-to-r ${inProgress ? "from-red-400 to-rose-500 animate-pulse" : sportStyle.bar}`} />
                      <CardContent className="p-5">
                        {/* Sport + host row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sportStyle.circle} flex items-center justify-center text-2xl shadow-sm shrink-0 border`}>
                              {activity.sports?.emoji ?? "🏃"}
                            </div>
                            <div>
                              <h3 className="text-base font-bold leading-tight group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                                {activity.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={activity.host?.avatar_url ?? undefined} />
                                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                    {getInitials(activity.host?.full_name ?? null)}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-xs text-muted-foreground">
                                  {activity.host_id !== userId ? (
                                    <Link href={`/profile/${activity.host_id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                                      {activity.host?.full_name ?? "Unknown"}
                                    </Link>
                                  ) : (
                                    <span className="font-medium text-foreground">You</span>
                                  )}
                                  {" · "}{formatDate(activity.date)}
                                </p>
                                {/* Friend indicator */}
                                {activity.host_id !== userId && (
                                  isFriend ? (
                                    <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20 gap-0.5">
                                      <UserCheck className="w-2.5 h-2.5" />Friends
                                    </Badge>
                                  ) : isPendingFriend ? (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground border-border/40">
                                      Pending
                                    </Badge>
                                  ) : (
                                    <button
                                      onClick={() => handleAddFriend(activity.host_id)}
                                      className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5 font-medium transition-colors"
                                    >
                                      <UserPlus className="w-2.5 h-2.5" />Add
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {inProgress && (
                                <Badge className="text-[10px] px-1.5 py-0 h-5 bg-red-500 text-white border-red-400 gap-1 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />Live
                                </Badge>
                              )}
                              <Badge className="text-xs bg-primary/10 text-primary border-primary/20 font-semibold">
                                {activity.sports?.name}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              {isPrivate && (
                                <Badge variant="outline" className="text-[10px] gap-0.5 border-border/60 text-muted-foreground h-5 px-1.5">
                                  <Lock className="w-2.5 h-2.5" />Private
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs border-border/60">
                                <Star className="w-2.5 h-2.5 mr-1 text-yellow-500 fill-yellow-500" />
                                {activity.skill_level}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              Posted {activity.created_at ? formatPostedTime(activity.created_at) : ""}
                            </span>
                          </div>
                        </div>

                        {activity.description && (
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2 pl-15">{activity.description}</p>
                        )}

                        {/* Details pills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border/40">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />{activity.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border/40">
                            <Calendar className="w-3 h-3 text-accent shrink-0" />{formatDate(activity.date)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border/40">
                            <Clock className="w-3 h-3 text-primary/70 shrink-0" />{formatTime(activity.time)} · {formatDuration(activity.duration_minutes)}
                          </span>
                        </div>

                        {/* In-progress banner */}
                        {inProgress && (
                          <div className="mb-3 flex items-center gap-2 bg-red-500/8 border border-red-400/20 rounded-xl px-3 py-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">Session in progress</p>
                            <span className="text-xs text-muted-foreground ml-auto">
                              ends {formatTime(getActivityEnd(activity.date, activity.time, activity.duration_minutes).toTimeString().slice(0, 5))}
                            </span>
                          </div>
                        )}

                        {/* Participants row + progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {visibleParticipants.map((p, i) => (
                                  <Avatar key={i} className="w-6 h-6 ring-2 ring-background">
                                    <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                                    <AvatarFallback className={`text-[9px] font-bold bg-gradient-to-br ${sportStyle.circle}`}>
                                      {getInitials(p.profiles?.full_name ?? null)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {extraParticipants > 0 && (
                                  <div className="w-6 h-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                    +{extraParticipants}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {participantCount}/{activity.max_participants} joined
                              </span>
                            </div>
                            <span className={`text-xs font-semibold ${isFull ? "text-red-500" : spotsLeft <= 2 ? "text-orange-500" : "text-muted-foreground"}`}>
                              {isFull ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
                            </span>
                          </div>
                          <div className="w-full bg-muted/40 rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all bg-gradient-to-r ${isFull ? "from-red-400 to-red-500" : spotsLeft <= 2 ? "from-orange-400 to-red-400" : sportStyle.bar}`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="sm" onClick={() => handleToggleLike(activity.id)}
                              className={`h-8 px-2.5 gap-1 text-xs rounded-lg ${likedIds.has(activity.id) ? "text-red-500 bg-red-50 dark:bg-red-950/30" : "text-muted-foreground hover:text-red-400 hover:bg-red-50/50"}`}>
                              <Heart className={`w-3.5 h-3.5 ${likedIds.has(activity.id) ? "fill-current" : ""}`} />
                              <span className="tabular-nums">{likeCounts[activity.id] ?? 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openChat(activity.id)}
                              className={`h-8 px-2.5 gap-1 text-xs rounded-lg ${chatOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}>
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="tabular-nums">{messageCounts[activity.id] ?? 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleToggleSave(activity.id)}
                              className={`h-8 px-2.5 gap-1 text-xs rounded-lg ${savedIds.has(activity.id) ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-accent hover:bg-accent/5"}`}>
                              {savedIds.has(activity.id) ? <BookmarkCheck className="w-3.5 h-3.5 fill-current" /> : <Bookmark className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleShare(activity)}
                              className={`h-8 px-2.5 gap-1 text-xs rounded-lg ${shareToastId === activity.id ? "text-green-600 bg-green-50" : "text-muted-foreground hover:text-green-500 hover:bg-green-50/50"}`}>
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{shareToastId === activity.id ? "Copied!" : ""}</span>
                            </Button>
                          </div>

                          {isHost ? (
                            <div className="flex items-center gap-1">
                              {isPrivate && joinReqCount > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openJoinRequestsPanel(activity.id)}
                                  className={`h-8 px-2.5 text-xs rounded-lg gap-1 border-orange-400/50 ${joinRequestsPanel === activity.id ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30" : "text-orange-600 hover:bg-orange-50/50"}`}
                                >
                                  <Users className="w-3 h-3" />
                                  {joinReqCount} request{joinReqCount !== 1 ? "s" : ""}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(activity)}
                                className="h-8 px-2.5 gap-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                              >
                                <Pencil className="w-3.5 h-3.5" />Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmId(activity.id)}
                                className="h-8 px-2.5 gap-1 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleJoinLeave(activity.id, isPrivate, activity.host_id, activity.host?.full_name ?? "Host")}
                              disabled={isLoading || (isFull && !isJoined && !hasJoinRequest)}
                              size="sm"
                              className={`h-8 px-4 text-xs rounded-xl font-semibold ${
                                isJoined
                                  ? "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 border border-border"
                                  : hasJoinRequest
                                  ? "bg-muted text-muted-foreground border border-border hover:bg-red-50/60 hover:text-red-500"
                                  : isPrivate
                                  ? "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-md text-white"
                                  : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md text-white"
                              }`}
                            >
                              {isLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isJoined ? (
                                "✓ Joined"
                              ) : hasJoinRequest ? (
                                "Requested"
                              ) : isPrivate ? (
                                <span className="flex items-center gap-1"><Lock className="w-3 h-3" />Request</span>
                              ) : isFull ? (
                                "Full"
                              ) : (
                                "Join"
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Join requests panel (host only, private activities) */}
                        {isHost && joinRequestsPanel === activity.id && (
                          <div className="mt-4 border-t border-border/50 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                Join Requests
                              </p>
                              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setJoinRequestsPanel(null)}>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            {(joinRequestsList[activity.id] ?? []).length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-3">No pending requests</p>
                            ) : (
                              <div className="space-y-2">
                                {(joinRequestsList[activity.id] ?? []).map((req) => (
                                  <div key={req.id} className="flex items-center gap-2.5 py-1">
                                    <Link href={`/profile/${req.user_id}`}>
                                      <Avatar className="w-8 h-8 hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer">
                                        <AvatarImage src={req.profiles?.avatar_url ?? undefined} />
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                          {getInitials(req.profiles?.full_name ?? null)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </Link>
                                    <Link href={`/profile/${req.user_id}`} className="flex-1 text-sm font-medium hover:text-primary transition-colors">
                                      {req.profiles?.full_name ?? "User"}
                                    </Link>
                                    <Button
                                      size="sm"
                                      className="h-7 px-3 text-xs bg-gradient-to-r from-primary to-accent text-white"
                                      onClick={() => handleManageJoinRequest(req.id, req.user_id, "accepted", activity.id)}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-3 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
                                      onClick={() => handleManageJoinRequest(req.id, req.user_id, "declined", activity.id)}
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Chat panel */}
                        {chatOpen && (() => {
                          const isExpanded = expandedChats.has(activity.id)
                          const visibleMessages = isExpanded ? activityMessages : activityMessages.slice(-2)
                          const hiddenCount = activityMessages.length - 2
                          return (
                            <div className="mt-4 border-t border-border/50 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold">Activity Chat</p>
                                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setOpenChatId(null)}>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                              <div className="space-y-2 max-h-56 overflow-y-auto mb-3">
                                {loadingMessages ? (
                                  <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                  </div>
                                ) : activityMessages.length === 0 ? (
                                  <p className="text-xs text-muted-foreground text-center py-4">No messages yet. Start the conversation!</p>
                                ) : (
                                  <>
                                    {!isExpanded && hiddenCount > 0 && (
                                      <button
                                        onClick={() => setExpandedChats((prev) => new Set([...prev, activity.id]))}
                                        className="w-full text-xs text-primary hover:underline py-1 text-center"
                                      >
                                        View {hiddenCount} earlier {hiddenCount === 1 ? "message" : "messages"}
                                      </button>
                                    )}
                                    {visibleMessages.map((msg) => (
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
                                    ))}
                                  </>
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
                          )
                        })()}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Friend request prompt modal */}
      {friendPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-background border-border shadow-2xl">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Connect with {friendPrompt.hostName}?</h3>
                <p className="text-sm text-muted-foreground mt-1">You just joined their activity — send a friend request to stay connected!</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setFriendPrompt(null)}>Maybe later</Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white gap-1.5"
                  onClick={() => handleAddFriend(friendPrompt.hostId)}
                >
                  <UserPlus className="w-4 h-4" />Add Friend
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Activity Modal */}
      {editActivityId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-background border-border shadow-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Edit Activity</CardTitle>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setEditActivityId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-3 max-h-[72vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs font-medium">Title</Label>
                  <Input placeholder="e.g. 5-a-side Football" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Sport</Label>
                  <select value={editForm.sport_id} onChange={(e) => setEditForm((f) => ({ ...f, sport_id: e.target.value }))} className="w-full mt-1 p-2 h-9 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select sport</option>
                    {dbSports.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Skill Level</Label>
                  <select value={editForm.skill_level} onChange={(e) => setEditForm((f) => ({ ...f, skill_level: e.target.value }))} className="w-full mt-1 p-2 h-9 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {["Any", "Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-medium">Location</Label>
                  <Input placeholder="e.g. Hyde Park, London" value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Date</Label>
                  <Input type="date" value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Time</Label>
                  <Input type="time" value={editForm.time} onChange={(e) => setEditForm((f) => ({ ...f, time: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Duration (min)</Label>
                  <Input type="number" min="15" step="15" value={editForm.duration_minutes} onChange={(e) => setEditForm((f) => ({ ...f, duration_minutes: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Max Players</Label>
                  <Input type="number" min="2" max="100" value={editForm.max_participants} onChange={(e) => setEditForm((f) => ({ ...f, max_participants: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-medium">Description (optional)</Label>
                  <textarea placeholder="What should players expect?" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full mt-1 p-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-medium mb-1.5 block">Visibility</Label>
                  <div className="flex gap-2">
                    {(["public", "private"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEditForm((f) => ({ ...f, visibility: v }))}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                          editForm.visibility === v
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {v === "public" ? <><Globe className="w-3.5 h-3.5" />Public</> : <><Lock className="w-3.5 h-3.5" />Private</>}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {editForm.visibility === "private" ? "People must request to join — you approve each one." : "Anyone can join instantly."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 text-sm h-9" onClick={() => setEditActivityId(null)}>Cancel</Button>
                <Button
                  className="flex-1 text-sm h-9 bg-gradient-to-r from-primary to-accent"
                  disabled={saving || !editForm.title || !editForm.sport_id || !editForm.location || !editForm.date || !editForm.time}
                  onClick={handleEditActivity}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-background border-border shadow-2xl">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Activity?</h3>
                <p className="text-sm text-muted-foreground mt-1">This will remove the activity and all participants. This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting}
                  onClick={() => handleDeleteActivity(deleteConfirmId)}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                <div className="col-span-2">
                  <Label className="text-xs font-medium mb-1.5 block">Visibility</Label>
                  <div className="flex gap-2">
                    {(["public", "private"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCreateForm((f) => ({ ...f, visibility: v }))}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                          createForm.visibility === v
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {v === "public" ? <><Globe className="w-3.5 h-3.5" />Public</> : <><Lock className="w-3.5 h-3.5" />Private</>}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {createForm.visibility === "private" ? "People must request to join — you approve each one." : "Anyone can join instantly."}
                  </p>
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
}
