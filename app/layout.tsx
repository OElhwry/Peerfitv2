  import { GeistMono } from "geist/font/mono"
  import { GeistSans } from "geist/font/sans"
  import type { Metadata } from "next"
  import { ThemeProvider } from "next-themes"
  import { DM_Sans, Space_Grotesk } from "next/font/google"
  import type React from "react"
  import { Analytics } from "@vercel/analytics/next"
  import "./globals.css"

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
      <html lang="en" suppressHydrationWarning className={ `${spaceGrotesk.variable} ${dmSans.variable}` }>
        <head>
          <style>{ `
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-space-grotesk: ${spaceGrotesk.variable};
  --font-dm-sans: ${dmSans.variable};
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
