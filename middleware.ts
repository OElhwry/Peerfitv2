import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Refresh session — must be called before any redirect checks
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const mode = request.nextUrl.searchParams.get('mode')
  const step = request.nextUrl.searchParams.get('step')

  const protectedRoutes = ['/feed', '/activities', '/profile', '/settings', '/requests']
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  // Unauthenticated user hitting a protected route → send to login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated user hitting login/signup → send to feed
  const isOnboardingReturn =
    pathname === '/login' &&
    mode === 'signup' &&
    step !== null

  if (user && (pathname === '/login' || pathname === '/signup') && !isOnboardingReturn) {
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
