import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { FlashcardProposalDto, GenerationResponseDto } from "../../types";
import { createHash } from "crypto";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export class AIGenerationService {
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {}

  async generateFlashcards(sourceText: string, userId: string): Promise<GenerationResponseDto> {
    const startTime = Date.now();
    const textHash = this.calculateHash(sourceText);

    try {
      // 1. Create a new generation record
      const { data: generation, error: insertError } = await this.supabase
        .from("generations")
        .insert({
          user_id: userId,
          generated_count: 0,
          generation_duration: 0,
          model: "gpt-4",
          source_text_hash: textHash,
          source_text_length: sourceText.length
        })
        .select()
        .single();

      if (insertError || !generation) {
        throw new Error("Failed to create generation record");
      }

      // 2. Call mock AI service to generate flashcards
      const flashcards = await this.callAIService(sourceText);
      const generationDuration = Date.now() - startTime;

      /* // 3. Update generation record with results
      const { error: updateError } = await this.supabase
        .from("generations")
        .update({
          generated_count: flashcards.length,
          generation_duration: generationDuration,
          model: "gpt-4-mock"
        })
        .eq("id", generation.id);

      if (updateError) {
        throw new Error("Failed to update generation record");
      }

      // 4. Create flashcard proposals
      if (flashcards.length > 0) {
        const { error: flashcardsError } = await this.supabase
          .from("flashcards")
          .insert(
            flashcards.map(card => ({
              ...card,
              generation_id: generation.id,
              user_id: userId
            }))
          );

        if (flashcardsError) {
          console.error("Flashcard insert error:", flashcardsError);
          throw new Error(`Failed to create flashcard proposals: ${flashcardsError.message}`);
        }
      } */

      return {
        id: generation.id,
        generated_count: flashcards.length,
        created_at: generation.created_at,
        flashcards_proposals: flashcards
      };
    } catch (error) {
      // Log error and rethrow
      await this.logError(error);
      throw error;
    }
  }

  private async callAIService(sourceText: string): Promise<FlashcardProposalDto[]> {
    // Mock implementation that creates 3 flashcards based on text length
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    return [
      {
        id: 1,
        front: "What is the length of the source text?",
        back: `The text is ${sourceText.length} characters long`,
        source: "ai-full"
      },
      {
        id: 2,
        front: "What is the first word of the text?",
        back: sourceText.split(" ")[0] || "Empty text",
        source: "ai-full"
      },
      {
        id: 3,
        front: "How many words are in the text?",
        back: `${sourceText.split(" ").length} words`,
        source: "ai-full"
      }
    ];
  }

  private calculateHash(text: string): string {
    return createHash("md5")
      .update(text)
      .digest("hex");
  }

  private async logError(error: unknown): Promise<void> {
    try {
      await this.supabase
        .from("generation_error_logs")
        .insert({
          error_code: "GENERATION_ERROR",
          error_message: error instanceof Error ? error.message : "Unknown error",
          model: "gpt-4",
          source_text_hash: "",
          source_text_length: 0,
          user_id: DEFAULT_USER_ID
        });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }
} 