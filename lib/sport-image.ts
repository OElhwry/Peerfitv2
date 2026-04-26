/**
 * Single source of truth: sport name → photo URL.
 *
 * Replaces the duplicate sport-color maps in app/feed/page.tsx,
 * app/activities/page.tsx, and app/profile/page.tsx (to be removed in cleanup).
 *
 * The editorial system uses photography (not colour) to differentiate sports,
 * so this returns image data only — no per-sport gradient or accent colour.
 */

export type SportImage = {
  src: string
  /** CSS object-position override for awkwardly-cropped stock photos */
  position?: string
  /** Human-readable sport label, useful for alt text and lockups */
  label: string
}

const NEUTRAL: SportImage = {
  src: "/images/sports/football.jpg",
  label: "Sport",
}

const MAP: Array<{ match: (n: string) => boolean; image: SportImage }> = [
  { match: (n) => n.includes("football") || n.includes("soccer"), image: { src: "/images/sports/football.jpg", label: "Football" } },
  { match: (n) => n.includes("basketball"), image: { src: "/images/sports/basketball.jpg", label: "Basketball" } },
  { match: (n) => n.includes("badminton"), image: { src: "/images/sports/badminton.jpg", label: "Badminton" } },
  { match: (n) => n.includes("tennis") || n.includes("squash"), image: { src: "/images/sports/tennis.jpg", position: "center 62%", label: "Tennis" } },
  { match: (n) => n.includes("swim"), image: { src: "/images/sports/swimming.jpg", label: "Swimming" } },
  { match: (n) => n.includes("run") || n.includes("athletics") || n.includes("track"), image: { src: "/images/sports/running.jpg", label: "Running" } },
  { match: (n) => n.includes("cycl") || n.includes("bike"), image: { src: "/images/sports/cycling.jpg", label: "Cycling" } },
  { match: (n) => n.includes("yoga"), image: { src: "/images/sports/yoga.jpg", label: "Yoga" } },
  { match: (n) => n.includes("gym") || n.includes("fitness") || n.includes("weight") || n.includes("crossfit"), image: { src: "/images/sports/gym.jpg", position: "center 38%", label: "Gym" } },
  { match: (n) => n.includes("rugby") || n.includes("american football"), image: { src: "/images/sports/rugby.jpg", position: "center 72%", label: "Rugby" } },
  { match: (n) => n.includes("volleyball") || n.includes("beach"), image: { src: "/images/sports/volleyball.jpg", label: "Volleyball" } },
  { match: (n) => n.includes("hockey") || n.includes("ice"), image: { src: "/images/sports/hockey.jpg", label: "Hockey" } },
  { match: (n) => n.includes("cricket"), image: { src: "/images/sports/cricket.jpg", position: "center 69%", label: "Cricket" } },
  { match: (n) => n.includes("golf"), image: { src: "/images/sports/golf.jpg", position: "center 60%", label: "Golf" } },
  { match: (n) => n.includes("padel") || n.includes("pickleball"), image: { src: "/images/sports/padel.jpg", label: "Padel" } },
  { match: (n) => n.includes("box") || n.includes("muay") || n.includes("mma") || n.includes("martial"), image: { src: "/images/sports/boxing.jpg", label: "Boxing" } },
]

export function getSportImage(sportName: string | null | undefined): SportImage {
  const n = sportName?.toLowerCase() ?? ""
  if (!n) return NEUTRAL
  return MAP.find((entry) => entry.match(n))?.image ?? NEUTRAL
}

/**
 * Sports for which we have a bespoke field-line SVG.
 * Other sports fall back to the neutral hairline.
 */
export type FieldLineSport = "football" | "tennis" | "basketball" | "running" | "neutral"

export function getFieldLineSport(sportName: string | null | undefined): FieldLineSport {
  const n = sportName?.toLowerCase() ?? ""
  if (n.includes("football") || n.includes("soccer")) return "football"
  if (n.includes("tennis") || n.includes("padel") || n.includes("badminton")) return "tennis"
  if (n.includes("basketball")) return "basketball"
  if (n.includes("run") || n.includes("athletics") || n.includes("track")) return "running"
  return "neutral"
}
