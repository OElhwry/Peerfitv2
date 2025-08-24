import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Calendar, Star, Play, UserPlus, Search, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/peerfit-logo.png"
                alt="PeerFit Logo"
                width={100}
                height={100}
                className="w-25 h-25 object-contain"
              />
              <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                PeerFit
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16 px-4">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Join Our Growing Community
              </div>

              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Find People.
                </span>
                <br />
                <span className="text-foreground">Play Sports.</span>
                <br />
                <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                  Stay Active.
                </span>
              </h1>

              <p
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Connect with teammates and partners for any sport, anytime, anywhere. Join a community of active people
                and never play alone again.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Join Now - It's Free!
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="lg"
                  className="group relative overflow-hidden bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 text-foreground hover:text-primary text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Activities
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full border-2 border-background"></div>
                    <div className="w-8 h-8 bg-accent/20 rounded-full border-2 border-background"></div>
                    <div className="w-8 h-8 bg-secondary/20 rounded-full border-2 border-background"></div>
                  </div>
                  <span className="ml-2">Active members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span>4.9/5 rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔒 100% Free</span>
                </div>
              </div>
            </div>

            {/* Right side - Visual element */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 backdrop-blur-sm border border-primary/10">
                {/* Mock activity cards floating */}
                <div className="space-y-4">
                  <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-primary/10 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Football in Hyde Park</p>
                        <p className="text-xs text-muted-foreground">3/11 players</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Today 6PM
                    </Badge>
                  </div>

                  <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-accent/10 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Tennis Partner Needed</p>
                        <p className="text-xs text-muted-foreground">1/2 players</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Tomorrow 10AM
                    </Badge>
                  </div>

                  <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-secondary/10 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Morning Run Group</p>
                        <p className="text-xs text-muted-foreground">5/10 runners</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Every Wed 7AM
                    </Badge>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent/20 rounded-full animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            How PeerFit Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                1. Post an Activity
              </h3>
              <p className="text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Share what sport you want to play, when, and where. Whether it's tennis, football, running, or any
                activity.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                2. Find Teammates
              </h3>
              <p className="text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Discover people nearby who want to play the same sport. Filter by skill level, location, and
                availability.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                3. Play & Connect
              </h3>
              <p className="text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Meet up, play your sport, and build lasting friendships with people who share your passion for staying
                active.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Preview Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            See What's Happening
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Get a taste of the activities happening in your area
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">Football</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    3/11 players
                  </div>
                </div>
                <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  5-a-side Football in Hyde Park
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  Hyde Park, London
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Today, 6:00 PM
                </div>
                <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Looking for 8 more players for a friendly match. All skill levels welcome!
                </p>
                <Button className="w-full">Join Game</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">Tennis</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    1/2 players
                  </div>
                </div>
                <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Tennis Doubles Partner Needed
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  Wimbledon Courts, London
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Tomorrow, 10:00 AM
                </div>
                <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Intermediate level player looking for doubles partner. Let's have some fun!
                </p>
                <Button className="w-full">Join Game</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">Running</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    5/10 runners
                  </div>
                </div>
                <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Morning Run Group
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  Regent's Park, London
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Every Wednesday, 7:00 AM
                </div>
                <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Weekly 5K run with a friendly group. Perfect pace for beginners to intermediate.
                </p>
                <Button className="w-full">Join Group</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Why Choose PeerFit?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Stay Healthy
              </h3>
              <p className="text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                More motivation when you're not alone. Find accountability partners who keep you active and engaged.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Meet People
              </h3>
              <p className="text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Expand your social circle with like-minded people who share your passion for sports and fitness.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Play Your Way
              </h3>
              <p className="text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Any sport, any time, anywhere. From casual games to competitive matches, find exactly what you're
                looking for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            What Our Community Says
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  "I finally found a regular tennis partner through PeerFit. We've been playing twice a week for months
                  now!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold">S</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      Sarah M.
                    </p>
                    <p className="text-sm text-muted-foreground">Tennis Player</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  "Great way to meet new people and stay active. The football group I joined has become like family!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold">M</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      Mike R.
                    </p>
                    <p className="text-sm text-muted-foreground">Football Enthusiast</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  "Perfect for someone new to the city. I've made so many friends through the running groups!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold">A</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      Alex K.
                    </p>
                    <p className="text-sm text-muted-foreground">Runner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Ready to Get Active?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Join thousands of people who are staying active and making friends through sports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Sign Up Now - It's Free!
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/peerfit-logo.png"
                  alt="PeerFit Logo"
                  width={100}
                  height={100}
                  className="w-20 h-20 object-contain"
                />
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  PeerFit
                </h3>
              </div>
              <p className="text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Find people. Play sports. Stay active.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Product
              </h4>
              <ul className="space-y-2 text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Company
              </h4>
              <ul className="space-y-2 text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                <li>
                  <a href="#" className="hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Legal
              </h4>
              <ul className="space-y-2 text-muted-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div
            className="border-t border-border mt-8 pt-8 text-center text-muted-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <p>&copy; 2024 PeerFit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
