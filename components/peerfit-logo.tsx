/** Inline SVG logo — two athletes side-by-side with arms raised.
 *  Pass className to control colour, e.g. "text-white" or "text-emerald-500".
 *  Size is set via width/height props (defaults to 32). */
export default function PeerfitLogo({
  size = 32,
  className = "text-emerald-500",
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left figure */}
      {/* head */}
      <circle cx="21" cy="10" r="5" />
      {/* body */}
      <path d="M21 16 C18 22 16 26 15 32 L27 32 C26 26 24 22 21 16Z" />
      {/* left arm — raised out-left */}
      <path d="M21 20 L9 14" strokeWidth="3.5" stroke="currentColor" strokeLinecap="round" fill="none" />
      {/* right arm — reaching toward right figure */}
      <path d="M21 20 L30 17" strokeWidth="3.5" stroke="currentColor" strokeLinecap="round" fill="none" />
      {/* left leg */}
      <path d="M17 32 L14 46" strokeWidth="3.5" stroke="currentColor" strokeLinecap="round" fill="none" />
      {/* right leg */}
      <path d="M25 32 L28 46" strokeWidth="3.5" stroke="currentColor" strokeLinecap="round" fill="none" />

      {/* Right figure */}
      {/* head */}
      <circle cx="43" cy="10" r="5" />
      {/* body */}
      <path d="M43 16 C40 22 38 26 37 32 L49 32 C48 26 46 22 43 16Z" />
      {/* left arm — reaching toward left figure */}
      <path d="M43 20 L34 17" strokeWidth="3.5" stroke="currentColor" strokeLinecap="round" fill="none" />
      {/* right arm — raised out-right */}
      <path d="M43 20 L55 14" strokeWidth="3.5" stroke="currentColor" strokeLinecap="round" fill="none" />
      {/* left leg */}
      <path d="M39 32 L36 46" strokeWidth="3.5" stroke="currentColor" strokeLinecap="round" fill="none" />
      {/* right leg */}
      <path d="M47 32 L50 46" strokeWidth="3.5" stroke="currentColor" strokeLinecap="round" fill="none" />
    </svg>
  )
}
