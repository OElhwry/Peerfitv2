/**
 * TopBar — 56px hairline bar with the wordmark and an action slot.
 *
 * Editorial replacement for the legacy <AppNav />, intended for revamped
 * surfaces only (Landing, Feed, Fixture Detail, 404 in the first slice).
 *
 *   tone="light"  — paper background, ink text. Default.
 *   tone="dark"   — ink background, paper text. For photo-hero adjacent use.
 *
 * `actions` slot accepts arbitrary JSX (links, buttons, avatar dropdowns).
 */

import Link from "next/link"
import type { ReactNode } from "react"
import { Wordmark } from "./wordmark"

type Tone = "light" | "dark"

const TONE_CLASSES: Record<Tone, string> = {
  // Light tone follows the theme — inverts cleanly under dark mode.
  light: "bg-background text-foreground border-border",
  // Dark tone is opinionated: always ink-on-paper regardless of theme.
  // Used adjacent to photo heroes where the brand always reads dark.
  dark: "bg-ink text-paper border-stone-800",
}

export function TopBar({
  tone = "light",
  homeHref = "/",
  actions,
}: {
  tone?: Tone
  homeHref?: string
  actions?: ReactNode
}) {
  return (
    <header
      className={`h-14 border-b ${TONE_CLASSES[tone]}`}
      role="banner"
    >
      <div className="max-w-[1280px] mx-auto h-full px-5 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
        <Link
          href={homeHref}
          className="hover:opacity-80 transition-opacity shrink-0"
          aria-label="PeerFit — home"
        >
          <Wordmark variant="compact" size="md" />
        </Link>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  )
}
