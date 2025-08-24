"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Home,
  Bell,
  User,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronDown,
  Star,
  Zap,
  Activity,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import WeeklyCalendar from "@/components/weekly-calendar"

// Mock data for activities
const mockActivities = [
  {
    id: 1,
    title: "5-a-side Football Match",
    description: "Looking for skilled players for a competitive match. All positions needed!",
    sport: "Football",
    sportEmoji: "⚽",
    location: "Hyde Park, London",
    distance: "0.8 miles",
    date: "Today",
    time: "6:00 PM",
    duration: "2 hours",
    participants: { current: 6, max: 10 },
    skillLevel: "Intermediate",
    host: {
      name: "James Wilson",
      avatar: "/thoughtful-man.png",
      initials: "JW",
    },
    likes: 12,
    comments: 3,
    isLiked: false,
    tags: ["Competitive", "Regular Group"],
  },
  {
    id: 2,
    title: "Tennis Doubles Partner",
    description: "Need one more player for doubles. Intermediate level preferred but beginners welcome!",
    sport: "Tennis",
    sportEmoji: "🎾",
    location: "Wimbledon Courts, London",
    distance: "1.2 miles",
    date: "Tomorrow",
    time: "10:00 AM",
    duration: "1.5 hours",
    participants: { current: 3, max: 4 },
    skillLevel: "Intermediate",
    host: {
      name: "Sarah Chen",
      avatar: "/diverse-woman-portrait.png",
      initials: "SC",
    },
    likes: 8,
    comments: 5,
    isLiked: true,
    tags: ["Doubles", "Weekend"],
  },
  {
    id: 3,
    title: "Morning Running Group",
    description: "Weekly 5K run through the park. Perfect pace for fitness enthusiasts. Coffee after!",
    sport: "Running",
    sportEmoji: "🏃",
    location: "Regent's Park, London",
    distance: "0.5 miles",
    date: "Every Wednesday",
    time: "7:00 AM",
    duration: "45 minutes",
    participants: { current: 7, max: 12 },
    skillLevel: "All Levels",
    host: {
      name: "Mike Rodriguez",
      avatar: "/lone-runner-cityscape.png",
      initials: "MR",
    },
    likes: 15,
    comments: 8,
    isLiked: false,
    tags: ["Weekly", "Social", "Coffee"],
  },
  {
    id: 4,
    title: "Basketball Pickup Game",
    description: "Casual streetball session. Bring your A-game and good vibes!",
    sport: "Basketball",
    sportEmoji: "🏀",
    location: "Hackney Courts, London",
    distance: "2.1 miles",
    date: "Saturday",
    time: "2:00 PM",
    duration: "2 hours",
    participants: { current: 8, max: 10 },
    skillLevel: "All Levels",
    host: {
      name: "Alex Thompson",
      avatar: "/basketball-action.png",
      initials: "AT",
    },
    likes: 6,
    comments: 2,
    isLiked: false,
    tags: ["Pickup", "Casual"],
  },
  {
    id: 5,
    title: "Cycling Group Ride",
    description: "20-mile scenic route through London parks. Moderate pace, stops included.",
    sport: "Cycling",
    sportEmoji: "🚴",
    location: "Richmond Park, London",
    distance: "3.5 miles",
    date: "Sunday",
    time: "9:00 AM",
    duration: "3 hours",
    participants: { current: 4, max: 8 },
    skillLevel: "Intermediate",
    host: {
      name: "Emma Davis",
      avatar: "/cyclist.png",
      initials: "ED",
    },
    likes: 11,
    comments: 4,
    isLiked: true,
    tags: ["Scenic", "Group Ride"],
  },
]

const mockNotifications = [
  {
    id: 1,
    type: "activity_joined",
    message: "Sarah joined your Tennis match",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "activity_reminder",
    message: "Football match starts in 1 hour",
    time: "45 minutes ago",
    read: false,
  },
  {
    id: 3,
    type: "new_activity",
    message: "New Basketball game near you",
    time: "2 hours ago",
    read: true,
  },
]

export default function ActivityFeedPage() {
  const [selectedSport, setSelectedSport] = useState("All Sports")
  const [selectedDate, setSelectedDate] = useState("Any Time")
  const [selectedSkill, setSelectedSkill] = useState("All Levels")
  const [likedActivities, setLikedActivities] = useState<number[]>([2, 5])
  const [showEmptyState, setShowEmptyState] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const toggleLike = (activityId: number) => {
    setLikedActivities((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId],
    )
  }

  const sports = ["All Sports", "Football", "Tennis", "Running", "Basketball", "Cycling"]
  const dates = ["Any Time", "Today", "Tomorrow", "This Week", "This Weekend"]
  const skillLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-primary bg-primary/10 rounded-xl px-4 py-2"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Feed</span>
                </Button>
                <Link href="/activities">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Activities</span>
                  </Button>
                </Link>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all relative"
                    onClick={() => setNotificationOpen(!notificationOpen)}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></span>
                  </Button>

                  {notificationOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-xl z-50">
                      <div className="p-4 border-b border-border">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {mockNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                              !notification.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-border">
                        <Button variant="ghost" size="sm" className="w-full">
                          View All Notifications
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search activities, sports, locations..."
                  className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-background/50 transition-all duration-200 placeholder:text-muted-foreground/70"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-2 py-1 text-xs bg-muted/50 border border-border/30 rounded text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>
              </div>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary/10 transition-colors"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-xs flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  </span>
                </Button>

                {notificationOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                            !notification.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-border">
                      <Button variant="ghost" size="sm" className="w-full">
                        View All Notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>

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
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">Welcome back!</p>
                    <p className="text-xs text-muted-foreground">Ready to play?</p>
                  </div>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <Filter className="w-4 h-4 text-primary" />
                  </div>
                  Filters
                </CardTitle>
                <p className="text-sm text-muted-foreground">Find your perfect match</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Sport Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Sport
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSport}
                      onChange={(e) => setSelectedSport(e.target.value)}
                      className="w-full p-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 appearance-none font-medium transition-all duration-200"
                    >
                      {sports.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Enhanced Date Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    When
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 appearance-none font-medium transition-all duration-200"
                    >
                      {dates.map((date) => (
                        <option key={date} value={date}>
                          {date}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Enhanced Skill Level Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Skill Level
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full p-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 appearance-none font-medium transition-all duration-200"
                    >
                      {skillLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Enhanced Distance Filter */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Distance
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      defaultValue="5"
                      className="w-full h-2 bg-muted/50 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background:
                          "linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) 50%, hsl(var(--muted)) 50%, hsl(var(--muted)) 100%)",
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span>0 miles</span>
                      <span className="text-primary font-semibold">5 miles</span>
                      <span>10+ miles</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Your Activity</p>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">You've joined this week</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-primary text-lg">2</span>
                        <span className="text-muted-foreground">activities</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">New tennis matches nearby</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-accent text-lg">10</span>
                        <span className="text-muted-foreground">today</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full w-2/3"></div>
                    </div>
                    <p className="text-muted-foreground text-center">Keep it up! 🔥</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Feed */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <WeeklyCalendar />
            </div>

            <div className="sticky top-28 bg-background/80 backdrop-blur-xl rounded-xl p-6 mb-8 border border-border/50 shadow-lg z-40">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1
                    className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    Activity Feed
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <p>Discover activities near you</p>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <p className="flex items-center gap-1">
                      <span className="font-semibold text-primary">{mockActivities.length}</span>
                      activities found
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="md:hidden bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-4 py-3"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {showEmptyState ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                  <Activity className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  No activities nearby right now
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Be the first to create an activity in your area! Others are waiting for someone like you to get things
                  started.
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-4"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Activity
                </Button>
              </div>
            ) : (
              <>
                {/* Enhanced Activity Cards */}
                <div className="space-y-6">
                  {mockActivities.map((activity, index) => (
                    <Card
                      key={activity.id}
                      className="group hover:shadow-2xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background/80 transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Enhanced Activity Header */}
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                              <AvatarImage src={activity.host.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-semibold">
                                {activity.host.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{activity.host.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                Posted an activity
                                <span className="w-1 h-1 bg-primary rounded-full"></span>
                                <span className="text-primary font-medium">2h ago</span>
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Enhanced Activity Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                              {activity.sportEmoji}
                            </div>
                            <div>
                              <h3
                                className="text-xl font-bold group-hover:text-primary transition-colors"
                                style={{ fontFamily: "var(--font-space-grotesk)" }}
                              >
                                {activity.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
                                >
                                  {activity.sport}
                                </Badge>
                                <Badge variant="outline" className="text-xs font-medium border-accent/30 text-accent">
                                  {activity.skillLevel}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="text-right bg-muted/30 rounded-xl p-3">
                            <div className="flex items-center text-sm font-semibold mb-1">
                              <Users className="w-4 h-4 mr-2 text-primary" />
                              {activity.participants.current}/{activity.participants.max}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span className="font-semibold text-accent">
                                {activity.participants.max - activity.participants.current}
                              </span>{" "}
                              spots left
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Description */}
                        <p
                          className="text-muted-foreground leading-relaxed"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {activity.description}
                        </p>

                        {/* Enhanced Activity Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl border border-border/30">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Location</p>
                              <p className="text-sm font-semibold">{activity.location}</p>
                              <p className="text-xs text-primary font-medium">{activity.distance} away</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Date</p>
                              <p className="text-sm font-semibold">{activity.date}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-secondary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Time</p>
                              <p className="text-sm font-semibold">{activity.time}</p>
                              <p className="text-xs text-muted-foreground">{activity.duration}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                              <Star className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Skill Level</p>
                              <p className="text-sm font-semibold">{activity.skillLevel}</p>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Tags */}
                        <div className="flex flex-wrap gap-2">
                          {activity.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs font-medium bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-border/50">
                          <div className="flex items-center gap-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLike(activity.id)}
                              className={`gap-2 hover:bg-red-50 hover:text-red-500 transition-all ${likedActivities.includes(activity.id) ? "text-red-500 bg-red-50" : "text-muted-foreground"}`}
                            >
                              <Heart
                                className={`w-4 h-4 transition-all ${likedActivities.includes(activity.id) ? "fill-current scale-110" : ""}`}
                              />
                              <span className="font-medium">
                                {activity.likes + (likedActivities.includes(activity.id) && !activity.isLiked ? 1 : 0)}
                              </span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-muted-foreground hover:bg-blue-50 hover:text-blue-500 transition-all"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="font-medium">{activity.comments}</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-muted-foreground hover:bg-green-50 hover:text-green-500 transition-all"
                            >
                              <Share2 className="w-4 h-4" />
                              <span className="font-medium">Share</span>
                            </Button>
                          </div>

                          <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-6">
                            Join Activity
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Enhanced Load More */}
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 bg-transparent"
                  >
                    Load More Activities
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 lg:hidden shadow-2xl">
        <div className="flex items-center justify-around py-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 text-primary bg-primary/10 rounded-xl px-4 py-2"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Feed</span>
          </Button>
          <Link href="/activities">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col gap-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Activities</span>
            </Button>
          </Link>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col gap-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all relative"
              onClick={() => setNotificationOpen(!notificationOpen)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></span>
            </Button>
          </div>
          <Link href="/profile">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col gap-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-2 transition-all"
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">Profile</span>
            </Button>
          </Link>
        </div>
      </nav>

      <Button
        size="lg"
        className="fixed bottom-24 right-6 lg:hidden w-16 h-16 rounded-2xl bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-2 border-background z-50"
      >
        <Plus className="w-7 h-7" />
      </Button>
    </div>
  )
}
