import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

let cachedBotClient: SupabaseClient | null = null
let cachedBotClientExpiry = 0

export const createTelegramBotClient = async (): Promise<SupabaseClient> => {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // 1. Prefer Service Role Key if configured (zero network auth round-trip)
  if (serviceRoleKey) {
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  // 2. Reuse cached admin session if still valid (45-minute TTL)
  const now = Date.now()
  if (cachedBotClient && now < cachedBotClientExpiry) {
    return cachedBotClient
  }

  const supabase = createSupabaseClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
  await supabase.auth.signInWithPassword({
    email: '998955137776@promax.uz',
    password: 'Admin123!',
  })

  cachedBotClient = supabase
  cachedBotClientExpiry = now + 45 * 60 * 1000
  return supabase
}
