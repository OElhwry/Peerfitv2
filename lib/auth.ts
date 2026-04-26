/**
 * Server-side auth helpers.
 *
 * Centralises the try/catch boilerplate that previously lived in every
 * server component that needed an auth check. Keep these tiny — full
 * profile/notifications fetching belongs in dedicated helpers added when
 * pages need them.
 */

import { createClient } from "@/lib/supabase/server"

/**
 * Returns true if a user session exists. Best-effort — falls back to false
 * on any failure (network, cookie issues, missing env). Never throws.
 *
 * Use for top-bar variants and "signed in vs signed out" branches where
 * we don't actually need the user object.
 */
export async function getSignedIn(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return !!data.user
  } catch {
    return false
  }
}

/**
 * Full current-user payload for app-mode chrome (avatar in top bar,
 * notifications badge, etc.). Returns null when signed out OR when the
 * fetch fails — the caller should treat both cases the same.
 *
 * Two parallel fetches: profile + unread notification count. Keep the
 * shape minimal; bigger queries belong in their own page-level helpers.
 */
export type CurrentUser = {
  id: string
  email: string | null
  profile: {
    full_name: string | null
    avatar_url: string | null
  } | null
  unreadNotifications: number
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const [{ data: profile }, { count }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false),
    ])

    return {
      id: user.id,
      email: user.email ?? null,
      profile: profile ?? null,
      unreadNotifications: count ?? 0,
    }
  } catch {
    return null
  }
}
