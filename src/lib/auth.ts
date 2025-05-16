import type { AstroGlobal } from "astro";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger";

export async function getUser(
  context: AstroGlobal | { locals: { supabase: SupabaseClient; user?: User | null } }
): Promise<User | null> {
  // If user is already in context.locals, return it
  if (context.locals.user) {
    return context.locals.user;
  }

  // Otherwise, try to get user from Supabase
  if (!context.locals.supabase) {
    logger.error("Supabase client not found in context");
    return null;
  }

  try {
    const {
      data: { user },
      error,
    } = await context.locals.supabase.auth.getUser();

    if (error) {
      logger.error("Error getting user:", error);
      return null;
    }

    return user;
  } catch (error) {
    logger.error("Error in getUser:", error);
    return null;
  }
}
