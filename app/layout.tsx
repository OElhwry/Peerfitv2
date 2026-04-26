  import { GeistMono } from "geist/font/mono"
  import { GeistSans } from "geist/font/sans"
  import type { Metadata } from "next"
  import { ThemeProvider } from "next-themes"
  import { Big_Shoulders_Display, DM_Sans, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google"
  import type React from "react"
  import { Analytics } from "@vercel/analytics/next"
  import "./globals.css"

  // ── PeerFit editorial system fonts ────────────────────────────────────────────
  const bigShoulders = Big_Shoulders_Display({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-big-shoulders",
    weight: ["700", "800", "900"],
  })

  const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
  })

  const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jetbrains",
    weight: ["500", "600"],
  })

  // ── Legacy fonts (kept until non-revamped surfaces are migrated in V2) ───────
  const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-space-grotesk",
  })

  const dmSans = DM_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-dm-sans",
  })

  export const metadata: Metadata = {
    title: "PeerFit - Find People. Play Sports. Stay Active.",
    description:
      "Connect with teammates and partners for sports activities near you. Join a community of active people and never play alone again.",
    openGraph: {
      title: "PeerFit - Find People. Play Sports. Stay Active.",
      description: "Find local games, connect with players nearby, and build lasting habits. Free to join — 15+ sports.",
      type: "website",
      siteName: "PeerFit",
    },
    twitter: {
      card: "summary_large_image",
      title: "PeerFit - Find People. Play Sports. Stay Active.",
      description: "Find local games, connect with players nearby, and build lasting habits. Free to join — 15+ sports.",
    },
  }

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode
  }>) {
    return (
      <html
        lang="en"
        suppressHydrationWarning
        className={ `${bigShoulders.variable} ${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${dmSans.variable}` }
      >
        <head>
          <style>{ `
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-space-grotesk: ${spaceGrotesk.variable};
  --font-dm-sans: ${dmSans.variable};
  --font-big-shoulders: ${bigShoulders.variable};
  --font-inter: ${inter.variable};
  --font-jetbrains: ${jetbrainsMono.variable};
}
        `}</style>
        </head>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            { children }
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    )
  }
