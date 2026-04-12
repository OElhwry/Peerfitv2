"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Home, Calendar, User, Settings, LogOut, Bell, ChevronDown, Menu, X, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AppNavProps {
  /** Show a floating "Create" button in the mobile bottom bar */
  onCreateActivity?: () => void
}

export default function AppNav({ onCreateActivity }: AppNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => { if (data) setProfile(data) })
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const navLinks = [
    { href: "/feed", icon: Home, label: "Feed" },
    { href: "/activities", icon: Calendar, label: "Activities" },
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
          <Link href="/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <Image
              src="/images/peerfit-logo.png"
              alt="PeerFit"
              width={32}
              height={32}
              className="object-contain w-8 h-8"
            />
            <span
              className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              PeerFit
            </span>
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
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-xl hover:bg-primary/5 text-muted-foreground"
            >
              <Bell className="w-4 h-4" />
            </Button>

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
