import type { APIRoute } from 'astro'
import { supabaseClient } from '@/db/supabase.client'

export const POST: APIRoute = async ({ redirect }) => {
  await supabaseClient.auth.signOut()
  return redirect('/auth/login')
} 