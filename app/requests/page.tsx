"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import AppNav from "@/components/app-nav"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserCheck, UserX, MapPin, Loader2, Users, Search, UserPlus } from "lucide-react"

type FriendProfile = { full_name: string | null; avatar_url: string | null; location: string | null }

type IncomingRequest = {
  id: string
  requester_id: string
  created_at: string
  profiles: FriendProfile | null
}

type SentRequest = {
  id: string
  addressee_id: string
  created_at: string
  profiles: FriendProfile | null
}

type Friend = {
  id: string
  other_id: string
  profiles: FriendProfile | null
}

function getInitials(name: string | null) {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function RequestsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [incoming, setIncoming] = useState<IncomingRequest[]>([])
  const [sent, setSent] = useState<SentRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [tab, setTab] = useState<"incoming" | "sent" | "friends">("incoming")
  const [friendSearch, setFriendSearch] = useState("")

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      // Fetch friendships without profile joins (two-step to avoid FK issues)
      const [{ data: incomingRaw }, { data: sentRaw }, { data: friendsRaw }] = await Promise.all([
        supabase.from("friendships")
          .select("id, requester_id, created_at")
          .eq("addressee_id", user.id).eq("status", "pending"),
        supabase.from("friendships")
          .select("id, addressee_id, created_at")
          .eq("requester_id", user.id).eq("status", "pending"),
        supabase.from("friendships")
          .select("id, requester_id, addressee_id")
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
      ])

      // Collect all user IDs we need profiles for
      const allIds = new Set<string>()
      for (const r of (incomingRaw ?? [])) allIds.add(r.requester_id)
      for (const r of (sentRaw ?? [])) allIds.add(r.addressee_id)
      for (const f of (friendsRaw ?? [])) {
        allIds.add(f.requester_id)
        allIds.add(f.addressee_id)
      }
      allIds.delete(user.id)

      // Fetch all profiles in one query
      const { data: profilesData } = allIds.size > 0
        ? await supabase.from("profiles").select("id, full_name, avatar_url, location").in("id", [...allIds])
        : { data: [] }

      const pm: Record<string, FriendProfile> = {}
      for (const p of (profilesData ?? []) as ({ id: string } & FriendProfile)[]) {
        pm[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url, location: p.location }
      }

      setIncoming((incomingRaw ?? []).map((r) => ({ ...r, profiles: pm[r.requester_id] ?? null })))
      setSent((sentRaw ?? []).map((r) => ({ ...r, profiles: pm[r.addressee_id] ?? null })))
      setFriends((friendsRaw ?? []).map((f) => {
        const other_id = f.requester_id === user.id ? f.addressee_id : f.requester_id
        return { id: f.id, other_id, profiles: pm[other_id] ?? null }
      }))

      // Mark notifications as read
      await supabase.from("notifications").update({ read: true })
        .eq("user_id", user.id).eq("type", "friend_request").eq("read", false)

      setLoading(false)
    }
    load()
  }, [router, supabase])

  const accept = async (req: IncomingRequest) => {
    if (!userId) return
    setActionId(req.id)
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", req.id)
    await supabase.from("notifications").insert({
      user_id: req.requester_id, type: "friend_accepted", from_user_id: userId, read: false,
    })
    setIncoming((prev) => prev.filter((r) => r.id !== req.id))
    setFriends((prev) => [...prev, { id: req.id, other_id: req.requester_id, profiles: req.profiles }])
    setActionId(null)
  }

  const decline = async (id: string) => {
    setActionId(id)
    await supabase.from("friendships").update({ status: "declined" }).eq("id", id)
    setIncoming((prev) => prev.filter((r) => r.id !== id))
    setActionId(null)
  }

  const cancelSent = async (id: string) => {
    setActionId(id)
    await supabase.from("friendships").delete().eq("id", id)
    setSent((prev) => prev.filter((r) => r.id !== id))
    setActionId(null)
  }

  const removeFriend = async (id: string) => {
    setActionId(id)
    await supabase.from("friendships").delete().eq("id", id)
    setFriends((prev) => prev.filter((f) => f.id !== id))
    setActionId(null)
  }

  const filteredFriends = friends.filter((f) =>
    !friendSearch || f.profiles?.full_name?.toLowerCase().includes(friendSearch.toLowerCase())
  )

  const tabs = [
    { key: "incoming" as const, label: "Incoming", count: incoming.length },
    { key: "sent" as const, label: "Sent", count: sent.length },
    { key: "friends" as const, label: "Friends", count: friends.length },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppNav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Friends</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your connections and requests</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-muted/40 rounded-2xl border border-border/40 mb-6">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === key
                  ? "bg-background shadow-sm text-foreground border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Friend search (only on friends tab) */}
        {tab === "friends" && friends.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search friends..."
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Incoming */}
            {tab === "incoming" && (
              <>
                {incoming.length === 0 ? (
                  <EmptyState icon={<UserPlus className="w-7 h-7 text-muted-foreground" />} text="No incoming friend requests" />
                ) : incoming.map((req) => (
                  <Card key={req.id} className="border-border/40 hover:border-border/70 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Link href={`/profile/${req.requester_id}`}>
                        <Avatar className="w-11 h-11 ring-2 ring-border hover:ring-primary/40 transition-all cursor-pointer shrink-0">
                          <AvatarImage src={req.profiles?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                            {getInitials(req.profiles?.full_name ?? null)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${req.requester_id}`} className="font-semibold text-sm hover:text-primary transition-colors block truncate">
                          {req.profiles?.full_name ?? "User"}
                        </Link>
                        {req.profiles?.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{req.profiles.location}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => accept(req)}
                          disabled={actionId === req.id}
                          className="h-8 bg-gradient-to-r from-primary to-accent text-white gap-1.5 text-xs px-3"
                        >
                          {actionId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => decline(req.id)}
                          disabled={actionId === req.id}
                          className="h-8 text-xs px-3 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Sent */}
            {tab === "sent" && (
              <>
                {sent.length === 0 ? (
                  <EmptyState icon={<Users className="w-7 h-7 text-muted-foreground" />} text="No sent requests" />
                ) : sent.map((req) => (
                  <Card key={req.id} className="border-border/40 hover:border-border/70 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Link href={`/profile/${req.addressee_id}`}>
                        <Avatar className="w-11 h-11 ring-2 ring-border hover:ring-primary/40 transition-all cursor-pointer shrink-0">
                          <AvatarImage src={req.profiles?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                            {getInitials(req.profiles?.full_name ?? null)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${req.addressee_id}`} className="font-semibold text-sm hover:text-primary transition-colors block truncate">
                          {req.profiles?.full_name ?? "User"}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">Pending their response</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelSent(req.id)}
                        disabled={actionId === req.id}
                        className="h-8 text-xs px-3 text-muted-foreground hover:text-destructive hover:border-destructive/30 shrink-0"
                      >
                        {actionId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cancel"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Friends */}
            {tab === "friends" && (
              <>
                {friends.length === 0 ? (
                  <EmptyState
                    icon={<Users className="w-7 h-7 text-muted-foreground" />}
                    text="No friends yet"
                    sub="Join activities to meet people and connect!"
                    action={<Link href="/feed"><Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white">Find activities</Button></Link>}
                  />
                ) : filteredFriends.length === 0 ? (
                  <EmptyState icon={<Search className="w-7 h-7 text-muted-foreground" />} text="No friends match your search" />
                ) : filteredFriends.map((f) => (
                  <Card key={f.id} className="border-border/40 hover:border-border/70 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Link href={`/profile/${f.other_id}`}>
                        <Avatar className="w-11 h-11 ring-2 ring-border hover:ring-primary/40 transition-all cursor-pointer shrink-0">
                          <AvatarImage src={f.profiles?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                            {getInitials(f.profiles?.full_name ?? null)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${f.other_id}`} className="font-semibold text-sm hover:text-primary transition-colors block truncate">
                          {f.profiles?.full_name ?? "User"}
                        </Link>
                        {f.profiles?.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{f.profiles.location}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/profile/${f.other_id}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs px-3">View</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFriend(f.id)}
                          disabled={actionId === f.id}
                          className="h-8 text-xs px-2 text-muted-foreground hover:text-destructive"
                        >
                          {actionId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, text, sub, action }: { icon: React.ReactNode; text: string; sub?: string; action?: React.ReactNode }) {
  return (
    <Card className="border-border/40">
      <CardContent className="py-12 text-center">
        <div className="w-14 h-14 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-3">
          {icon}
        </div>
        <p className="text-sm font-medium">{text}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  )
}

import React from "react"
