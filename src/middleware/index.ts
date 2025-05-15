import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "@/db/supabase.server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/callback",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request, redirect } = context;

  console.log("Request path:", url.pathname);
  console.log("Request method:", request.method);

  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Make supabase available to all routes
    context.locals.supabase = supabase;

    // Skip auth check for public paths
    if (PUBLIC_PATHS.includes(url.pathname)) {
      console.log("Skipping auth check for:", url.pathname);
      return next();
    }

    // Get user session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error in middleware:", error);
    }

    // For API routes, let them handle their own auth
    if (url.pathname.startsWith("/api/")) {
      return next();
    }

    // For non-API routes, redirect to login if no user
    if (!user) {
      console.log("No user found, redirecting to login");
      return redirect("/auth/login");
    }

    // Make user available to all routes
    context.locals.user = user;

    return next();
  } catch (err) {
    console.error("Middleware error:", err);
    return next();
  }
});
