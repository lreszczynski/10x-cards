import type { AstroGlobal } from 'astro';
import type { User } from '@supabase/supabase-js';

export async function getUser(context: AstroGlobal | { locals: { supabase: any; user?: User | null } }): Promise<User | null> {
  // If user is already in context.locals, return it
  if (context.locals.user) {
    return context.locals.user;
  }

  // Otherwise, try to get user from Supabase
  if (!context.locals.supabase) {
    console.error('Supabase client not found in context');
    return null;
  }

  try {
    const { data: { user }, error } = await context.locals.supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
} 