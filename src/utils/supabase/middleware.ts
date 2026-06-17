import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
 let response = NextResponse.next({
 request: {
 headers: request.headers,
 },
 })

 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 getAll() {
 return request.cookies.getAll()
 },
 setAll(cookiesToSet) {
 cookiesToSet.forEach(({ name, value, options }) =>
 request.cookies.set(name, value)
 )
 response = NextResponse.next({
 request,
 })
 cookiesToSet.forEach(({ name, value, options }) =>
 response.cookies.set(name, value, options)
 )
 },
 },
 }
 )

 const {
 data: { user },
 } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/tg') &&
    !request.nextUrl.pathname.startsWith('/api/telegram') &&
    !request.nextUrl.pathname.startsWith('/register')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and tries to access login/register/root, redirect to dashboard
  if (user && (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

 return response
}
