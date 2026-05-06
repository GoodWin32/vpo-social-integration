import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code      = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type      = searchParams.get('type')  // 'recovery' | 'signup' | etc.

  const supabase = await createClient()

  // PKCE flow — code from email link
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Password-reset confirmation → go to update-password form
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // OTP / token_hash flow (older Supabase email templates)
  if (tokenHash && type) {
    // token_hash flow only accepts email OTP types
    const emailType = type as 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email'
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: emailType,
    })
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
