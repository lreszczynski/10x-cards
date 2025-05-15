import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.server";

export const GET: APIRoute = async ({ url, cookies, request }) => {
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/generate";

  if (!code) {
    return new Response(
      JSON.stringify({
        error: "No code provided",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

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

  return new Response(null, {
    status: 302,
    headers: {
      Location: next,
    },
  });
};
