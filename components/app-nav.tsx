"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Home, Calendar, User, Settings, LogOut, Bell, ChevronDown, Menu, X, Plus, Users, UserPlus, UserCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Notification = {
  id: string
  type: string
  from_user_id: string
  read: boolean
  created_at: string
  from_profile: { full_name: string | null; avatar_url: string | null } | null
}

interface AppNavProps {
  /** Show a floating "Create" button in the mobile bottom bar */
  onCreateActivity?: () => void
}

export default function AppNav({ onCreateActivity }: AppNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => { if (data) setProfile(data) })

      // Fetch notifications
      supabase
        .from("notifications")
        .select("id, type, from_user_id, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15)
        .then(async ({ data: notifData }) => {
          if (!notifData || notifData.length === 0) return
          const fromIds = [...new Set(notifData.map((n: { from_user_id: string }) => n.from_user_id))]
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", fromIds)
          const pm: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
          for (const p of (profilesData ?? []) as { id: string; full_name: string | null; avatar_url: string | null }[]) {
            pm[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
          }
          setNotifications(notifData.map((n: { id: string; type: string; from_user_id: string; read: boolean; created_at: string }) => ({
            ...n,
            from_profile: pm[n.from_user_id] ?? null,
          })))
        })
    })
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const openNotifications = () => {
    setNotifOpen((v) => !v)
    setDropdownOpen(false)
    if (!notifOpen) markAllRead()
  }

  function getNotifText(n: Notification): string {
    const name = n.from_profile?.full_name ?? "Someone"
    if (n.type === "friend_request") return `${name} sent you a friend request`
    if (n.type === "friend_accepted") return `${name} accepted your friend request`
    if (n.type === "join_accepted") return `${name} accepted your request to join their activity`
    return `${name} sent you a notification`
  }

  function getNotifIcon(type: string) {
    if (type === "friend_request") return <UserPlus className="w-3.5 h-3.5 text-primary" />
    if (type === "friend_accepted") return <UserCheck className="w-3.5 h-3.5 text-green-600" />
    if (type === "join_accepted") return <UserCheck className="w-3.5 h-3.5 text-green-600" />
    return <Bell className="w-3.5 h-3.5 text-muted-foreground" />
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  function getInitialsLocal(name: string | null): string {
    if (!name) return "?"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const navLinks = [
    { href: "/feed", icon: Home, label: "Feed" },
    { href: "/activities", icon: Calendar, label: "Activities" },
    { href: "/requests", icon: Users, label: "Friends" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <>
      <header className="bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/feed" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            <Image src="/images/peerfit-logo.png" alt="PeerFit" width={180} height={120} className="h-16 w-auto object-contain -my-3" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    pathname === href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Notifications bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotifications}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary/5 text-muted-foreground transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 ring-2 ring-background text-white text-[9px] font-black flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
                      <p className="font-semibold text-sm">Notifications</p>
                      {notifications.length > 0 && (
                        <Link href="/requests" onClick={() => setNotifOpen(false)} className="text-xs text-primary hover:underline">
                          View all
                        </Link>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/40">
                          {notifications.map((n) => (
                            <Link
                              key={n.id}
                              href="/requests"
                              onClick={() => setNotifOpen(false)}
                              className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${!n.read ? "bg-primary/3" : ""}`}
                            >
                              <div className="relative shrink-0 mt-0.5">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={n.from_profile?.avatar_url ?? undefined} />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                    {getInitialsLocal(n.from_profile?.full_name ?? null)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background flex items-center justify-center ring-1 ring-border/60">
                                  {getNotifIcon(n.type)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-snug ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                  {getNotifText(n)}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                              </div>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 hover:bg-muted/40 rounded-xl px-2 py-1.5 transition-colors"
              >
                <Avatar className="w-7 h-7 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block max-w-24 truncate">
                  {profile?.full_name?.split(" ")[0] ?? "Me"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-52 bg-background border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2.5 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
                      <p className="font-semibold text-sm truncate">{profile?.full_name ?? "User"}</p>
                      <p className="text-xs text-muted-foreground">PeerFit member</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start gap-2.5 rounded-lg text-sm ${
                            pathname === "/profile" ? "text-primary bg-primary/10" : ""
                          }`}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/settings" onClick={() => setDropdownOpen(false)}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start gap-2.5 rounded-lg text-sm ${
                            pathname === "/settings" ? "text-primary bg-primary/10" : ""
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Button>
                      </Link>
                      <Separator className="my-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-2.5 rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9 rounded-xl"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border/50 bg-background/95 px-4 py-2 flex gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full flex-col gap-1 h-14 rounded-xl text-xs transition-all ${
                    pathname === href
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Mobile bottom bar (only when onCreateActivity is provided — i.e. on the feed) */}
      {onCreateActivity && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 md:hidden shadow-2xl z-40">
          <div className="flex items-center justify-around py-2 px-4">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} className="flex-1 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col gap-0.5 rounded-xl px-3 py-1.5 ${
                    pathname === href ? "text-primary bg-primary/10" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </Button>
              </Link>
            ))}
            <button
              onClick={onCreateActivity}
              className="rounded-2xl w-12 h-12 bg-gradient-to-r from-primary to-accent shadow-lg -mt-4 flex items-center justify-center text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </nav>
      )}
    </>
  )
}
