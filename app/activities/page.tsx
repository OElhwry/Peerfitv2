"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

// Mock data for calendar events
const mockEvents = [
  {
    id: 1,
    title: "Tennis Doubles",
    sport: "Tennis",
    sportEmoji: "🎾",
    time: "10:00 AM",
    location: "Hyde Park Courts",
    participants: { current: 3, max: 4 },
    date: new Date(2024, 11, 25), // December 25, 2024
  },
  {
    id: 2,
    title: "Football Match",
    sport: "Football",
    sportEmoji: "⚽",
    time: "6:00 PM",
    location: "Local Park",
    participants: { current: 8, max: 10 },
    date: new Date(2024, 11, 26), // December 26, 2024
  },
  {
    id: 3,
    title: "Morning Run",
    sport: "Running",
    sportEmoji: "🏃",
    time: "7:00 AM",
    location: "Regent's Park",
    participants: { current: 5, max: 12 },
    date: new Date(2024, 11, 27), // December 27, 2024
  },
]

export default function ActivitiesPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  // Get the start of the current week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // Generate week days
  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekStart = getWeekStart(currentWeek)
  const weekDays = getWeekDays(weekStart)

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newDate)
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return mockEvents.filter((event) => event.date.toDateString() === date.toDateString())
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/feed" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <Image
                    src="/images/peerfit-logo.png"
                    alt="PeerFit Logo"
                    width={100}
                    height={100}
                    className="w-12 h-12 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span
                    className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    PeerFit
                  </span>
                  <p className="text-xs text-muted-foreground">Find your sports community</p>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-2">
                <Link href="/feed">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-sm font-medium">Feed</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-primary bg-primary/10 rounded-xl px-4 py-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Activities</span>
                </Button>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-6 py-3 hidden md:flex"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Activity
              </Button>

              <div className="relative">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded-xl p-2 transition-colors"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarImage src="/abstract-geometric-shapes.png" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>

                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-50">
                    <div className="p-2">
                      <Link href="/profile">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                          <User className="w-4 h-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Button>
                      </Link>
                      <Separator className="my-2" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            My Activities
          </h1>
          <p className="text-muted-foreground">View and manage your sports activities</p>
        </div>

        {/* Calendar */}
        <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{formatDate(currentWeek)}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek("prev")}
                  className="hover:bg-primary/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(new Date())}
                  className="hover:bg-primary/10"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek("next")}
                  className="hover:bg-primary/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => {
                const dayEvents = getEventsForDate(day)
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

                return (
                  <div
                    key={index}
                    className={`min-h-32 p-4 rounded-xl border transition-all ${
                      isToday(day)
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/20 border-border/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className="text-xs font-medium text-muted-foreground">{dayNames[index]}</p>
                      <p className={`text-lg font-bold ${isToday(day) ? "text-primary" : ""}`}>{day.getDate()}</p>
                    </div>

                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-2 bg-background/80 rounded-lg border border-border/50 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{event.sportEmoji}</span>
                            <p className="text-xs font-semibold truncate">{event.title}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>
                              {event.participants.current}/{event.participants.max}
                            </span>
                          </div>
                        </div>
                      ))}

                      {dayEvents.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-xs text-muted-foreground">No activities</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Upcoming Activities</h2>
          <div className="grid gap-4">
            {mockEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-background/60 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-2xl">
                        {event.sportEmoji}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {event.participants.current}/{event.participants.max} players
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
