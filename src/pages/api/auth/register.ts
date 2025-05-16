import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.server";
import { logger } from "../../../utils/logger";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if user needs to confirm their email
    const needsEmailConfirmation = data.user && !data.user.confirmed_at;

    return new Response(
      JSON.stringify({
        user: data.user,
        needsEmailConfirmation,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    logger.error("Registration error:", err);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred during registration",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
