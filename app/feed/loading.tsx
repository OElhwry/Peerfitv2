export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Nav skeleton */}
      <div className="h-14 bg-background/80 border-b border-border/50 sticky top-0 z-50 flex items-center px-4">
        <div className="w-28 h-8 bg-muted/60 rounded-lg animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Toolbar skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-10 bg-muted/50 rounded-xl animate-pulse" />
          <div className="w-24 h-10 bg-muted/50 rounded-xl animate-pulse" />
          <div className="w-28 h-10 bg-muted/50 rounded-xl animate-pulse hidden md:block" />
        </div>

        <div className="flex gap-4 sm:gap-6">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-72 shrink-0 space-y-4">
            <div className="h-52 bg-muted/40 rounded-2xl animate-pulse" />
            <div className="h-28 bg-muted/40 rounded-2xl animate-pulse" />
          </div>

          {/* Feed skeleton cards */}
          <div className="flex-1 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/40 bg-background/60 animate-pulse">
                <div className="h-32 bg-muted/60" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted/60 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-muted/60 rounded w-32" />
                      <div className="h-3 bg-muted/40 rounded w-20" />
                    </div>
                    <div className="w-20 h-8 bg-muted/60 rounded-xl" />
                  </div>
                  <div className="h-2 bg-muted/40 rounded-full" />
                  <div className="flex gap-4 pt-1">
                    <div className="w-12 h-3 bg-muted/40 rounded" />
                    <div className="w-12 h-3 bg-muted/40 rounded" />
                    <div className="w-12 h-3 bg-muted/40 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
