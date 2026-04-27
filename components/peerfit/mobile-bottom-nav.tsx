"use client"

/**
 * MobileBottomNav — sticky bottom navigation for in-app pages on mobile.
 *
 * The editorial replacement for the legacy AppNav's mobile bottom bar.
 * Renders only on mobile (md:hidden); desktop nav lives inline in
 * AppTopBar's app mode.
 *
 * On /feed, a floating "+" button is rendered between Activities and
 * Friends — links to /feed?create=true so the FeedView client component
 * can detect the URL state and open its create modal. URL-driven so the
 * + CTA is server-renderable, deep-linkable, and refresh-safe.
 *
 * Active state matches by exact path or path-prefix, so /fixture/abc
 * still highlights "Feed" since that's where users navigate from.
 */

import { Calendar, Home, Plus, User, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/feed", icon: Home, label: "Feed", matchPrefix: "/fixture" },
  { href: "/activities", icon: Calendar, label: "Activities" },
  { href: "/requests", icon: Users, label: "Friends" },
  { href: "/profile", icon: User, label: "Me" },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()
  const showCreate = pathname === "/feed" || pathname.startsWith("/feed?")

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    if (pathname === item.href) return true
    if (pathname.startsWith(item.href + "/")) return true
    if ("matchPrefix" in item && item.matchPrefix && pathname.startsWith(item.matchPrefix))
      return true
    return false
  }

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-stretch justify-around h-14 relative">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active
                  ? "text-brand-pitch"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
              <span className="t-eyebrow text-[9px]">{item.label}</span>
            </Link>
          )
        })}

        {showCreate && (
          <Link
            href="/feed?create=true"
            aria-label="Post a new fixture"
            className="absolute left-1/2 -translate-x-1/2 -top-5 w-12 h-12 bg-brand-pitch hover:bg-brand-pitch-hover text-paper flex items-center justify-center transition-colors shadow-lg shadow-ink/20"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </nav>
  )
}
