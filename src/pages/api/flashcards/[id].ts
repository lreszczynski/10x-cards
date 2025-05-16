import type { APIRoute } from "astro";
import { z } from "zod";
import { FlashcardsService } from "@/lib/services/flashcards.service";
import { getUser } from "@/lib/auth";
import { logger } from "../../../utils/logger";

// Validation schema for updating a flashcard
const updateFlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
});

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Check authentication
    const user = await getUser({ locals });
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const flashcardsService = new FlashcardsService(locals.supabase);
    const flashcard = await flashcardsService.getFlashcard(user.id, id);

    if (!flashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error fetching flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    // Check authentication
    const user = await getUser({ locals });
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

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
    const updatedFlashcard = await flashcardsService.updateFlashcard(user.id, id, validationResult.data);

    if (!updatedFlashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error updating flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check authentication
    const user = await getUser({ locals });
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const flashcardsService = new FlashcardsService(locals.supabase);
    const deleted = await flashcardsService.deleteFlashcard(user.id, id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Flashcard deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error deleting flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
