"use client"

/**
 * MobileBottomNav — sticky bottom navigation for in-app pages on mobile.
 *
 * The editorial replacement for the legacy AppNav's mobile bottom bar.
 * Renders only on mobile (md:hidden); desktop nav lives inline in
 * AppTopBar's app mode.
 *
 * No floating "+" create button in V1 — that's a feed-page concern and
 * lands when feed is rebuilt in Phase 4.
 *
 * Active state matches by exact path or path-prefix, so /fixture/abc
 * still highlights "Feed" since that's where users navigate from.
 */

import { Calendar, Home, User, Users } from "lucide-react"
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
      <div className="flex items-stretch justify-around h-14">
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
      </div>
    </nav>
  )
}
