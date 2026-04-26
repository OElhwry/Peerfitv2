/**
 * PeerFit wordmark — type-led, no custom-drawn logo.
 *
 *   full     PEERFIT with the field-line hairline beneath. Hero/footer use.
 *   compact  PEERFIT only. Top-bar and dense surfaces.
 *   glyph    Single ▣ mark for favicons, social avatars, mobile chrome.
 *
 * Inherits color from the parent — render in `text-paper` on dark surfaces,
 * `text-ink` on light. The hairline picks up `currentColor`.
 */

type Variant = "full" | "compact" | "glyph"
type Size = "sm" | "md" | "lg"

const SIZE_CLASS: Record<Size, string> = {
  sm: "text-[18px]",
  md: "text-[22px]",
  lg: "text-[28px]",
}

const GLYPH_SIZE_CLASS: Record<Size, string> = {
  sm: "text-[20px]",
  md: "text-[24px]",
  lg: "text-[32px]",
}

export function Wordmark({
  variant = "compact",
  size = "md",
  className = "",
}: {
  variant?: Variant
  size?: Size
  className?: string
}) {
  if (variant === "glyph") {
    return (
      <span
        aria-label="PeerFit"
        className={`inline-flex items-center justify-center font-bold leading-none ${GLYPH_SIZE_CLASS[size]} ${className}`}
        style={{ fontFamily: "var(--font-big-shoulders), system-ui, sans-serif" }}
      >
        ▣
      </span>
    )
  }

  return (
    <span
      aria-label="PeerFit"
      className={`inline-flex flex-col items-start leading-none ${className}`}
    >
      <span
        className={`font-black uppercase tracking-[-0.03em] ${SIZE_CLASS[size]}`}
        style={{ fontFamily: "var(--font-big-shoulders), system-ui, sans-serif" }}
      >
        PEERFIT
      </span>
      {variant === "full" && (
        <span
          aria-hidden
          className="block w-full h-px mt-1 bg-current opacity-90"
        />
      )}
    </span>
  )
}
