"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  MapPin,
  Calendar,
  Bell,
  User,
  Settings,
  Trophy,
  Activity,
  Star,
  Edit,
  Home,
  TrendingUp,
  Clock,
  Shield,
  LogOut,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation Header */}
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-primary bg-primary/10 rounded-xl px-4 py-2"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Profile</span>
                </Button>
              </nav>
            </div>

            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded-xl p-2 transition-colors"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src="/abstract-geometric-shapes.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Active member</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>

              {profileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-primary bg-primary/10">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
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
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="mb-8 bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent h-32 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <CardContent className="p-8 -mt-16 relative">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="relative flex-shrink-0">
                <Avatar className="w-32 h-32 ring-4 ring-background shadow-xl">
                  <AvatarImage src="/abstract-geometric-shapes.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-4xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      John Doe
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">London, UK</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">Joined March 2024</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="font-medium">Verified Member</span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg px-6">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
                  Passionate about staying active and meeting new people through sports. Love playing tennis and
                  football! Always looking for new challenges and great teammates.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-medium">
                    ⚽ Football
                  </Badge>
                  <Badge className="bg-accent/10 text-accent border-accent/20 px-3 py-1 text-sm font-medium">
                    🎾 Tennis
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1 text-sm font-medium">
                    🏃 Running
                  </Badge>
                  <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 px-3 py-1 text-sm font-medium">
                    🏀 Basketball
                  </Badge>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="text-3xl font-bold text-primary mb-1">12</div>
                    <div className="text-sm font-medium text-muted-foreground">Activities Joined</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-xl border border-accent/10">
                    <div className="text-3xl font-bold text-accent mb-1">8</div>
                    <div className="text-sm font-medium text-muted-foreground">Activities Hosted</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">4.9</div>
                    <div className="text-sm font-medium text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <div className="text-3xl font-bold text-blue-600 mb-1">24</div>
                    <div className="text-sm font-medium text-muted-foreground">Hours Played</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="activities" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-background/60 backdrop-blur-xl border border-border/50 shadow-lg h-14">
            <TabsTrigger
              value="activities"
              className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              My Activities
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    Upcoming Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">Tennis Match</h4>
                      <Badge className="bg-primary text-primary-foreground">Tomorrow</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Wimbledon Courts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">10:00 AM</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-accent/5 to-blue-500/5 rounded-xl border border-accent/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">Football Match</h4>
                      <Badge className="bg-accent text-accent-foreground">Saturday</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Hyde Park</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">6:00 PM</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-accent" />
                    </div>
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">Morning Run</h4>
                      <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Regent's Park</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Yesterday</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">Basketball Game</h4>
                      <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Hackney Courts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Last Week</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  Activity Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Monthly Goal</span>
                      <span className="text-sm font-bold text-primary">8/10 activities</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Weekly Streak</span>
                      <span className="text-sm font-bold text-accent">3 weeks</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800">Your Achievements</CardTitle>
                <p className="text-slate-600">Unlock badges by staying active and engaging with the community</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center p-8 bg-gradient-to-br from-primary to-accent rounded-2xl border border-border">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Active Player</h3>
                    <p className="text-sm text-muted-foreground mb-3">Joined 10+ activities</p>
                    <Badge className="bg-primary text-white">Earned</Badge>
                  </div>
                  <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-border">
                    <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Top Rated</h3>
                    <p className="text-sm text-muted-foreground mb-3">4.9+ star rating</p>
                    <Badge className="bg-yellow-500 text-white">Earned</Badge>
                  </div>
                  <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-border">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Community Builder</h3>
                    <p className="text-sm text-muted-foreground mb-3">Hosted 5+ activities</p>
                    <Badge className="bg-blue-600 text-white">Earned</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800">Reviews & Feedback</CardTitle>
                <p className="text-slate-600">See what other players are saying about you</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 ring-2 ring-primary">
                      <AvatarFallback className="bg-primary text-white font-semibold">SC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-slate-800">Sarah Chen</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        "Great tennis partner! Very reliable and fun to play with. John has excellent technique and is
                        always encouraging to newer players. Looking forward to our next match!"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 ring-2 ring-primary">
                      <AvatarFallback className="bg-accent text-white font-semibold">MR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-slate-800">Mike Rodriguez</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">1 week ago</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        "Fantastic football player and great team spirit! John organized an amazing match and made sure
                        everyone felt included. Highly recommend!"
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">Privacy Settings</CardTitle>
                  <p className="text-slate-600">Control who can see your information</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">Show my location to others</h4>
                      <p className="text-sm text-slate-600">Allow others to see your general location</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary/90 bg-transparent"
                    >
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">Allow activity invitations</h4>
                      <p className="text-sm text-slate-600">Receive invites from other players</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary/90 bg-transparent"
                    >
                      Enabled
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">Notification Preferences</CardTitle>
                  <p className="text-slate-600">Choose how you want to be notified</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">Email notifications</h4>
                      <p className="text-sm text-slate-600">Receive updates via email</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary/90 bg-transparent"
                    >
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">Push notifications</h4>
                      <p className="text-sm text-slate-600">Get instant notifications on your device</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary/90 bg-transparent"
                    >
                      Enabled
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
