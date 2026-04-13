import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type CallbackPageProps = {
  searchParams?: Promise<{
    code?: string
    token_hash?: string
    type?: string
    next?: string
  }>
}

export default async function AuthCallbackPage({ searchParams }: CallbackPageProps) {
  const params = await searchParams
  const code = params?.code
  const tokenHash = params?.token_hash
  const type = params?.type
  const next = params?.next ?? "/feed"

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect(next)
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "recovery" | "invite" | "email_change",
    })

    if (!error) {
      redirect(next)
    }
  }

  redirect("/login?error=auth_callback_error")
}
