/**
 * PageShell — the chrome wrapper every revamped page mounts inside.
 *
 *   <PageShell signedIn={signedIn}>...</PageShell>           (marketing — landing/404)
 *   <PageShell mode="app" signedIn={signedIn}>...</PageShell> (app — fixture detail/feed)
 *
 * Provides:
 *   - bg-background / text-foreground page surface (dark-mode safe)
 *   - AppTopBar in the right mode (with right auth-aware actions)
 *   - <main> wrapper for semantics; bottom padding when MobileBottomNav is present
 *   - EditorialFooter (suppressible via hideFooter)
 *   - MobileBottomNav (app mode only — hidden on desktop)
 *
 * Deliberately NOT included:
 *   - LiveTicker — placement varies per page; pages mount their own.
 *   - IntroStinger — landing-only by design, mounted by app/page.tsx.
 *
 * App mode fetches the full CurrentUser server-side so the top bar can
 * render the avatar and unread-notifications badge without the page having
 * to plumb that data through.
 */

import { getCurrentUser } from "@/lib/auth"
import type { ReactNode } from "react"
import { AppTopBar } from "./app-top-bar"
import { EditorialFooter } from "./editorial-footer"
import { MobileBottomNav } from "./mobile-bottom-nav"

type Mode = "marketing" | "app"

export async function PageShell({
  mode = "marketing",
  signedIn,
  homeHref,
  hideFooter = false,
  children,
}: {
  mode?: Mode
  signedIn: boolean
  homeHref?: string
  hideFooter?: boolean
  children: ReactNode
}) {
  // App mode needs the full user payload for the top bar's avatar + bell badge.
  // Marketing mode skips this fetch entirely.
  const user = mode === "app" && signedIn ? await getCurrentUser() : null
  const isApp = mode === "app"

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppTopBar
        mode={mode}
        signedIn={signedIn}
        user={user}
        homeHref={homeHref}
      />

      <main
        className={`flex-1 flex flex-col ${isApp ? "pb-16 md:pb-0" : ""}`}
      >
        {children}
      </main>

      {!hideFooter && <EditorialFooter />}
      {isApp && <MobileBottomNav />}
    </div>
  )
}
