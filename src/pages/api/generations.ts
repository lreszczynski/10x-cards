import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateGenerationCommand, GenerationResponseDto } from "../../types";
import { AIGenerationService } from "../../lib/services/ai-generation.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

// Schema for validating the request body
const createGenerationSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must not exceed 10000 characters")
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { supabase } = locals;

    // Parse and validate request body
    const body = await request.json();
    const result = createGenerationSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request data", 
          details: result.error.errors 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize AI service and generate flashcards
    const aiService = new AIGenerationService(supabase);

    try {
      const generationResult = await aiService.generateFlashcards(
        result.data.source_text,
        DEFAULT_USER_ID
      );

      return new Response(
        JSON.stringify(generationResult),
        { 
          status: 201,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (genError) {
      console.error("Flashcard generation error:", genError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate flashcards",
          message: genError instanceof Error ? genError.message : "Unknown generation error",
          details: genError instanceof Error ? genError.stack : undefined
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error processing generation request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 