import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          email: data.user.email ?? null,
          full_name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
          last_signed_in_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
