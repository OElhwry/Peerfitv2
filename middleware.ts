import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type OnboardingProfile = {
  date_of_birth: string | null
  phone: string | null
  onboarding_complete: boolean | null
}

function getRequiredOnboardingStep(
  metadata: Record<string, unknown>,
  profile: OnboardingProfile | null
) {
  const acceptedTerms = typeof metadata.accepted_terms_at === 'string' && metadata.accepted_terms_at.length > 0
  const acceptedConsumerTerms =
    typeof metadata.accepted_consumer_terms_at === 'string' && metadata.accepted_consumer_terms_at.length > 0
  const pendingPhone = typeof metadata.pending_phone === 'string' && metadata.pending_phone.length > 0

  if (!acceptedTerms || !acceptedConsumerTerms) return 'terms'
  if (!profile?.date_of_birth) return 'dob'
  if (profile.onboarding_complete && profile.phone) return null
  if (pendingPhone) return 'verify-phone'
  return 'phone'
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const mode = request.nextUrl.searchParams.get('mode')
  const step = request.nextUrl.searchParams.get('step')

  const protectedRoutes = ['/feed', '/activities', '/profile', '/settings', '/requests']
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthEntry = pathname === '/login' || pathname === '/signup'

  let requiredOnboardingStep: string | null = null

  if (user && (isProtected || isAuthEntry)) {
    const metadata =
      user.user_metadata && typeof user.user_metadata === 'object'
        ? (user.user_metadata as Record<string, unknown>)
        : {}

    const { data: profile } = await supabase
      .from('profiles')
      .select('date_of_birth, phone, onboarding_complete')
      .eq('id', user.id)
      .maybeSingle()

    requiredOnboardingStep = getRequiredOnboardingStep(metadata, (profile as OnboardingProfile | null) ?? null)
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (isProtected && user && requiredOnboardingStep) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('mode', 'signup')
    url.searchParams.set('step', requiredOnboardingStep)
    return NextResponse.redirect(url)
  }

  const isCorrectOnboardingReturn =
    pathname === '/login' &&
    mode === 'signup' &&
    step !== null &&
    step === requiredOnboardingStep

  if (user && isAuthEntry && requiredOnboardingStep && !isCorrectOnboardingReturn) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('mode', 'signup')
    url.searchParams.set('step', requiredOnboardingStep)
    return NextResponse.redirect(url)
  }

  if (user && isAuthEntry && !requiredOnboardingStep) {
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
