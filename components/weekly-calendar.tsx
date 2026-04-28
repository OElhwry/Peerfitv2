  "use client"

  import { ChevronLeft, ChevronRight } from "lucide-react"
  import { useEffect, useState } from "react"

  interface WeeklyCalendarProps {
    /** ISO date strings (YYYY-MM-DD) that have at least one activity */
    activeDates?: string[]
  }

  export default function WeeklyCalendar({ activeDates = [] }: WeeklyCalendarProps) {
    const [weekStart, setWeekStart] = useState<Date | null>(null)
    const [todayStr, setTodayStr] = useState<string>("")

    useEffect(() => {
      const today = new Date()
      const day = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
      monday.setHours(0, 0, 0, 0)
      setWeekStart(monday)
      setTodayStr(today.toLocaleDateString("en-CA"))
    }, [])

    const navigateWeek = (dir: "prev" | "next") => {
      if (!weekStart) return
      const next = new Date(weekStart)
      next.setDate(weekStart.getDate() + (dir === "next" ? 7 : -7))
      setWeekStart(next)
    }

    if (!weekStart) {
      return (
        <div className="bg-paper/5 border border-paper/10 h-24 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-brand-pitch border-t-transparent rounded-full animate-spin" />
        </div>
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
        return `${sm.toUpperCase()} ${weekStart.getDate()}–${endDate.getDate()}`
      return `${sm.toUpperCase()} ${weekStart.getDate()} – ${em.toUpperCase()} ${endDate.getDate()}`
    })()

    return (
      <div className="bg-paper/5 border border-paper/10">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <p className="t-eyebrow text-paper/40">THIS WEEK</p>
            <p className="t-mono text-paper/60 text-xs mt-1">{ rangeLabel }</p>
          </div>
          <div className="flex items-center">
            <button onClick={ () => navigateWeek("prev") } className="w-7 h-7 flex items-center justify-center text-paper/40 hover:text-paper transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={ () => navigateWeek("next") } className="w-7 h-7 flex items-center justify-center text-paper/40 hover:text-paper transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="px-3 pb-4 grid grid-cols-7 gap-0.5">
          { days.map((day, i) => {
            const dateStr = day.toLocaleDateString("en-CA")
            const isToday = dateStr === todayStr
            const hasActivity = activeDates.includes(dateStr)
            const dayName = day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)

            return (
              <div
                key={ i }
                className={ `flex flex-col items-center py-2 transition-colors ${isToday
                    ? "bg-brand-pitch/15 border border-brand-pitch/40"
                    : "border border-transparent hover:bg-paper/5"
                  }` }
              >
                <span className="t-mono text-paper/30 text-[10px]">{ dayName }</span>
                <span className={ `t-display-sm leading-none mt-0.5 ${isToday ? "text-brand-pitch" : "text-paper"}` } style={ { fontSize: "16px" } }>
                  { day.getDate() }
                </span>
                <div className={ `w-1 h-1 mt-1.5 ${hasActivity ? "bg-brand-pitch" : "bg-transparent"}` } />
              </div>
            )
          }) }
        </div>
      </div>
    )
  }
