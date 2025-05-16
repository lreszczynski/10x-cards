import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.server";
import { logger } from "../../../utils/logger";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  logger.info("Login request received");

  try {
    // Validate content type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      logger.error("Invalid content type:", contentType);
      return new Response(
        JSON.stringify({
          error: "Content-Type must be application/json",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    logger.info("Request body received:", { email: body.email, hasPassword: !!body.password });

    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({
          error: "Email and password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    logger.info("Attempting Supabase auth...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      logger.error("Supabase auth error:", error);
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

    // Check if we have a user in the response
    if (!data.user) {
      logger.error("No user data in successful response");
      return new Response(
        JSON.stringify({
          error: "Authentication failed",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    logger.info("Login successful for:", data.user.email);

    // Return minimal user data
    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    logger.error("Login error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
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
