import type { APIRoute } from "astro";
import { FlashcardsService } from "@/lib/services/flashcards.service";
import { getUser } from "@/lib/auth";

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Check authentication
    const user = await getUser({ locals });
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const flashcardsService = new FlashcardsService(locals.supabase);
    const flashcards = await flashcardsService.getFlashcards(user.id);

    return new Response(JSON.stringify(flashcards), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
