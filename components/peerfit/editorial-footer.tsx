/**
 * EditorialFooter — wordmark + legal links + restrained issue stamp.
 *
 * Used at the foot of every editorial page (404, landing, fixture detail,
 * eventually all product surfaces).
 *
 * The "Issue 01 / Spring 2026" stamp is the magazine motif at its most
 * restrained — present, not loud. Per the agreed rule, it lives in the
 * footer ONLY. Don't put it in heroes, nav, or emails.
 */

import Link from "next/link"
import { Wordmark } from "./wordmark"

type FooterLink = { label: string; href: string }

const DEFAULT_LINKS: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
]

export function EditorialFooter({
  links = DEFAULT_LINKS,
  showIssue = true,
  issueText = "Issue 01 / Spring 2026 / peerfit.app",
}: {
  links?: FooterLink[]
  showIssue?: boolean
  issueText?: string
}) {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <Wordmark variant="full" size="sm" className="text-muted-foreground" />

        {links.length > 0 && (
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="t-eyebrow text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {showIssue && (
          <p className="t-eyebrow text-muted-foreground">{issueText}</p>
        )}
      </div>
    </footer>
  )
}
