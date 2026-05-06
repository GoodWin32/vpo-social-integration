import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // Derive origin from the incoming request so it works on any domain (prod, preview, localhost)
  return NextResponse.redirect(new URL('/login', request.url), { status: 302 })
}
