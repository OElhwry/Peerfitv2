/**
 * AppTopBar — auth-aware top bar for revamped pages.
 *
 * Two modes:
 *   "marketing"  — anonymous CTAs (LOG IN / JOIN) or "FEED →" if signed in.
 *                  Used by landing and 404. Wraps the generic <TopBar />.
 *   "app"        — nav links + notifications bell (badge) + profile avatar.
 *                  Used by in-app pages (fixture detail, eventually feed/etc.).
 *
 * App mode renders its own three-section header (wordmark / nav / actions)
 * rather than wrapping <TopBar />, since the layout shape differs.
 *
 * Notifications and profile are LINKS for now — not dropdowns. Bell links
 * to /requests, avatar links to /profile. Sign-out remains accessible via
 * the legacy AppNav on /profile until profile itself is revamped (Phase 7).
 */

import type { CurrentUser } from "@/lib/auth"
import { Bell } from "lucide-react"
import Link from "next/link"
import { EditorialAvatar } from "./editorial-avatar"
import { TopBar } from "./top-bar"
import { Wordmark } from "./wordmark"

type Mode = "marketing" | "app"

export function AppTopBar({
  mode = "marketing",
  signedIn,
  user,
  homeHref,
}: {
  mode?: Mode
  signedIn: boolean
  /** Required when mode="app". Ignored otherwise. */
  user?: CurrentUser | null
  homeHref?: string
}) {
  if (mode === "app" && user) {
    return <AppModeBar user={user} homeHref={homeHref ?? "/feed"} />
  }
  return (
    <TopBar
      homeHref={homeHref ?? (signedIn ? "/feed" : "/")}
      actions={signedIn ? <SignedInActions /> : <SignedOutActions />}
    />
  )
}

// ── App mode ────────────────────────────────────────────────────────────────

const APP_NAV_LINKS = [
  { href: "/feed", label: "FEED" },
  { href: "/activities", label: "ACTIVITIES" },
  { href: "/requests", label: "FRIENDS" },
] as const

function AppModeBar({ user, homeHref }: { user: CurrentUser; homeHref: string }) {
  return (
    <header className="h-14 border-b bg-background text-foreground border-border">
      <div className="max-w-[1280px] mx-auto h-full px-5 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
        <Link
          href={homeHref}
          className="hover:opacity-80 transition-opacity shrink-0"
          aria-label="PeerFit — home"
        >
          <Wordmark variant="compact" size="md" />
        </Link>

        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Primary"
        >
          {APP_NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="t-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/requests"
            aria-label={`Notifications${user.unreadNotifications > 0 ? ` (${user.unreadNotifications} unread)` : ""}`}
            className="relative text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
          >
            <Bell className="w-5 h-5" />
            {user.unreadNotifications > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-amber text-ink t-eyebrow text-[9px] flex items-center justify-center leading-none"
                style={{ fontFeatureSettings: "'tnum'" }}
              >
                {user.unreadNotifications > 9 ? "9+" : user.unreadNotifications}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            aria-label="Profile"
            className="hover:opacity-80 transition-opacity"
          >
            <EditorialAvatar
              name={user.profile?.full_name}
              src={user.profile?.avatar_url}
              size="sm"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}

// ── Marketing mode actions ──────────────────────────────────────────────────

function SignedInActions() {
  return (
    <Link
      href="/feed"
      className="t-mono text-foreground hover:text-brand-pitch transition-colors"
    >
      FEED →
    </Link>
  )
}

function SignedOutActions() {
  return (
    <>
      <Link
        href="/login"
        className="t-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        LOG IN
      </Link>
      <Link
        href="/login?mode=signup"
        className="t-mono text-paper bg-brand-pitch hover:bg-brand-pitch-hover px-4 py-2 transition-colors"
      >
        JOIN
      </Link>
    </>
  )
}
