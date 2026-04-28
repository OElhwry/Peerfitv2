  "use client"

  import AppNav from "@/components/app-nav"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import WeeklyCalendar from "@/components/weekly-calendar"
  import { createClient } from "@/lib/supabase/client"
  import {
    Activity,
    ArrowRight,
    Bookmark,
    BookmarkCheck,
    Calendar,
    Camera,
    ChevronUp,
    Clock,
    Globe,
    Heart,
    Loader2,
    Lock,
    MapPin,
    MessageCircle,
    Pencil,
    Plus,
    Search,
    Send,
    Share2,
    SlidersHorizontal,
    Trash2,
    UserCheck,
    UserPlus,
    Users,
    X
  } from "lucide-react"
  import Link from "next/link"
  import { useRouter } from "next/navigation"
  import { useCallback, useEffect, useState } from "react"

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

  type SportStyle = { image: string; position?: string }

  function getSportStyle(sportName: string | null | undefined): SportStyle {
    const n = sportName?.toLowerCase() ?? ""
    if (n.includes("football") || n.includes("soccer"))     return { image: "/images/sports/football.jpg" }
    if (n.includes("basketball"))                           return { image: "/images/sports/basketball.jpg" }
    if (n.includes("badminton"))                            return { image: "/images/sports/badminton.jpg" }
    if (n.includes("tennis") || n.includes("squash"))       return { image: "/images/sports/tennis.jpg", position: "center 62%" }
    if (n.includes("swim"))                                 return { image: "/images/sports/swimming.jpg" }
    if (n.includes("run") || n.includes("athletics") || n.includes("track")) return { image: "/images/sports/running.jpg" }
    if (n.includes("cycl") || n.includes("bike"))           return { image: "/images/sports/cycling.jpg" }
    if (n.includes("yoga"))                                 return { image: "/images/sports/yoga.jpg" }
    if (n.includes("gym") || n.includes("fitness") || n.includes("weight") || n.includes("crossfit")) return { image: "/images/sports/gym.jpg", position: "center 38%" }
    if (n.includes("rugby") || n.includes("american football")) return { image: "/images/sports/rugby.jpg", position: "center 72%" }
    if (n.includes("volleyball") || n.includes("beach"))    return { image: "/images/sports/volleyball.jpg" }
    if (n.includes("hockey") || n.includes("ice"))          return { image: "/images/sports/hockey.jpg" }
    if (n.includes("cricket"))                              return { image: "/images/sports/cricket.jpg", position: "center 69%" }
    if (n.includes("golf"))                                 return { image: "/images/sports/golf.jpg", position: "center 60%" }
    if (n.includes("padel") || n.includes("pickleball"))    return { image: "/images/sports/padel.jpg" }
    if (n.includes("box") || n.includes("muay") || n.includes("mma") || n.includes("martial")) return { image: "/images/sports/boxing.jpg" }
    return { image: "/images/sports/sport.jpg" }
  }

  export default function ActivityFeedPage() {
    const router = useRouter()
    const supabase = createClient()

    const [activities, setActivities] = useState<DbActivity[]>([])
    const [dbSports, setDbSports] = useState<DbSport[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<{ full_name: string | null; location: string | null; avatar_url: string | null } | null>(null)
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
          supabase.from("profiles").select("full_name, location, avatar_url").eq("id", user.id).single(),
          supabase.from("sports").select("id, name, emoji").order("name"),
          supabase.from("activity_participants").select("activity_id").eq("user_id", user.id),
          supabase.from("activity_likes").select("activity_id").eq("user_id", user.id),
          supabase.from("activity_saves").select("activity_id").eq("user_id", user.id),
          supabase.from("friendships").select("requester_id, addressee_id").eq("status", "accepted")
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
          supabase.from("friendships").select("addressee_id").eq("requester_id", user.id).eq("status", "pending"),
          supabase.from("activity_join_requests").select("activity_id, id, status").eq("user_id", user.id).in("status", ["pending", "accepted"]),
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
          const pending = myJoinRequests.filter((r: { status: string }) => r.status === "pending")
          const accepted = myJoinRequests.filter((r: { status: string }) => r.status === "accepted")
          setJoinRequestIds(new Set(pending.map((r: { activity_id: string }) => r.activity_id)))

          // Self-insert into activities where the host has accepted our join request
          if (accepted.length > 0) {
            const alreadyJoinedIds = new Set(joined?.map((j: { activity_id: string }) => j.activity_id) ?? [])
            const toJoin = accepted.filter((r: { activity_id: string }) => !alreadyJoinedIds.has(r.activity_id))
            for (const req of toJoin as { activity_id: string; id: string }[]) {
              await supabase.from("activity_participants").insert({ activity_id: req.activity_id, user_id: user.id })
              await supabase.from("activity_join_requests").update({ status: "joined" }).eq("id", req.id)
            }
            if (toJoin.length > 0) {
              const newJoinedIds = new Set([
                ...(joined?.map((j: { activity_id: string }) => j.activity_id) ?? []),
                ...toJoin.map((r: { activity_id: string }) => r.activity_id),
              ])
              setJoinedIds(newJoinedIds)
            }
          }
        }
        await fetchActivities()
        setLoading(false)
      }
      init()
    }, [router, supabase, fetchActivities])

    const handleJoinLeave = async (activityId: string, isPrivate: boolean, hostId: string, hostName: string) => {
      if (!userId) return
      const isApplying = !joinedIds.has(activityId) && !joinRequestIds.has(activityId)
      if (isApplying && !profileReadyForApplications) {
        router.push("/profile")
        return
      }
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
      if (joinRequestsList[activityId] !== undefined) return
      // Two-step fetch to avoid FK join issues (user_id → auth.users, not public.profiles)
      const { data: requestsData } = await supabase
        .from("activity_join_requests")
        .select("id, user_id, status")
        .eq("activity_id", activityId)
        .eq("status", "pending")
      if (!requestsData || requestsData.length === 0) {
        setJoinRequestsList((prev) => ({ ...prev, [activityId]: [] }))
        return
      }
      const userIds = requestsData.map((r: { user_id: string }) => r.user_id)
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds)
      const pm: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
      for (const p of (profilesData ?? []) as { id: string; full_name: string | null; avatar_url: string | null }[]) {
        pm[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
      }
      setJoinRequestsList((prev) => ({
        ...prev,
        [activityId]: requestsData.map((r: { id: string; user_id: string; status: string }) => ({
          ...r,
          profiles: pm[r.user_id] ?? null,
        })),
      }))
    }

    const handleManageJoinRequest = async (requestId: string, requestUserId: string, action: "accepted" | "declined", activityId: string) => {
      if (action === "accepted") {
        // Mark as accepted — the requester's session will self-insert on next load (RLS only allows uid=user_id inserts)
        await supabase.from("activity_join_requests").update({ status: "accepted" }).eq("id", requestId)
        // Also notify the requester so they know they've been accepted
        if (userId) {
          await supabase.from("notifications").insert({
            user_id: requestUserId, type: "join_accepted", from_user_id: userId, read: false,
          })
        }
      } else {
        await supabase.from("activity_join_requests").update({ status: "declined" }).eq("id", requestId)
      }
      setJoinRequestsList((prev) => ({
        ...prev,
        [activityId]: (prev[activityId] ?? []).filter((r) => r.id !== requestId),
      }))
      setJoinRequestCounts((prev) => ({ ...prev, [activityId]: Math.max((prev[activityId] ?? 1) - 1, 0) }))
      await fetchActivities()
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
        const ta = new Date(`${a.date}T${a.time}`).getTime()
        const tb = new Date(`${b.date}T${b.time}`).getTime()
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
    const profileNeedsCompletion = !userProfile?.full_name || userProfile.full_name === "Your Name" || !userProfile?.location || !userProfile?.avatar_url
    const profileReadyForApplications = !!userProfile?.full_name && userProfile.full_name !== "Your Name" && !!userProfile?.location

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
      const url = `${window.location.origin}/feed?activity=${activity.id}`
      const text = `Join me for ${activity.sports?.emoji ?? ""} ${activity.title} on ${formatDate(activity.date)} at ${formatTime(activity.time)} — ${activity.location}`
      if (navigator.share) {
        await navigator.share({ title: activity.title, text, url })
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setShareToastId(activity.id)
        setTimeout(() => setShareToastId(null), 2000)
      }
    }

    const filterSelectCls = "w-full h-10 px-3 t-body bg-paper/5 border border-paper/15 text-paper focus:outline-none focus:border-brand-pitch transition-colors"

    return (
      <div className="min-h-screen bg-ink pb-20 md:pb-0">
        <AppNav onCreateActivity={ () => setShowCreateModal(true) } />

        {/* Toolbar: search + filters + create */ }
        <div className="bg-ink/95 backdrop-blur-xl border-b border-paper/8 sticky top-14 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex items-center gap-2 sm:gap-3 justify-center">
              <div className="relative flex-1 max-w-xl min-w-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper/30 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={ searchQuery }
                  onChange={ (e) => setSearchQuery(e.target.value) }
                  className="w-full h-10 pl-10 pr-4 bg-paper/5 border border-paper/15 text-paper placeholder:text-paper/30 t-body focus:outline-none focus:border-brand-pitch transition-colors"
                />
              </div>
              <button
                onClick={ () => setShowFilters(!showFilters) }
                className={ `relative h-10 px-3 sm:px-4 flex items-center gap-2 t-mono transition-colors shrink-0 border ${activeFilterCount > 0 ? "border-brand-pitch text-brand-pitch bg-brand-pitch/5" : "border-paper/15 text-paper/70 bg-paper/5 hover:text-paper hover:border-paper/30"}` }
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">FILTERS</span>
                { activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-pitch text-paper text-[10px] flex items-center justify-center font-bold">
                    { activeFilterCount }
                  </span>
                ) }
              </button>
              <button
                onClick={ () => setShowCreateModal(true) }
                className="hidden md:flex h-10 px-5 items-center gap-2 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono-lg transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />CREATE ACTIVITY
              </button>
            </div>
          </div>

          { showFilters && (
            <div className="border-t border-paper/8 bg-ink/98 px-3 sm:px-4 py-3 sm:py-4">
              <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 items-end">
                <div>
                  <label className="t-eyebrow text-paper/40 mb-1.5 block">Sport</label>
                  <select value={ selectedSport } onChange={ (e) => setSelectedSport(e.target.value) } className={ filterSelectCls }>
                    { sportFilterOptions.map((s) => <option key={ s } className="bg-stone-900 text-paper">{ s }</option>) }
                  </select>
                </div>
                <div>
                  <label className="t-eyebrow text-paper/40 mb-1.5 block">When</label>
                  <select value={ selectedDate } onChange={ (e) => setSelectedDate(e.target.value) } className={ filterSelectCls }>
                    { dateOptions.map((d) => <option key={ d } className="bg-stone-900 text-paper">{ d }</option>) }
                  </select>
                </div>
                <div>
                  <label className="t-eyebrow text-paper/40 mb-1.5 block">Skill Level</label>
                  <select value={ selectedSkill } onChange={ (e) => setSelectedSkill(e.target.value) } className={ filterSelectCls }>
                    { skillLevels.map((l) => <option key={ l } className="bg-stone-900 text-paper">{ l }</option>) }
                  </select>
                </div>
                <div>
                  <label className="t-eyebrow text-paper/40 mb-1.5 block">Spots Needed</label>
                  <select value={ selectedSpots } onChange={ (e) => setSelectedSpots(e.target.value) } className={ filterSelectCls }>
                    { spotsOptions.map((s) => <option key={ s } className="bg-stone-900 text-paper">{ s }</option>) }
                  </select>
                </div>
                { activeFilterCount > 0 && (
                  <div className="col-span-2 sm:col-span-4 flex justify-end">
                    <button onClick={ () => { setSelectedSport("All Sports"); setSelectedDate("Any Time"); setSelectedSkill("All Levels"); setSelectedSpots("Any Spots") } }
                      className="t-eyebrow text-paper/40 hover:text-paper transition-colors flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" />CLEAR ALL
                    </button>
                  </div>
                ) }
              </div>
            </div>
          ) }
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          { profileNeedsCompletion && (
            <Link
              href="/profile"
              className="mb-6 group block overflow-hidden border border-brand-pitch/25 bg-brand-pitch/5 hover:bg-brand-pitch/10 transition-colors"
            >
              <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 t-eyebrow text-brand-pitch">
                    <Camera className="h-3.5 w-3.5" />
                    PROFILE BOOST
                  </div>
                  <h2 className="t-display-sm text-paper">
                    Complete your profile so people know who they&apos;re playing with.
                  </h2>
                  <p className="mt-2 max-w-2xl t-body text-paper/55">
                    Add your full name, location, and a profile photo to make your account feel real and help other players trust your requests faster.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 self-start border border-paper/15 bg-paper/5 px-4 h-10 t-mono text-paper/80 group-hover:text-paper group-hover:border-paper/30 transition-colors">
                  <span>GO TO PROFILE</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ) }

          <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sidebar */ }
            <div className="lg:col-span-1 space-y-4">
              <WeeklyCalendar activeDates={ activeDates } />

              <div className="bg-paper/5 border border-paper/10">
                <p className="t-eyebrow text-paper/40 px-4 pt-4">YOUR ACTIVITY</p>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="t-body text-paper/55">Joined</span>
                    <span className="t-display-sm text-brand-pitch leading-none">{ joinedIds.size }</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="t-body text-paper/55">Open nearby</span>
                    <span className="t-display-sm text-paper leading-none">{ activities.length }</span>
                  </div>
                </div>
                <div className="h-px w-full bg-paper/10" />
                <div className="px-4 py-3">
                  <div className="w-full bg-paper/10 h-1">
                    <div className="bg-brand-pitch h-1 transition-all" style={ { width: `${Math.min((joinedIds.size / 5) * 100, 100)}%` } } />
                  </div>
                  <p className="t-meta text-paper/30 mt-2">{ joinedIds.size } / 5 toward weekly streak</p>
                </div>
              </div>
            </div>

            {/* Main feed */ }
            <div className="lg:col-span-3">
              {/* Feed view tabs + sort */ }
              <div className="flex items-center gap-6 mb-5 flex-wrap border-b border-paper/10">
                { ([
                  { key: "all", label: "ALL" },
                  { key: "friends", label: `FRIENDS${friendIds.size > 0 ? ` (${friendIds.size})` : ""}` },
                  { key: "saved", label: `SAVED${savedIds.size > 0 ? ` (${savedIds.size})` : ""}` },
                  { key: "live", label: "LIVE" },
                ] as const).map(({ key, label }) => (
                  <button
                    key={ key }
                    onClick={ () => setFeedView(key) }
                    className={ `pb-2.5 t-eyebrow border-b-2 -mb-px transition-colors ${feedView === key
                        ? key === "live"
                          ? "text-red-400 border-red-400 flex items-center gap-1.5 [&_span]:w-1.5 [&_span]:h-1.5 [&_span]:bg-red-400 [&_span]:animate-pulse"
                          : "text-paper border-brand-pitch"
                        : "text-paper/30 border-transparent hover:text-paper/60"
                      }` }
                  >
                    { key === "live" && <span /> }{ label }
                  </button>
                )) }
                <div className="ml-auto pb-2.5 flex items-center gap-3">
                  { (["newest", "oldest"] as const).map((order) => (
                    <button
                      key={ order }
                      onClick={ () => setSortOrder(order) }
                      className={ `t-eyebrow transition-colors ${sortOrder === order ? "text-paper" : "text-paper/30 hover:text-paper/60"}` }
                    >
                      { order === "newest" ? "NEWEST" : "OLDEST" }
                    </button>
                  )) }
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="min-w-0">
                  <h1 className="t-display-md text-paper truncate">
                    { feedView === "all" ? "Activity Feed" : feedView === "friends" ? "Friends' Activities" : feedView === "saved" ? "Saved" : "Live now" }
                  </h1>
                  <p className="t-mono text-paper/40 mt-1">
                    { loading ? "LOADING…" : `${filteredActivities.length} ${filteredActivities.length === 1 ? "ACTIVITY" : "ACTIVITIES"}` }
                  </p>
                </div>
                <button onClick={ () => setShowCreateModal(true) }
                  className="md:hidden shrink-0 h-10 px-4 flex items-center gap-1.5 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono transition-colors">
                  <Plus className="w-4 h-4" />CREATE
                </button>
              </div>

              { loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 text-brand-pitch animate-spin" />
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-20 border border-paper/8 bg-paper/3">
                  <div className="w-16 h-16 mx-auto mb-5 border border-brand-pitch/30 bg-brand-pitch/10 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-brand-pitch" />
                  </div>
                  <h3 className="t-display-sm text-paper mb-2">
                    { feedView === "friends" ? "No friends' activities" : feedView === "saved" ? "Nothing saved yet" : feedView === "live" ? "Nothing live right now" : "No activities found" }
                  </h3>
                  <p className="t-body text-paper/50 mb-6 max-w-sm mx-auto">
                    { feedView === "friends" ? "Add friends to see their activities here." : feedView === "saved" ? "Bookmark activities to save them here." : feedView === "live" ? "Check back when a session is underway." : "Be the first to create one." }
                  </p>
                  { feedView === "all" && (
                    <button onClick={ () => setShowCreateModal(true) }
                      className="inline-flex h-10 px-5 items-center gap-2 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono-lg transition-colors">
                      <Plus className="w-4 h-4" />CREATE ACTIVITY
                    </button>
                  ) }
                </div>
              ) : (
                <div className="space-y-4">
                  { filteredActivities.map((activity) => {
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
                      <article key={ activity.id } className={ `group relative overflow-hidden bg-paper/3 transition-colors ${inProgress ? "border border-red-400/40" : "border border-paper/10 hover:border-paper/20"}` }>
                          {/* LIVE accent bar (left edge) */ }
                          { inProgress && (
                            <span className="absolute top-0 left-0 bottom-0 w-0.5 bg-red-400 z-10" />
                          ) }

                          {/* ── HERO HEADER ── */ }
                          <div
                            className="relative px-5 pt-4 pb-14 overflow-hidden"
                            style={ {
                              backgroundImage: `url(${inProgress ? "/images/sports/sport.jpg" : sportStyle.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: inProgress ? "center" : (sportStyle.position ?? "center"),
                              minHeight: "150px",
                            } }
                          >
                            {/* Ink overlay for text legibility */ }
                            <div className="absolute inset-0 bg-ink/55" />
                            {/* Bottom vignette */ }
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                            {/* Live tint */ }
                            { inProgress && <div className="absolute inset-0 bg-red-900/25" /> }
                            {/* Editorial watermark — sport name in Anton, bleeds off right */ }
                            <span
                              className="absolute right-3 -bottom-1 text-paper/[0.12] leading-none select-none pointer-events-none uppercase whitespace-nowrap"
                              style={ {
                                fontFamily: "var(--font-anton), system-ui, sans-serif",
                                fontWeight: 400,
                                fontSize: "clamp(56px, 9vw, 112px)",
                                letterSpacing: "0.02em",
                              } }
                            >
                              { activity.sports?.name ?? "" }
                            </span>

                            {/* Top row: sport label + status chips */ }
                            <div className="relative flex items-center justify-between mb-3">
                              <span className="t-eyebrow text-brand-pitch tracking-[0.22em]">
                                { activity.sports?.name ?? "ACTIVITY" }
                              </span>
                              <div className="flex items-center gap-1.5">
                                { inProgress && (
                                  <span className="flex items-center gap-1.5 t-eyebrow text-paper bg-red-500/90 px-2 py-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 bg-paper inline-block" />LIVE
                                  </span>
                                ) }
                                { isPrivate && (
                                  <span className="flex items-center gap-1 t-eyebrow text-paper/80 bg-paper/10 border border-paper/20 px-2 py-1">
                                    <Lock className="w-2.5 h-2.5" />PRIVATE
                                  </span>
                                ) }
                                <span className="t-eyebrow text-paper/70 bg-paper/10 border border-paper/15 px-2 py-1">
                                  { activity.skill_level?.toUpperCase() }
                                </span>
                              </div>
                            </div>

                            {/* Title */ }
                            <h3 className="relative text-paper font-bold text-lg sm:text-xl leading-tight tracking-tight">
                              { activity.title }
                            </h3>

                            {/* Time + location row */ }
                            <div className="relative flex items-center gap-x-4 gap-y-1 mt-2.5 flex-wrap">
                              <span className="flex items-center gap-1.5 t-mono text-paper/75 text-[11px]">
                                <Calendar className="w-3 h-3" />{ formatDate(activity.date).toUpperCase() }
                              </span>
                              <span className="flex items-center gap-1.5 t-mono text-paper/75 text-[11px]">
                                <Clock className="w-3 h-3" />{ formatTime(activity.time) } · { formatDuration(activity.duration_minutes) }
                              </span>
                              <span className="flex items-center gap-1.5 t-mono text-paper/75 text-[11px]">
                                <MapPin className="w-3 h-3" />{ activity.location }
                              </span>
                              { inProgress && (
                                <span className="t-mono text-paper text-[11px] font-bold">
                                  ENDS { formatTime(getActivityEnd(activity.date, activity.time, activity.duration_minutes).toTimeString().slice(0, 5)) }
                                </span>
                              ) }
                            </div>
                          </div>

                          {/* ── BODY ── pulled up to overlap hero */ }
                          <div className="relative -mt-6 mx-3 bg-ink border border-paper/12 px-4 pt-3.5 pb-3.5">

                            {/* Host row */ }
                            <div className="flex items-center gap-2.5 mb-3">
                              <Avatar className="w-8 h-8 ring-1 ring-paper/15 shrink-0">
                                <AvatarImage src={ activity.host?.avatar_url ?? undefined } />
                                <AvatarFallback className="text-[10px] bg-brand-pitch/15 text-brand-pitch font-bold">{ getInitials(activity.host?.full_name ?? null) }</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  { activity.host_id !== userId ? (
                                    <Link href={ `/profile/${activity.host_id}` } className="t-body text-paper hover:text-brand-pitch transition-colors truncate">
                                      { activity.host?.full_name ?? "Unknown" }
                                    </Link>
                                  ) : <span className="t-body text-paper">You</span> }
                                  { activity.host_id !== userId && (
                                    isFriend ? (
                                      <span className="t-eyebrow text-brand-pitch border border-brand-pitch/30 bg-brand-pitch/10 px-1.5 py-0.5 flex items-center gap-1">
                                        <UserCheck className="w-2.5 h-2.5" />FRIENDS
                                      </span>
                                    ) : isPendingFriend ? (
                                      <span className="t-eyebrow text-paper/40 border border-paper/15 bg-paper/5 px-1.5 py-0.5">PENDING</span>
                                    ) : (
                                      <button onClick={ () => handleAddFriend(activity.host_id) }
                                        className="t-eyebrow text-brand-pitch hover:text-brand-pitch-hover flex items-center gap-1 transition-colors">
                                        <UserPlus className="w-2.5 h-2.5" />ADD FRIEND
                                      </button>
                                    )
                                  ) }
                                </div>
                              </div>
                              {/* Host controls / join button */ }
                              { isHost ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  { isPrivate && joinReqCount > 0 && (
                                    <button
                                      onClick={ () => openJoinRequestsPanel(activity.id) }
                                      className={ `h-8 px-2.5 t-eyebrow flex items-center gap-1.5 border transition-colors ${joinRequestsPanel === activity.id ? "border-brand-pitch bg-brand-pitch/10 text-brand-pitch" : "border-brand-pitch/40 text-brand-pitch hover:bg-brand-pitch/5"}` }>
                                      <Users className="w-3 h-3" />{ joinReqCount }
                                    </button>
                                  ) }
                                  <button onClick={ () => openEditModal(activity) }
                                    className="h-8 w-8 flex items-center justify-center text-paper/40 hover:text-paper hover:bg-paper/5 transition-colors">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={ () => setDeleteConfirmId(activity.id) }
                                    className="h-8 w-8 flex items-center justify-center text-paper/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={ () => handleJoinLeave(activity.id, isPrivate, activity.host_id, activity.host?.full_name ?? "Host") }
                                  disabled={ isLoading || (isFull && !isJoined && !hasJoinRequest) }
                                  className={ `h-8 px-4 t-mono shrink-0 transition-colors flex items-center gap-1.5 ${isJoined
                                      ? "border border-brand-pitch text-brand-pitch bg-brand-pitch/5 hover:border-red-400 hover:text-red-400 hover:bg-red-500/5"
                                      : hasJoinRequest
                                        ? "border border-paper/15 text-paper/40 cursor-default"
                                        : isFull
                                          ? "border border-paper/10 text-paper/30 cursor-not-allowed"
                                          : "bg-brand-pitch hover:bg-brand-pitch-hover text-paper"
                                    }` }
                                >
                                  { isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : isJoined ? "✓ JOINED"
                                      : hasJoinRequest ? "REQUESTED"
                                        : isPrivate ? <><Lock className="w-3 h-3" />REQUEST</>
                                          : isFull ? "FULL"
                                            : "JOIN" }
                                </button>
                              ) }
                            </div>

                            { activity.description && (
                              <p className="t-body text-paper/55 mb-3 leading-relaxed line-clamp-1 italic">{ activity.description }</p>
                            ) }

                            {/* Participants + fill bar */ }
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex -space-x-2 shrink-0">
                                { visibleParticipants.map((p, i) => (
                                  <Avatar key={ i } className="w-6 h-6 ring-2 ring-ink">
                                    <AvatarImage src={ p.profiles?.avatar_url ?? undefined } />
                                    <AvatarFallback className="text-[9px] font-bold bg-paper/10 text-paper/70">{ getInitials(p.profiles?.full_name ?? null) }</AvatarFallback>
                                  </Avatar>
                                )) }
                                { extraParticipants > 0 && (
                                  <div className="w-6 h-6 rounded-full ring-2 ring-ink bg-paper/10 flex items-center justify-center text-[9px] font-bold text-paper/55">+{ extraParticipants }</div>
                                ) }
                              </div>
                              <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                  <span className="t-mono text-paper/55 text-[11px]">{ participantCount } JOINED</span>
                                  <span className={ `t-mono text-[11px] font-bold ${isFull ? "text-red-400" : spotsLeft <= 2 ? "text-amber-400" : "text-brand-pitch"}` }>
                                    { isFull ? "FULL" : `${spotsLeft} ${spotsLeft !== 1 ? "SPOTS" : "SPOT"} LEFT` }
                                  </span>
                                </div>
                                <div className="h-1 bg-paper/8 overflow-hidden">
                                  <div
                                    className={ `h-full transition-all ${isFull ? "bg-red-400" : spotsLeft <= 2 ? "bg-amber-400" : "bg-brand-pitch"}` }
                                    style={ { width: `${fillPct}%` } }
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Social actions */ }
                            <div className="flex items-center gap-0.5 pt-2.5 border-t border-paper/10">
                              <button onClick={ () => handleToggleLike(activity.id) }
                                className={ `flex items-center gap-1.5 px-2.5 py-1.5 t-mono text-xs transition-colors ${likedIds.has(activity.id) ? "text-red-400" : "text-paper/40 hover:text-red-400"}` }>
                                <Heart className={ `w-3.5 h-3.5 ${likedIds.has(activity.id) ? "fill-current" : ""}` } />
                                <span className="tabular-nums">{ likeCounts[activity.id] ?? 0 }</span>
                              </button>
                              <button onClick={ () => openChat(activity.id) }
                                className={ `flex items-center gap-1.5 px-2.5 py-1.5 t-mono text-xs transition-colors ${chatOpen ? "text-brand-pitch" : "text-paper/40 hover:text-brand-pitch"}` }>
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="tabular-nums">{ messageCounts[activity.id] ?? 0 }</span>
                              </button>
                              <button onClick={ () => handleToggleSave(activity.id) }
                                className={ `px-2.5 py-1.5 transition-colors ${savedIds.has(activity.id) ? "text-brand-pitch" : "text-paper/40 hover:text-brand-pitch"}` }>
                                { savedIds.has(activity.id) ? <BookmarkCheck className="w-3.5 h-3.5 fill-current" /> : <Bookmark className="w-3.5 h-3.5" /> }
                              </button>
                              <button onClick={ () => handleShare(activity) }
                                className={ `flex items-center gap-1.5 px-2.5 py-1.5 t-mono text-xs transition-colors ${shareToastId === activity.id ? "text-brand-pitch" : "text-paper/40 hover:text-paper"}` }>
                                <Share2 className="w-3.5 h-3.5" />
                                { shareToastId === activity.id && <span>COPIED</span> }
                              </button>
                              <span className="ml-auto t-meta text-paper/30">
                                { activity.created_at ? formatPostedTime(activity.created_at) : "" }
                              </span>
                            </div>

                            {/* Join requests panel (host only, private activities) */ }
                            { isHost && joinRequestsPanel === activity.id && (
                              <div className="mt-3 border-t border-paper/10 pt-3">
                                <div className="flex items-center justify-between mb-2.5">
                                  <p className="t-eyebrow text-paper/55 flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" />JOIN REQUESTS
                                  </p>
                                  <button className="w-6 h-6 flex items-center justify-center text-paper/40 hover:text-paper" onClick={ () => setJoinRequestsPanel(null) }>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                { (joinRequestsList[activity.id] ?? []).length === 0 ? (
                                  <p className="t-body text-paper/40 text-center py-3">No pending requests</p>
                                ) : (
                                  <div className="space-y-2">
                                    { (joinRequestsList[activity.id] ?? []).map((req) => (
                                      <div key={ req.id } className="flex items-center gap-2.5">
                                        <Link href={ `/profile/${req.user_id}` }>
                                          <Avatar className="w-7 h-7 hover:ring-1 hover:ring-brand-pitch transition-all cursor-pointer">
                                            <AvatarImage src={ req.profiles?.avatar_url ?? undefined } />
                                            <AvatarFallback className="text-[10px] bg-brand-pitch/15 text-brand-pitch font-bold">{ getInitials(req.profiles?.full_name ?? null) }</AvatarFallback>
                                          </Avatar>
                                        </Link>
                                        <Link href={ `/profile/${req.user_id}` } className="flex-1 t-body text-paper hover:text-brand-pitch transition-colors">
                                          { req.profiles?.full_name ?? "User" }
                                        </Link>
                                        <button className="h-7 px-3 t-eyebrow bg-brand-pitch hover:bg-brand-pitch-hover text-paper transition-colors"
                                          onClick={ () => handleManageJoinRequest(req.id, req.user_id, "accepted", activity.id) }>ACCEPT</button>
                                        <button className="h-7 px-3 t-eyebrow border border-paper/15 text-paper/55 hover:text-red-400 hover:border-red-400/40 transition-colors"
                                          onClick={ () => handleManageJoinRequest(req.id, req.user_id, "declined", activity.id) }>DECLINE</button>
                                      </div>
                                    )) }
                                  </div>
                                ) }
                              </div>
                            ) }

                            {/* Chat panel */ }
                            { chatOpen && (() => {
                              const isExpanded = expandedChats.has(activity.id)
                              const visibleMessages = isExpanded ? activityMessages : activityMessages.slice(-2)
                              const hiddenCount = activityMessages.length - 2
                              return (
                                <div className="mt-3 border-t border-paper/10 pt-3">
                                  <div className="flex items-center justify-between mb-2.5">
                                    <p className="t-eyebrow text-paper/55">CHAT</p>
                                    <button className="w-6 h-6 flex items-center justify-center text-paper/40 hover:text-paper" onClick={ () => setOpenChatId(null) }>
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="space-y-2 max-h-48 overflow-y-auto mb-2.5">
                                    { loadingMessages ? (
                                      <div className="flex justify-center py-4">
                                        <Loader2 className="w-4 h-4 text-brand-pitch animate-spin" />
                                      </div>
                                    ) : activityMessages.length === 0 ? (
                                      <p className="t-body text-paper/40 text-center py-3">No messages yet.</p>
                                    ) : (
                                      <>
                                        { !isExpanded && hiddenCount > 0 && (
                                          <button onClick={ () => setExpandedChats((prev) => new Set([...prev, activity.id])) }
                                            className="w-full t-eyebrow text-brand-pitch hover:text-brand-pitch-hover py-1.5 text-center transition-colors">
                                            VIEW { hiddenCount } EARLIER { hiddenCount === 1 ? "MESSAGE" : "MESSAGES" }
                                          </button>
                                        ) }
                                        { visibleMessages.map((msg) => (
                                          <div key={ msg.id } className={ `flex gap-2 ${msg.user_id === userId ? "flex-row-reverse" : ""}` }>
                                            <Avatar className="w-6 h-6 shrink-0">
                                              <AvatarImage src={ msg.profiles?.avatar_url ?? undefined } />
                                              <AvatarFallback className="text-[10px] bg-paper/10 text-paper/70">{ getInitials(msg.profiles?.full_name ?? null) }</AvatarFallback>
                                            </Avatar>
                                            <div className={ `max-w-xs px-3 py-1.5 ${msg.user_id === userId ? "bg-brand-pitch text-paper" : "bg-paper/5 border border-paper/10 text-paper"}` }>
                                              { msg.user_id !== userId && (
                                                <p className="t-meta text-paper/55 mb-0.5">{ msg.profiles?.full_name ?? "User" }</p>
                                              ) }
                                              <p className="t-body">{ msg.content }</p>
                                            </div>
                                          </div>
                                        )) }
                                      </>
                                    ) }
                                  </div>
                                  <div className="flex gap-2">
                                    <input placeholder="Type a message..." value={ newMessage }
                                      onChange={ (e) => setNewMessage(e.target.value) }
                                      onKeyDown={ (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(activity.id) } } }
                                      className="flex-1 h-8 px-2.5 bg-paper/5 border border-paper/15 text-paper placeholder:text-paper/30 t-body focus:outline-none focus:border-brand-pitch transition-colors" />
                                    <button onClick={ () => sendMessage(activity.id) } disabled={ sendingMsg || !newMessage.trim() }
                                      className="h-8 w-8 flex items-center justify-center bg-brand-pitch hover:bg-brand-pitch-hover disabled:opacity-40 text-paper transition-colors shrink-0">
                                      { sendingMsg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" /> }
                                    </button>
                                  </div>
                                </div>
                              )
                            })() }
                          </div>{/* end body */ }
                      </article>
                    )
                  }) }
                </div>
              ) }
            </div>
          </div>
        </div>

        {/* Friend request prompt modal */ }
        { friendPrompt && (
          <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-ink border border-paper/15">
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 border border-brand-pitch/30 bg-brand-pitch/10 flex items-center justify-center mx-auto">
                  <UserPlus className="w-6 h-6 text-brand-pitch" />
                </div>
                <div>
                  <h3 className="t-display-sm text-paper">Connect with { friendPrompt.hostName }?</h3>
                  <p className="t-body text-paper/55 mt-2">You just joined their activity — send a friend request to stay connected.</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 h-10 px-4 t-mono border border-paper/15 text-paper/70 hover:text-paper hover:border-paper/30 transition-colors" onClick={ () => setFriendPrompt(null) }>MAYBE LATER</button>
                  <button
                    className="flex-1 h-10 px-4 bg-brand-pitch hover:bg-brand-pitch-hover text-paper t-mono transition-colors flex items-center justify-center gap-1.5"
                    onClick={ () => handleAddFriend(friendPrompt.hostId) }
                  >
                    <UserPlus className="w-4 h-4" />ADD FRIEND
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) }

        { /* Shared form modal — Edit & Create both use the same fields, render via this template */ }
        { (editActivityId || showCreateModal) && (() => {
          const isEdit = !!editActivityId
          const form = isEdit ? editForm : createForm
          const setForm = isEdit ? setEditForm : setCreateForm
          const onClose = isEdit ? () => setEditActivityId(null) : () => setShowCreateModal(false)
          const onSubmit = isEdit ? handleEditActivity : handleCreateActivity
          const busy = isEdit ? saving : creating
          const cantSubmit = !form.title || !form.sport_id || !form.location || !form.date || !form.time
          const inp = "w-full h-9 px-3 t-body bg-paper/5 border border-paper/15 text-paper placeholder:text-paper/30 focus:outline-none focus:border-brand-pitch transition-colors"
          return (
            <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="w-full max-w-lg bg-ink border border-paper/15 max-h-[90vh] flex flex-col">
                <div className="px-5 py-4 border-b border-paper/10 shrink-0 flex items-center justify-between">
                  <h2 className="t-display-sm text-paper">{ isEdit ? "Edit activity" : "Create activity" }</h2>
                  <button className="w-8 h-8 flex items-center justify-center text-paper/40 hover:text-paper transition-colors" onClick={ onClose }>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-5 py-4 space-y-3 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="t-eyebrow text-paper/40 mb-1 block">Title</label>
                      <input placeholder="e.g. 5-a-side Football" value={ form.title } onChange={ (e) => setForm((f) => ({ ...f, title: e.target.value })) } className={ inp } />
                    </div>
                    <div>
                      <label className="t-eyebrow text-paper/40 mb-1 block">Sport</label>
                      <select value={ form.sport_id } onChange={ (e) => setForm((f) => ({ ...f, sport_id: e.target.value })) } className={ inp }>
                        <option value="" className="bg-stone-900 text-paper">Select sport</option>
                        { dbSports.map((s) => <option key={ s.id } value={ s.id } className="bg-stone-900 text-paper">{ s.emoji } { s.name }</option>) }
                      </select>
                    </div>
                    <div>
                      <label className="t-eyebrow text-paper/40 mb-1 block">Skill level</label>
                      <select value={ form.skill_level } onChange={ (e) => setForm((f) => ({ ...f, skill_level: e.target.value })) } className={ inp }>
                        { ["Any", "Beginner", "Intermediate", "Advanced"].map((l) => <option key={ l } className="bg-stone-900 text-paper">{ l }</option>) }
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="t-eyebrow text-paper/40 mb-1 block">Location</label>
                      <input placeholder="e.g. Hyde Park, London" value={ form.location } onChange={ (e) => setForm((f) => ({ ...f, location: e.target.value })) } className={ inp } />
                    </div>
                    <div>
                      <label className="t-eyebrow text-paper/40 mb-1 block">Date</label>
                      <input type="date" value={ form.date } { ...(isEdit ? {} : { min: new Date().toISOString().split("T")[0] }) } onChange={ (e) => setForm((f) => ({ ...f, date: e.target.value })) } className={ inp } />
                    </div>
                    <div>
                      <label className="t-eyebrow text-paper/40 mb-1 block">Time</label>
                      <input type="time" value={ form.time } onChange={ (e) => setForm((f) => ({ ...f, time: e.target.value })) } className={ inp } />
                    </div>
                    <div>
                      <label className="t-eyebrow text-paper/40 mb-1 block">Duration (min)</label>
                      <input type="number" min="15" step="15" value={ form.duration_minutes } onChange={ (e) => setForm((f) => ({ ...f, duration_minutes: e.target.value })) } className={ inp } />
                    </div>
                    <div>
                      <label className="t-eyebrow text-paper/40 mb-1 block">Max players</label>
                      <input type="number" min="2" max="100" value={ form.max_participants } onChange={ (e) => setForm((f) => ({ ...f, max_participants: e.target.value })) } className={ inp } />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="t-eyebrow text-paper/40 mb-1 block">Description <span className="text-paper/25">(optional)</span></label>
                      <textarea placeholder="What should players expect?" value={ form.description } onChange={ (e) => setForm((f) => ({ ...f, description: e.target.value })) } rows={ 2 } className="w-full px-3 py-2 t-body bg-paper/5 border border-paper/15 text-paper placeholder:text-paper/30 focus:outline-none focus:border-brand-pitch transition-colors resize-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="t-eyebrow text-paper/40 mb-1.5 block">Visibility</label>
                      <div className="flex gap-2">
                        { (["public", "private"] as const).map((v) => (
                          <button
                            key={ v }
                            type="button"
                            onClick={ () => setForm((f) => ({ ...f, visibility: v })) }
                            className={ `flex-1 h-10 t-mono border transition-colors flex items-center justify-center gap-1.5 ${form.visibility === v
                                ? "border-brand-pitch bg-brand-pitch/10 text-brand-pitch"
                                : "border-paper/15 bg-paper/5 text-paper/55 hover:border-paper/30 hover:text-paper"
                              }` }
                          >
                            { v === "public" ? <><Globe className="w-3.5 h-3.5" />PUBLIC</> : <><Lock className="w-3.5 h-3.5" />PRIVATE</> }
                          </button>
                        )) }
                      </div>
                      <p className="t-meta text-paper/40 mt-1.5">
                        { form.visibility === "private" ? "People must request to join — you approve each one." : "Anyone can join instantly." }
                      </p>
                    </div>
                  </div>
                  { !isEdit && (
                    <p className="t-meta text-paper/40">You&apos;ll automatically be added as the first participant.</p>
                  ) }
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 h-10 t-mono border border-paper/15 text-paper/70 hover:text-paper hover:border-paper/30 transition-colors" onClick={ onClose }>CANCEL</button>
                    <button
                      className="flex-1 h-10 bg-brand-pitch hover:bg-brand-pitch-hover disabled:opacity-40 disabled:cursor-not-allowed text-paper t-mono transition-colors flex items-center justify-center gap-1.5"
                      disabled={ busy || cantSubmit }
                      onClick={ onSubmit }
                    >
                      { busy && <Loader2 className="w-4 h-4 animate-spin" /> }
                      { busy ? (isEdit ? "SAVING…" : "CREATING…") : (isEdit ? "SAVE CHANGES" : "CREATE ACTIVITY") }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })() }

        {/* Delete Confirmation */ }
        { deleteConfirmId && (
          <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-ink border border-paper/15">
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 border border-red-400/30 bg-red-500/10 flex items-center justify-center mx-auto">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="t-display-sm text-paper">Delete activity?</h3>
                  <p className="t-body text-paper/55 mt-2">This will remove the activity and all participants. This cannot be undone.</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 h-10 t-mono border border-paper/15 text-paper/70 hover:text-paper hover:border-paper/30 transition-colors" onClick={ () => setDeleteConfirmId(null) }>CANCEL</button>
                  <button
                    className="flex-1 h-10 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-paper t-mono transition-colors flex items-center justify-center gap-1.5"
                    disabled={ deleting }
                    onClick={ () => handleDeleteActivity(deleteConfirmId) }
                  >
                    { deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "DELETE" }
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) }
      </div>
    )
  }
