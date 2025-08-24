"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react"

interface CalendarEvent {
  id: number
  title: string
  time: string
  location: string
  sport: string
  sportEmoji: string
  date: Date
}

const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Tennis Doubles",
    time: "10:00 AM",
    location: "Hyde Park",
    sport: "Tennis",
    sportEmoji: "🎾",
    date: new Date(2024, 11, 25), // Wednesday
  },
  {
    id: 2,
    title: "Football Match",
    time: "6:00 PM",
    location: "Local Field",
    sport: "Football",
    sportEmoji: "⚽",
    date: new Date(2024, 11, 26), // Thursday
  },
  {
    id: 3,
    title: "Morning Run",
    time: "7:00 AM",
    location: "Regent's Park",
    sport: "Running",
    sportEmoji: "🏃",
    date: new Date(2024, 11, 28), // Saturday
  },
]

export default function WeeklyCalendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    return monday
  })

  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeekStart(newDate)
  }

  const weekDays = getWeekDays(currentWeekStart)
  const today = new Date()

  const getEventsForDay = (date: Date) => {
    return mockEvents.filter((event) => event.date.toDateString() === date.toDateString())
  }

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart)
    endDate.setDate(currentWeekStart.getDate() + 6)

    const startMonth = currentWeekStart.toLocaleDateString("en-US", { month: "short" })
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" })

    if (startMonth === endMonth) {
      return `${startMonth} ${currentWeekStart.getDate()}-${endDate.getDate()}, ${currentWeekStart.getFullYear()}`
    } else {
      return `${startMonth} ${currentWeekStart.getDate()} - ${endMonth} ${endDate.getDate()}, ${currentWeekStart.getFullYear()}`
    }
  }

  return (
    <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            Weekly Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek("prev")}
              className="w-8 h-8 hover:bg-primary/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek("next")}
              className="w-8 h-8 hover:bg-primary/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{formatWeekRange()}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === today.toDateString()
            const dayEvents = getEventsForDay(day)
            const dayName = day.toLocaleDateString("en-US", { weekday: "short" })
            const dayNumber = day.getDate()

            return (
              <div
                key={index}
                className={`p-2 rounded-lg text-center transition-all ${
                  isToday
                    ? "bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">{dayName}</div>
                <div className={`text-sm font-semibold mb-2 ${isToday ? "text-primary" : "text-foreground"}`}>
                  {dayNumber}
                </div>
                {dayEvents.length > 0 && (
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Upcoming Events */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground">Upcoming Events</h4>
          {mockEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="text-lg">{event.sportEmoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{event.time}</span>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {event.date.toLocaleDateString("en-US", { weekday: "short" })}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
