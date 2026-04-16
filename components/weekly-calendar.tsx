  "use client"

  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
  import { useEffect, useState } from "react"

  interface WeeklyCalendarProps {
    /** ISO date strings (YYYY-MM-DD) that have at least one activity */
    activeDates?: string[]
  }

  export default function WeeklyCalendar({ activeDates = [] }: WeeklyCalendarProps) {
    // Keep dates in state to avoid SSR/client mismatch
    const [weekStart, setWeekStart] = useState<Date | null>(null)
    const [todayStr, setTodayStr] = useState<string>("")

    useEffect(() => {
      const today = new Date()
      const day = today.getDay()
      // Start week on Monday
      const monday = new Date(today)
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
      monday.setHours(0, 0, 0, 0)
      setWeekStart(monday)
      setTodayStr(today.toLocaleDateString("en-CA")) // YYYY-MM-DD
    }, [])

    const navigateWeek = (dir: "prev" | "next") => {
      if (!weekStart) return
      const next = new Date(weekStart)
      next.setDate(weekStart.getDate() + (dir === "next" ? 7 : -7))
      setWeekStart(next)
    }

    // Don't render until client has determined the date
    if (!weekStart) {
      return (
        <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
          <CardContent className="h-24 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </CardContent>
        </Card>
      )
    }

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      days.push(d)
    }

    const endDate = days[6]
    const rangeLabel = (() => {
      const sm = weekStart.toLocaleDateString("en-US", { month: "short" })
      const em = endDate.toLocaleDateString("en-US", { month: "short" })
      if (sm === em)
        return `${sm} ${weekStart.getDate()}–${endDate.getDate()}, ${weekStart.getFullYear()}`
      return `${sm} ${weekStart.getDate()} – ${em} ${endDate.getDate()}, ${weekStart.getFullYear()}`
    })()

    return (
      <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-7 h-7 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              Weekly Schedule
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={ () => navigateWeek("prev") } className="w-7 h-7 hover:bg-primary/10">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={ () => navigateWeek("next") } className="w-7 h-7 hover:bg-primary/10">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{ rangeLabel }</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            { days.map((day, i) => {
              const dateStr = day.toLocaleDateString("en-CA")
              const isToday = dateStr === todayStr
              const hasActivity = activeDates.includes(dateStr)
              const dayName = day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3)

              return (
                <div
                  key={ i }
                  className={ `flex flex-col items-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg transition-all ${isToday
                      ? "bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
                      : "hover:bg-muted/30"
                    }` }
                >
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{ dayName }</span>
                  <span className={ `text-sm font-bold mt-0.5 ${isToday ? "text-primary" : "text-foreground"}` }>
                    { day.getDate() }
                  </span>
                  { hasActivity ? (
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mt-1" />
                  ) : (
                    <div className="w-1.5 h-1.5 mt-1" />
                  ) }
                </div>
              )
            }) }
          </div>
        </CardContent>
      </Card>
    )
  }
