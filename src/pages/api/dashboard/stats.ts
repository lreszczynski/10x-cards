import type { APIRoute } from "astro";
import { getUser } from "@/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    // First check if we have a Supabase client
    if (!locals.supabase) {
      return new Response(JSON.stringify({ error: "Database client not initialized" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Then check authentication
    const user = await getUser({ locals });
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch flashcards statistics
    const { data: flashcards, error: dbError } = await locals.supabase
      .from("flashcards")
      .select("source")
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    const stats = {
      totalFlashcards: flashcards?.length || 0,
      aiGeneratedCount: flashcards?.filter((f) => f.source === "ai-full").length || 0,
      aiEditedCount: flashcards?.filter((f) => f.source === "ai-edited").length || 0,
      manualCount: flashcards?.filter((f) => f.source === "manual").length || 0,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch dashboard statistics" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
