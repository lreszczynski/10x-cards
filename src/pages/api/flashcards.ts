import type { APIRoute } from "astro";
import { z } from "zod";
import { FlashcardsService } from "../../lib/services/flashcards.service";
import { getUser } from "../../lib/auth";

// Disable static prerendering for this endpoint
export const prerender = false;

// Validation schemas
const flashcardBaseSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
});

const manualFlashcardSchema = flashcardBaseSchema.extend({
  source: z.literal("manual"),
  generation_id: z.literal(null),
});

const aiFlashcardSchema = flashcardBaseSchema.extend({
  source: z.union([z.literal("ai-full"), z.literal("ai-edited")]),
  generation_id: z.number().positive().int(),
});

const flashcardSchema = z.union([manualFlashcardSchema, aiFlashcardSchema]);

const createFlashcardsSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check authentication
    const user = await getUser({ locals });
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardsService = new FlashcardsService(locals.supabase);
    const createdFlashcards = await flashcardsService.createFlashcards(user.id, validationResult.data.flashcards);

    return new Response(JSON.stringify(createdFlashcards), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing flashcards creation:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
