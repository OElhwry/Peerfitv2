"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, ArrowRight, Eye, EyeOff, MapPin, Calendar, Clock, Phone, Camera } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const sports = [
  { id: "football", name: "Football", icon: "⚽" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "running", name: "Running", icon: "🏃" },
  { id: "cycling", name: "Cycling", icon: "🚴" },
  { id: "swimming", name: "Swimming", icon: "🏊" },
  { id: "badminton", name: "Badminton", icon: "🏸" },
  { id: "cricket", name: "Cricket", icon: "🏏" },
  { id: "rugby", name: "Rugby", icon: "🏉" },
  { id: "golf", name: "Golf", icon: "⛳" },
  { id: "volleyball", name: "Volleyball", icon: "🏐" },
  { id: "squash", name: "Squash", icon: "🎾" },
]

const skillLevels = ["Beginner", "Intermediate", "Advanced"]
const availabilityOptions = ["Weekday Mornings", "Weekday Evenings", "Weekend Mornings", "Weekend Evenings"]

type SignupForm = {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  location: string
  dateOfBirth: string
  profilePicture: File | null
  selectedSports: string[]
  skillLevels: Record<string, string>
  availability: string[]
  agreeToTerms: boolean
}

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [validationErrors, setValidationErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // ✅ Tell TypeScript what formData looks like
  const [formData, setFormData] = useState<SignupForm>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    dateOfBirth: "",
    profilePicture: null,
    selectedSports: [],
    skillLevels: {},
    availability: [],
    agreeToTerms: false,
  })




const handleGoogleSignup = async () => {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

const handleAvatarChange = (file: File | null) => {
  handleInputChange("profilePicture", file)
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  } else {
    setAvatarPreview(null)
  }
}

const handleSignup = async () => {
  const supabase = createClient()
  try {
    const cleanEmail = formData.email.trim().toLowerCase()

    // 1. Create auth user — trigger auto-creates the profile row
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: formData.password,
      options: { data: { full_name: formData.fullName } },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        alert("⚠️ This email is already registered. Please log in instead.")
      } else {
        alert("⚠️ Signup failed: " + error.message)
      }
      return
    }

    const user = data.user
    if (!user) {
      alert("⚠️ Something went wrong — no user returned.")
      return
    }

    // 2. Update the auto-created profile with name, location, and mark onboarding done
    await supabase
      .from("profiles")
      .update({
        full_name: formData.fullName,
        location: formData.location || null,
        onboarding_complete: true,
      })
      .eq("id", user.id)

    // 3. Save sports preferences — look up DB integer IDs by sport name
    if (formData.selectedSports.length > 0) {
      const sportNames = formData.selectedSports
        .map((id) => sports.find((s) => s.id === id)?.name)
        .filter(Boolean) as string[]

      const { data: dbSports } = await supabase
        .from("sports")
        .select("id, name")
        .in("name", sportNames)

      if (dbSports && dbSports.length > 0) {
        const userSportsData = dbSports.map((dbSport) => {
          const frontendId = sports.find((s) => s.name === dbSport.name)?.id
          return {
            user_id: user.id,
            sport_id: dbSport.id,
            skill_level: (frontendId && formData.skillLevels[frontendId]) || "Beginner",
          }
        })
        await supabase.from("user_sports").insert(userSportsData)
      }
    }

    router.push("/feed")
  } catch (err: any) {
    console.error("Signup failed:", err)
    alert("❌ Unexpected error: " + err.message)
  }
}




  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const validateField = (field: string, value: string) => {
    let error = ""

    switch (field) {
      case "fullName":
        if (!value.trim()) {
          error = "Full name is required"
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters"
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = "Name can only contain letters and spaces"
        }
        break

      case "email":
        if (!value.trim()) {
          error = "Email is required"
        } else if (!value.includes("@")) {
          error = "Email must contain @"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address"
        }
        break

      case "password":
        if (!value) {
          error = "Password is required"
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "Password must contain uppercase, lowercase, and number"
        }
        break

      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password"
        } else if (value !== formData.password) {
          error = "Passwords do not match"
        }
        break
    }

    setValidationErrors((prev) => ({ ...prev, [field]: error }))
    return error === ""
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (["fullName", "email", "password", "confirmPassword"].includes(field)) {
      validateField(field, value)

      // Also validate confirm password when password changes
      if (field === "password" && formData.confirmPassword) {
        validateField("confirmPassword", formData.confirmPassword)
      }
    }
  }

  const handleSportToggle = (sportId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sportId)
        ? prev.selectedSports.filter((id) => id !== sportId)
        : [...prev.selectedSports, sportId],
    }))
  }

  const handleSkillLevelChange = (sportId: string, level: string) => {
    setFormData((prev) => ({
      ...prev,
      skillLevels: { ...prev.skillLevels, [sportId]: level },
    }))
  }

  const handleAvailabilityToggle = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter((a) => a !== option)
        : [...prev.availability, option],
    }))
  }

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 1:
        const hasValidName = formData.fullName.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(formData.fullName.trim())
        const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        const hasValidPassword =
          formData.password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
        const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
        const noErrors =
          !validationErrors.fullName &&
          !validationErrors.email &&
          !validationErrors.password &&
          !validationErrors.confirmPassword

        return hasValidName && hasValidEmail && hasValidPassword && passwordsMatch && noErrors
      case 2:
        return true // Optional step
      case 3:
        return formData.selectedSports.length > 0
      case 4:
        return formData.agreeToTerms
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceedFromStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Create Your Account
              </h2>
              <p className="text-muted-foreground text-lg">
                Join the PeerFit community and start connecting with fellow athletes
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base bg-white hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-400 hover:text-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md group"
              type="button"
              onClick={handleGoogleSignup}
            >
              <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`h-12 mt-2 border-2 transition-colors ${
                    validationErrors.fullName
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                      : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  }`}
                />
                {validationErrors.fullName && (
                  <p className="text-red-500 text-sm mt-1 font-medium">{validationErrors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-12 mt-2 border-2 transition-colors ${
                    validationErrors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                      : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1 font-medium">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="h-12 pl-10 border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`h-12 pr-10 border-2 transition-colors ${
                      validationErrors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                        : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-emerald-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1 font-medium">{validationErrors.password}</p>
                )}
                {!validationErrors.password && formData.password && (
                  <p className="text-emerald-600 text-sm mt-1 font-medium">✓ Strong password requirements met</p>
                )}
                {!formData.password && (
                  <p className="text-gray-500 text-sm mt-1">
                    Must be 8+ characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`h-12 mt-2 border-2 transition-colors ${
                    validationErrors.confirmPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                      : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  }`}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 font-medium">{validationErrors.confirmPassword}</p>
                )}
                {!validationErrors.confirmPassword &&
                  formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <p className="text-emerald-600 text-sm mt-1 font-medium">✓ Passwords match</p>
                  )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Personalize Your Profile
              </h2>
              <p className="text-muted-foreground text-lg">Help others connect with you more easily</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
                  Location
                </Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="City or postcode"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="h-12 pl-10 border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 transition-colors"
                  />
                </div>
                <p className="text-sm text-emerald-600 mt-1 font-medium">We'll show you activities nearby</p>
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">
                  Date of Birth
                </Label>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="h-12 pl-10 border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Profile Picture</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Avatar className="w-20 h-20 border-2 border-emerald-200 shrink-0">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Preview" />
                    ) : (
                      <AvatarFallback className="bg-emerald-50 text-emerald-400 text-2xl">
                        {formData.fullName.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 rounded-lg px-4 py-3 text-sm text-emerald-700 font-medium transition-all w-full justify-center"
                    >
                      <Camera className="h-4 w-4" />
                      {avatarPreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => handleAvatarChange(null)}
                        className="text-xs text-red-500 hover:text-red-700 mt-1 w-full text-center"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      People with photos get 3x more invites!
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Choose Your Sports
              </h2>
              <p className="text-muted-foreground text-lg">Select the activities you're interested in</p>
            </div>

            <div>
              <Label className="text-base font-semibold text-gray-700">Sports & Activities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {sports.map((sport) => (
                  <div
                    key={sport.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      formData.selectedSports.includes(sport.id)
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-emerald-300"
                    }`}
                    onClick={() => handleSportToggle(sport.id)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{sport.icon}</div>
                      <div className="text-sm font-semibold text-gray-700">{sport.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formData.selectedSports.length > 0 && (
              <div>
                <Label className="text-base font-semibold text-gray-700">Skill Levels</Label>
                <div className="space-y-3 mt-4">
                  {formData.selectedSports.map((sportId) => {
                    const sport = sports.find((s) => s.id === sportId)
                    return (
                      <div
                        key={sportId}
                        className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{sport?.icon}</span>
                          <span className="font-semibold text-gray-700">{sport?.name}</span>
                        </div>
                        <div className="flex gap-2">
                          {skillLevels.map((level) => (
                            <Badge
                              key={level}
                              variant={formData.skillLevels[sportId] === level ? "default" : "outline"}
                              className={`cursor-pointer transition-all duration-200 ${
                                formData.skillLevels[sportId] === level
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                              }`}
                              onClick={() => handleSkillLevelChange(sportId, level)}
                            >
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <Label className="text-base font-semibold text-gray-700">Availability (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {availabilityOptions.map((option) => (
                  <div
                    key={option}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      formData.availability.includes(option)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-emerald-300"
                    }`}
                    onClick={() => handleAvailabilityToggle(option)}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-gray-700">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Almost There!
              </h2>
              <p className="text-muted-foreground text-lg">Review your information and create your account</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="font-semibold text-gray-800">{formData.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="font-semibold text-gray-800">{formData.email}</span>
              </div>
              {formData.location && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Location:</span>
                  <span className="font-semibold text-gray-800">{formData.location}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Sports:</span>
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {formData.selectedSports.length > 0 ? (
                    formData.selectedSports.slice(0, 3).map((sportId) => {
                      const sport = sports.find((s) => s.id === sportId)
                      return (
                        <Badge key={sportId} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                          {sport?.name}
                        </Badge>
                      )
                    })
                  ) : (
                    <span className="text-gray-500 text-sm">None selected</span>
                  )}
                  {formData.selectedSports.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                      +{formData.selectedSports.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl hover:border-emerald-300 transition-all duration-200">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                  className="mt-1 h-5 w-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-2 border-emerald-400 shadow-sm"
                />
                <div className="grid gap-3 leading-none">
                  <Label htmlFor="terms" className="text-base font-bold text-gray-800 cursor-pointer leading-relaxed">
                    I agree to the Terms & Conditions and Privacy Policy
                  </Label>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-emerald-600 font-semibold text-emerald-700">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-emerald-600 font-semibold text-emerald-700">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PeerFit
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-3 font-medium">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3 bg-gray-200" />
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-white border-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep(currentStep)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSignup}
                  disabled={!canProceedFromStep(currentStep)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create My Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold transition-colors"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}
