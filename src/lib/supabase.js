import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Singleton pattern — prevents duplicate client creation in React StrictMode
// which causes NavigatorLockAcquireTimeoutError on the auth token lock
if (!globalThis.__supabaseClient) {
  globalThis.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = globalThis.__supabaseClient