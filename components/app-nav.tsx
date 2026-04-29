"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { Bell, Calendar, ChevronDown, Home, LogOut, Menu, Plus, Settings, User, UserCheck, UserPlus, Users, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type Notification = {
  id: string
  type: string
  from_user_id: string
  read: boolean
  created_at: string
  from_profile: { full_name: string | null; avatar_url: string | null } | null
}

interface AppNavProps {
  /** Pass a handler to show the floating "+" create button in the mobile bottom bar */
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

  const handleNotifToggle = () => {
    const opening = !notifOpen
    setNotifOpen(opening)
    setDropdownOpen(false)
    // Mark read when closing (so user had a chance to see them)
    if (!opening) markAllRead()
  }

  const handleNotifClose = () => {
    setNotifOpen(false)
    markAllRead()
  }

  function getNotifText(n: Notification): string {
    const name = n.from_profile?.full_name ?? "Someone"
    if (n.type === "friend_request") return `${name} sent you a friend request`
    if (n.type === "friend_accepted") return `${name} accepted your friend request`
    if (n.type === "join_accepted") return `${name} accepted your request to join their activity`
    return `${name} sent you a notification`
  }

  function getNotifIcon(type: string) {
    if (type === "friend_request") return <UserPlus className="w-3 h-3 text-brand-pitch" />
    if (type === "friend_accepted") return <UserCheck className="w-3 h-3 text-green-400" />
    if (type === "join_accepted") return <UserCheck className="w-3 h-3 text-green-400" />
    return <Bell className="w-3 h-3 text-paper/50" />
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "JUST NOW"
    if (mins < 60) return `${mins}M AGO`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}H AGO`
    return `${Math.floor(hrs / 24)}D AGO`
  }

  function getInitialsLocal(name: string | null): string {
    if (!name) return "?"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const navLinks = [
    { href: "/feed", icon: Home, label: "FEED" },
    { href: "/activities", icon: Calendar, label: "ACTIVITIES" },
    { href: "/requests", icon: Users, label: "FRIENDS" },
    { href: "/profile", icon: User, label: "PROFILE" },
  ]

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <>
      <header className="bg-ink/90 backdrop-blur-xl border-b border-paper/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/feed" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            <Image src="/images/peerfit-logo.png" alt="PeerFit" width={180} height={120} className="h-12 sm:h-16 w-auto object-contain -my-2 sm:-my-3" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center h-14">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative h-14 px-4 flex items-center gap-2 t-eyebrow transition-colors ${
                    active ? "text-paper" : "text-paper/40 hover:text-paper/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {active && <span aria-hidden className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-pitch" />}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center shrink-0">
            {/* Notifications bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotifToggle}
                className="relative w-10 h-10 flex items-center justify-center text-paper/60 hover:text-paper hover:bg-paper/5 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-brand-pitch text-paper text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={handleNotifClose} />
                  <div className="absolute top-full right-0 mt-1 w-[min(22rem,calc(100vw-1.5rem))] bg-ink border border-paper/15 z-50 overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between px-4 h-11 border-b border-paper/10">
                      <p className="t-eyebrow text-paper">NOTIFICATIONS</p>
                      {notifications.length > 0 && (
                        <Link href="/requests" onClick={handleNotifClose} className="t-eyebrow text-brand-pitch hover:text-paper transition-colors">
                          VIEW ALL &gt;
                        </Link>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center px-6">
                          <Bell className="w-7 h-7 text-paper/20 mx-auto mb-3" strokeWidth={1.5} />
                          <p className="t-mono text-paper/40">NO NOTIFICATIONS YET</p>
                        </div>
                      ) : (
                        <div>
                          {notifications.map((n) => (
                            <Link
                              key={n.id}
                              href="/requests"
                              onClick={handleNotifClose}
                              className={`flex items-start gap-3 px-4 py-3 hover:bg-paper/5 transition-colors border-b border-paper/8 last:border-b-0 ${!n.read ? "bg-brand-pitch/5" : ""}`}
                            >
                              <div className="relative shrink-0 mt-0.5">
                                <Avatar className="w-9 h-9">
                                  <AvatarImage src={n.from_profile?.avatar_url ?? undefined} />
                                  <AvatarFallback className="text-[11px] bg-brand-pitch/10 text-brand-pitch font-semibold">
                                    {getInitialsLocal(n.from_profile?.full_name ?? null)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-ink border border-paper/15 flex items-center justify-center">
                                  {getNotifIcon(n.type)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] leading-snug ${!n.read ? "text-paper" : "text-paper/55"}`}>
                                  {getNotifText(n)}
                                </p>
                                <p className="t-eyebrow text-paper/30 mt-1">{timeAgo(n.created_at)}</p>
                              </div>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 bg-brand-pitch mt-2 shrink-0" />
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
                className="flex items-center gap-2 hover:bg-paper/5 px-2 h-10 transition-colors"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-brand-pitch/10 text-brand-pitch font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="t-eyebrow text-paper hidden sm:block max-w-24 truncate">
                  {profile?.full_name?.split(" ")[0]?.toUpperCase() ?? "ME"}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-paper/40 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 w-60 bg-ink border border-paper/15 z-50 shadow-2xl">
                    <div className="px-4 py-3 border-b border-paper/10">
                      <p className="text-[15px] font-semibold text-paper truncate leading-tight">{profile?.full_name ?? "User"}</p>
                      <p className="t-eyebrow text-paper/40 mt-1">PEERFIT MEMBER</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 h-10 t-mono transition-colors ${
                          pathname === "/profile" ? "text-brand-pitch bg-brand-pitch/5" : "text-paper/70 hover:text-paper hover:bg-paper/5"
                        }`}
                      >
                        <User className="w-4 h-4" />
                        PROFILE
                      </Link>
                      <Link href="/settings" onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 h-10 t-mono transition-colors ${
                          pathname === "/settings" ? "text-brand-pitch bg-brand-pitch/5" : "text-paper/70 hover:text-paper hover:bg-paper/5"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        SETTINGS
                      </Link>
                      <div className="h-px bg-paper/10 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 h-10 t-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        SIGN OUT
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center text-paper/60 hover:text-paper hover:bg-paper/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer — fixed overlay so it doesn't push content */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <nav className="fixed top-14 left-0 right-0 z-50 md:hidden border-b border-paper/10 bg-ink/97 backdrop-blur-xl px-3 py-3 flex gap-2">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="flex-1">
                  <span className={`flex flex-col items-center justify-center gap-1.5 h-16 t-eyebrow transition-colors border ${
                    active
                      ? "text-paper border-brand-pitch bg-brand-pitch/5"
                      : "text-paper/40 border-paper/10 hover:text-paper/80"
                  }`}>
                    <Icon className="w-5 h-5" />
                    {label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </>
      )}

      {/* Mobile bottom bar — shown on all pages, with + only when onCreateActivity is provided */}
      <nav className="fixed bottom-0 left-0 right-0 bg-ink/95 backdrop-blur-xl border-t border-paper/10 md:hidden z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-1.5 px-1.5 gap-1">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} className="flex-1 flex justify-center">
                <span className={`flex flex-col items-center gap-1 px-2 py-2 w-full min-w-0 t-eyebrow transition-colors ${
                  active ? "text-brand-pitch" : "text-paper/40 hover:text-paper/70"
                }`}>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-[9px] leading-none">{label}</span>
                </span>
              </Link>
            )
          })}
          {onCreateActivity && (
            <button
              onClick={onCreateActivity}
              aria-label="Create activity"
              className="shrink-0 w-12 h-12 bg-brand-pitch hover:bg-brand-pitch-hover -mt-4 flex items-center justify-center text-paper transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
