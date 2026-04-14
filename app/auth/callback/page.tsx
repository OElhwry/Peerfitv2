  import { redirect } from "next/navigation"

  type CallbackPageProps = {
    searchParams?: Promise<{
      code?: string
      token_hash?: string
      type?: string
      next?: string
    }>
  }

  export const dynamic = "force-dynamic"

  export default async function AuthCallbackPage({ searchParams }: CallbackPageProps) {
    const params = await searchParams
    const query = new URLSearchParams()

    if (params?.code) query.set("code", params.code)
    if (params?.token_hash) query.set("token_hash", params.token_hash)
    if (params?.type) query.set("type", params.type)
    if (params?.next) query.set("next", params.next)

    redirect(`/auth/callback/exchange${query.size ? `?${query.toString()}` : ""}`)
  }
