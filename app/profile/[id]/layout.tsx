import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "Player Profile",
  description: "View this player's sports activity, ratings, and connect with them on PeerFit.",
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
