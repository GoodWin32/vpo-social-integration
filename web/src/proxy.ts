import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  const { pathname } = request.nextUrl

  const protectedPrefixes = ['/dashboard', '/profile', '/communities', '/events', '/resources', '/chat', '/notifications', '/admin']
  const authPages = ['/login', '/signup', '/forgot-password']

  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))
  const isAuthPage  = authPages.some(p => pathname.startsWith(p))

  // If env vars are missing, allow public pages and redirect protected pages to login
  if (!supabaseUrl || !supabaseKey) {
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user && isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch {
    // If Supabase auth fails, protect sensitive routes but allow public access
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
