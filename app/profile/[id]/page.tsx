"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import AppNav from "@/components/app-nav"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin, Calendar, Clock, UserPlus, UserCheck, UserX,
  Users, Loader2, Trophy, Star, Activity,
} from "lucide-react"

type FriendStatus = "none" | "pending_sent" | "pending_received" | "friends"

type Profile = {
  id: string
  full_name: string | null
  bio: string | null
  location: string | null
  avatar_url: string | null
  created_at: string
}

type UserActivity = {
  id: string
  title: string
  date: string
  time: string
  location: string
  sports: { name: string; emoji: string } | null
  activity_participants: { user_id: string }[]
  max_participants: number
}

type UserSport = {
  sport_id: number
  skill_level: string
  sports: { name: string; emoji: string }
}

function getInitials(name: string | null) {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatTime(t: string) {
  const [h, m] = t.split(":")
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const profileId = params.id as string

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sports, setSports] = useState<UserSport[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [totalJoined, setTotalJoined] = useState(0)
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("none")
  const [friendshipId, setFriendshipId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      if (user.id === profileId) { router.push("/profile"); return }
      setCurrentUserId(user.id)

      const today = new Date().toISOString().split("T")[0]

      const [
        { data: profileData },
        { data: sportsData },
        { data: activityData },
        { data: joinedData },
        { data: friendship },
      ] = await Promise.all([
        supabase.from("profiles").select("id, full_name, bio, location, avatar_url, created_at").eq("id", profileId).single(),
        supabase.from("user_sports").select("sport_id, skill_level, sports(name, emoji)").eq("user_id", profileId),
        supabase.from("activities")
          .select("id, title, date, time, location, max_participants, sports(name, emoji), activity_participants(user_id)")
          .eq("host_id", profileId).eq("status", "open").gte("date", today).order("date").limit(5),
        supabase.from("activity_participants").select("activity_id").eq("user_id", profileId),
        supabase.from("friendships").select("id, requester_id, addressee_id, status")
          .or(`and(requester_id.eq.${user.id},addressee_id.eq.${profileId}),and(requester_id.eq.${profileId},addressee_id.eq.${user.id})`)
          .maybeSingle(),
      ])

      if (!profileData) { router.push("/feed"); return }
      setProfile(profileData)
      if (sportsData) setSports(sportsData as unknown as UserSport[])
      if (activityData) setActivities(activityData as unknown as UserActivity[])
      if (joinedData) setTotalJoined(joinedData.length)

      if (friendship) {
        setFriendshipId(friendship.id)
        if (friendship.status === "accepted") setFriendStatus("friends")
        else if (friendship.status === "pending" && friendship.requester_id === user.id) setFriendStatus("pending_sent")
        else if (friendship.status === "pending" && friendship.addressee_id === user.id) setFriendStatus("pending_received")
      }

      setLoading(false)
    }
    load()
  }, [profileId, router, supabase])

  const handleFriendAction = async () => {
    if (!currentUserId) return
    setActioning(true)

    if (friendStatus === "none") {
      const { data } = await supabase
        .from("friendships")
        .insert({ requester_id: currentUserId, addressee_id: profileId, status: "pending" })
        .select("id").single()
      await supabase.from("notifications").insert({
        user_id: profileId, type: "friend_request", from_user_id: currentUserId, read: false,
      })
      if (data) setFriendshipId(data.id)
      setFriendStatus("pending_sent")

    } else if (friendStatus === "pending_received") {
      await supabase.from("friendships").update({ status: "accepted" })
        .or(`and(requester_id.eq.${profileId},addressee_id.eq.${currentUserId})`)
      await supabase.from("notifications").insert({
        user_id: profileId, type: "friend_accepted", from_user_id: currentUserId, read: false,
      })
      setFriendStatus("friends")

    } else {
      if (friendshipId) await supabase.from("friendships").delete().eq("id", friendshipId)
      setFriendStatus("none")
      setFriendshipId(null)
    }

    setActioning(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : ""

  const friendBtnLabel =
    friendStatus === "friends" ? "Friends ✓" :
    friendStatus === "pending_sent" ? "Request Sent" :
    friendStatus === "pending_received" ? "Accept Request" :
    "Add Friend"

  const friendBtnClass =
    friendStatus === "friends"
      ? "bg-muted text-foreground border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
      : friendStatus === "pending_sent"
      ? "bg-muted text-muted-foreground border border-border cursor-default"
      : "bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppNav />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Hero card */}
        <Card className="overflow-hidden shadow-xl border-border/40">
          <div className="h-36 bg-gradient-to-br from-primary/70 via-accent/50 to-primary/40 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
            <div className="absolute bottom-2 right-3 flex gap-1.5 opacity-30 text-3xl select-none">
              {sports.slice(0, 3).map((s) => <span key={s.sport_id}>{s.sports?.emoji}</span>)}
            </div>
          </div>
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-4">
              <Avatar className="w-20 h-20 ring-4 ring-background shadow-lg">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  {getInitials(profile?.full_name ?? null)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {profile?.full_name ?? "User"}
                </h1>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                  {profile?.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{profile.location}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" />Joined {memberSince}</span>
                </div>
              </div>
              <Button
                size="sm"
                disabled={actioning || friendStatus === "pending_sent"}
                onClick={handleFriendAction}
                className={`shrink-0 gap-2 ${friendBtnClass}`}
              >
                {actioning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : friendStatus === "friends" ? (
                  <UserCheck className="w-4 h-4" />
                ) : friendStatus === "pending_received" ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {friendBtnLabel}
              </Button>
            </div>

            {profile?.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{profile.bio}</p>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                <p className="text-xl font-bold text-primary">{totalJoined}</p>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
              <div className="bg-accent/5 rounded-xl p-3 text-center border border-accent/10">
                <p className="text-xl font-bold text-accent">{sports.length}</p>
                <p className="text-xs text-muted-foreground">Sports</p>
              </div>
              <div className="bg-yellow-500/5 rounded-xl p-3 text-center border border-yellow-500/10">
                <p className="text-xl font-bold text-yellow-600">
                  {totalJoined >= 10 ? "🏆" : totalJoined >= 5 ? "⭐" : totalJoined >= 1 ? "🎯" : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
            </div>

            {/* Sports */}
            {sports.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                  <Badge key={s.sport_id} className="bg-primary/10 text-primary border-primary/20 text-xs gap-1.5">
                    <span>{s.sports?.emoji}</span>
                    <span>{s.sports?.name}</span>
                    <span className="text-muted-foreground font-normal">· {s.skill_level}</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming activities */}
        {activities.length > 0 && (
          <div>
            <h2 className="text-base font-bold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Upcoming Activities
            </h2>
            <div className="space-y-3">
              {activities.map((a) => (
                <Card key={a.id} className="border-border/40 hover:border-border/70 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                      {a.sports?.emoji ?? "🏃"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{a.title}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatTime(a.time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{a.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      <Users className="w-3 h-3 mr-1" />
                      {a.activity_participants?.length ?? 0}/{a.max_participants}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/feed">
            <Button variant="outline" size="sm">Browse Activities</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
