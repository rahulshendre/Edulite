import { createClient } from '@supabase/supabase-js'

const url = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : ''
const anonKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : ''

export const supabase = url && anonKey ? createClient(url, anonKey) : null

export function isSupabaseConfigured() {
  return !!supabase
}
