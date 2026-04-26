/**
 * EditorialAvatar — image with mono-initials fallback.
 *
 * Used wherever a user is represented in the editorial system (team sheets,
 * top-bar profile button, host bylines, friend lists). Initials use the
 * tactical mono voice for visual consistency with timestamps and IDs.
 *
 * Sizes map to the type scale tiers — xs aligns with t-eyebrow, lg with
 * t-heading, etc. Keep avatars circular; that's the brand call.
 */

import Image from "next/image"

type Size = "xs" | "sm" | "md" | "lg"

const SIZE_CLASS: Record<Size, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-xs",
  lg: "w-16 h-16 text-sm",
}

const SIZE_PX: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function EditorialAvatar({
  name,
  src,
  size = "md",
  className = "",
}: {
  name: string | null | undefined
  src?: string | null
  size?: Size
  className?: string
}) {
  const initials = getInitials(name)
  const px = SIZE_PX[size]

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-muted text-foreground font-semibold overflow-hidden shrink-0 ${SIZE_CLASS[size]} ${className}`}
      title={name ?? undefined}
      style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? "avatar"}
          width={px}
          height={px}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  )
}
