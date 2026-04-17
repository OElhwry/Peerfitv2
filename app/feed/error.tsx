"use client"

import { useEffect } from "react"

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold mb-2 font-heading">Couldn&apos;t load the feed</h1>
        <p className="text-sm text-muted-foreground mb-6">
          There was a problem loading activities. Your data is safe.
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
