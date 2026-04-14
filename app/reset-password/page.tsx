  "use client"

  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { createClient } from "@/lib/supabase/client"
  import { CheckCircle, Eye, EyeOff, Lock } from "lucide-react"
  import { useRouter } from "next/navigation"
  import { useEffect, useState } from "react"

  export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [sessionReady, setSessionReady] = useState(false)

    useEffect(() => {
      // Supabase delivers the recovery token via the URL hash fragment.
      // Calling getSession() processes it and establishes an active session.
      const supabase = createClient()
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setSessionReady(true)
        } else {
          setErrorMsg("Invalid or expired reset link. Please request a new one.")
        }
      })
    }, [])

    const isStrongPassword = (p: string) =>
      p.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(p)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setErrorMsg("")

      if (!isStrongPassword(password)) {
        setErrorMsg("Password must be at least 8 characters with uppercase, lowercase, and a number.")
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.")
        return
      }

      setIsLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      setIsLoading(false)

      if (error) {
        setErrorMsg(error.message)
      } else {
        setDone(true)
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center space-y-1 pb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-slate-800">Set New Password</CardTitle>
              <CardDescription className="text-slate-600">
                Choose a strong password for your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              { done ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-lg">Password updated!</p>
                    <p className="text-slate-600 text-sm mt-1">Redirecting you to sign in...</p>
                  </div>
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <form onSubmit={ handleSubmit } className="space-y-5">
                  { !sessionReady && !errorMsg && (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) }

                  { sessionReady && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                          New Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="password"
                            type={ showPassword ? "text" : "password" }
                            placeholder="At least 8 characters"
                            value={ password }
                            onChange={ (e) => setPassword(e.target.value) }
                            className="pl-10 pr-10 h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                            required
                          />
                          <button
                            type="button"
                            onClick={ () => setShowPassword(!showPassword) }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            { showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" /> }
                          </button>
                        </div>
                        { password && (
                          <p className={ `text-xs mt-1 font-medium ${isStrongPassword(password) ? "text-emerald-600" : "text-amber-600"}` }>
                            { isStrongPassword(password) ? "✓ Strong password" : "Use 8+ chars with uppercase, lowercase & number" }
                          </p>
                        ) }
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Repeat your new password"
                            value={ confirmPassword }
                            onChange={ (e) => setConfirmPassword(e.target.value) }
                            className="pl-10 h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                            required
                          />
                        </div>
                        { confirmPassword && (
                          <p className={ `text-xs mt-1 font-medium ${password === confirmPassword ? "text-emerald-600" : "text-red-500"}` }>
                            { password === confirmPassword ? "✓ Passwords match" : "Passwords do not match" }
                          </p>
                        ) }
                      </div>
                    </>
                  ) }

                  { errorMsg && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      { errorMsg }{ " " }
                      { errorMsg.includes("expired") && (
                        <a href="/forgot-password" className="underline font-medium">Request a new link</a>
                      ) }
                    </div>
                  ) }

                  { sessionReady && (
                    <Button
                      type="submit"
                      disabled={ isLoading }
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      { isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        "Update Password"
                      ) }
                    </Button>
                  ) }
                </form>
              ) }
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
