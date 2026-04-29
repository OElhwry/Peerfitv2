"use client"

import AppNav from "@/components/app-nav"
import { createClient } from "@/lib/supabase/client"
import { Loader2, MapPin, Search, UserCheck, UserPlus, Users, UserX } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type React from "react"

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

function UserAvatar({ url, name }: { url: string | null; name: string | null }) {
  return (
    <div className="w-11 h-11 rounded-full bg-paper/10 border border-paper/15 shrink-0 overflow-hidden flex items-center justify-center">
      {url
        ? <img src={url} alt="" className="w-full h-full object-cover" />
        : <span className="t-mono text-paper/50 text-xs font-bold">{getInitials(name)}</span>
      }
    </div>
  )
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
  const [unfriendPending, setUnfriendPending] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const [{ data: incomingRaw }, { data: sentRaw }, { data: friendsRaw }] = await Promise.all([
        supabase.from("friendships").select("id, requester_id, created_at").eq("addressee_id", user.id).eq("status", "pending"),
        supabase.from("friendships").select("id, addressee_id, created_at").eq("requester_id", user.id).eq("status", "pending"),
        supabase.from("friendships").select("id, requester_id, addressee_id").eq("status", "accepted").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
      ])

      const allIds = new Set<string>()
      for (const r of (incomingRaw ?? [])) allIds.add(r.requester_id)
      for (const r of (sentRaw ?? [])) allIds.add(r.addressee_id)
      for (const f of (friendsRaw ?? [])) { allIds.add(f.requester_id); allIds.add(f.addressee_id) }
      allIds.delete(user.id)

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
    { key: "incoming" as const, label: "INCOMING", count: incoming.length },
    { key: "sent" as const, label: "SENT", count: sent.length },
    { key: "friends" as const, label: "FRIENDS", count: friends.length },
  ]

  return (
    <>
      <div className="min-h-screen bg-ink text-paper pb-20 md:pb-0">
        <AppNav />

        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
          <div className="mb-8">
            <p className="t-eyebrow text-paper/40 mb-1">NETWORK</p>
            <h1 className="t-display-md text-paper" style={{ fontSize: "32px" }}>Friends</h1>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-paper/10 mb-6">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-3 t-eyebrow text-xs transition-colors border-b-2 -mb-px ${
                  tab === key
                    ? "text-paper border-brand-pitch"
                    : "text-paper/40 border-transparent hover:text-paper/70"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 font-bold ${
                    tab === key ? "bg-brand-pitch/20 text-brand-pitch" : "bg-paper/10 text-paper/50"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Friend search */}
          {tab === "friends" && friends.length > 0 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/30" />
              <input
                type="text"
                placeholder="Search friends..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-paper/8 border border-paper/15 text-paper placeholder:text-paper/30 focus:outline-none focus:border-brand-pitch text-sm transition-colors"
              />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 border-2 border-brand-pitch border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-px">
              {/* Incoming */}
              {tab === "incoming" && (
                <>
                  {incoming.length === 0 ? (
                    <EmptyPanel icon={<UserPlus className="w-6 h-6" />} text="No incoming requests" />
                  ) : incoming.map((req) => (
                    <div key={req.id} className="bg-paper/5 border border-paper/10 flex items-center gap-3 px-4 py-3">
                      <Link href={`/profile/${req.requester_id}`}>
                        <UserAvatar url={req.profiles?.avatar_url ?? null} name={req.profiles?.full_name ?? null} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${req.requester_id}`} className="t-body text-sm font-semibold hover:text-brand-pitch transition-colors block truncate">
                          {req.profiles?.full_name ?? "User"}
                        </Link>
                        {req.profiles?.location && (
                          <p className="t-mono text-paper/40 text-[10px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{req.profiles.location}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => accept(req)}
                          disabled={actionId === req.id}
                          className="t-eyebrow text-xs bg-brand-pitch text-ink hover:opacity-90 disabled:opacity-50 px-3 py-1.5 flex items-center gap-1.5 transition-opacity"
                        >
                          {actionId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                          ACCEPT
                        </button>
                        <button
                          onClick={() => decline(req.id)}
                          disabled={actionId === req.id}
                          className="t-eyebrow text-xs border border-paper/20 text-paper/50 hover:text-paper hover:border-paper/40 px-3 py-1.5 transition-colors"
                          aria-label="Decline"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Sent */}
              {tab === "sent" && (
                <>
                  {sent.length === 0 ? (
                    <EmptyPanel icon={<Users className="w-6 h-6" />} text="No sent requests" />
                  ) : sent.map((req) => (
                    <div key={req.id} className="bg-paper/5 border border-paper/10 flex items-center gap-3 px-4 py-3">
                      <Link href={`/profile/${req.addressee_id}`}>
                        <UserAvatar url={req.profiles?.avatar_url ?? null} name={req.profiles?.full_name ?? null} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${req.addressee_id}`} className="t-body text-sm font-semibold hover:text-brand-pitch transition-colors block truncate">
                          {req.profiles?.full_name ?? "User"}
                        </Link>
                        <p className="t-mono text-paper/40 text-[10px] mt-0.5">Pending their response</p>
                      </div>
                      <button
                        onClick={() => cancelSent(req.id)}
                        disabled={actionId === req.id}
                        className="t-eyebrow text-xs border border-paper/20 text-paper/50 hover:text-red-400 hover:border-red-400/30 px-3 py-1.5 shrink-0 transition-colors"
                      >
                        {actionId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "CANCEL"}
                      </button>
                    </div>
                  ))}
                </>
              )}

              {/* Friends */}
              {tab === "friends" && (
                <>
                  {friends.length === 0 ? (
                    <EmptyPanel
                      icon={<Users className="w-6 h-6" />}
                      text="No friends yet"
                      sub="Join activities to meet people and connect"
                      action={
                        <Link href="/feed" className="t-eyebrow text-xs border border-brand-pitch text-brand-pitch px-4 py-2 hover:bg-brand-pitch hover:text-ink transition-colors">
                          FIND ACTIVITIES
                        </Link>
                      }
                    />
                  ) : filteredFriends.length === 0 ? (
                    <EmptyPanel icon={<Search className="w-6 h-6" />} text="No friends match your search" />
                  ) : filteredFriends.map((f) => (
                    <div key={f.id} className="bg-paper/5 border border-paper/10 flex items-center gap-3 px-4 py-3">
                      <Link href={`/profile/${f.other_id}`}>
                        <UserAvatar url={f.profiles?.avatar_url ?? null} name={f.profiles?.full_name ?? null} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${f.other_id}`} className="t-body text-sm font-semibold hover:text-brand-pitch transition-colors block truncate">
                          {f.profiles?.full_name ?? "User"}
                        </Link>
                        {f.profiles?.location && (
                          <p className="t-mono text-paper/40 text-[10px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{f.profiles.location}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/profile/${f.other_id}`} className="t-eyebrow text-xs border border-paper/20 text-paper/50 hover:text-paper hover:border-paper/40 px-3 py-1.5 transition-colors">
                          VIEW
                        </Link>
                        <button
                          onClick={() => setUnfriendPending({ id: f.id, name: f.profiles?.full_name ?? "this person" })}
                          disabled={actionId === f.id}
                          className="t-eyebrow text-xs text-paper/30 hover:text-red-400 px-2 py-1.5 transition-colors"
                          aria-label="Remove friend"
                        >
                          {actionId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unfriend confirmation */}
      {unfriendPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={() => setUnfriendPending(null)} />
          <div className="relative bg-ink border border-paper/15 p-6 w-full max-w-sm">
            <p className="t-eyebrow text-paper/40 text-[10px] mb-1">CONFIRM</p>
            <h3 className="t-display-sm text-paper mb-2" style={{ fontSize: "20px" }}>Remove friend?</h3>
            <p className="t-body text-paper/60 text-sm mb-6">
              Remove <span className="text-paper font-semibold">{unfriendPending.name}</span> from your friends? You&apos;ll need to send a new request to reconnect.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setUnfriendPending(null)}
                className="flex-1 t-eyebrow text-xs border border-paper/20 text-paper/50 hover:text-paper py-2.5 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={async () => {
                  const id = unfriendPending.id
                  setUnfriendPending(null)
                  await removeFriend(id)
                }}
                className="flex-1 t-eyebrow text-xs bg-red-500 hover:bg-red-600 text-white py-2.5 transition-colors"
              >
                REMOVE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function EmptyPanel({ icon, text, sub, action }: { icon: React.ReactNode; text: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="py-16 text-center">
      <div className="text-paper/20 flex justify-center mb-3">{icon}</div>
      <p className="t-eyebrow text-paper/40 text-xs">{text.toUpperCase()}</p>
      {sub && <p className="t-body text-paper/30 text-sm mt-1">{sub}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}
