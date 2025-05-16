import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { FlashcardProposalDto, GenerationResponseDto } from "../../types";
import { createHash } from "crypto";
import { OpenRouterService } from "./openrouter.service";
import { logger } from "../../utils/logger";

export class AIGenerationService {
  private readonly openRouter: OpenRouterService;

  constructor(
    private readonly supabase: SupabaseClient<Database>,
    openRouterConfig: {
      apiKey?: string;
      apiEndpoint?: string;
      defaultModel?: string;
    }
  ) {
    const openrouterApiKey = import.meta.env.OPENROUTER_API_KEY;
    this.openRouter = new OpenRouterService();
    this.openRouter.initialize({
      apiKey: openRouterConfig.apiKey || openrouterApiKey || "",
      apiEndpoint: openRouterConfig.apiEndpoint || "https://openrouter.ai/api/v1/chat/completions",
      defaultModel: openRouterConfig.defaultModel || "meta-llama/llama-3.3-70b-instruct:free",
      defaultSystemMessage: this.getSystemPrompt(),
      maxRetries: 3,
    });
  }

  private getSystemPrompt(): string {
    return `You are an expert in creating educational flashcards. Your task is to analyze the provided text and create effective flashcards that help users learn and retain the key information.

Rules for flashcard creation:
1. Each flashcard should focus on a single concept or piece of information
2. Front of the card should be a clear, specific question
3. Back of the card should contain a concise, accurate answer
4. Avoid creating cards that are too complex or contain multiple concepts
5. Ensure the information is accurate and directly derived from the source text

Your response must be valid JSON in the following format:
{
  "flashcards": [
    {
      "front": "question text",
      "back": "answer text"
    }
  ]
}
Your response should only contain the json and nothing else  
`;
  }

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
          model: this.openRouter.modelName,
          source_text_hash: textHash,
          source_text_length: sourceText.length,
        })
        .select()
        .single();

      if (insertError || !generation) {
        throw new Error("Failed to create generation record");
      }

      // 2. Generate flashcards using OpenRouter
      const flashcards = await this.callAIService(sourceText);
      const generationDuration = Date.now() - startTime;

      // 3. Update generation record with results
      const { error: updateError } = await this.supabase
        .from("generations")
        .update({
          generated_count: flashcards.length,
          generation_duration: generationDuration,
          model: this.openRouter.modelName,
        })
        .eq("id", generation.id);

      if (updateError) {
        throw new Error("Failed to update generation record");
      }

      /* // 4. Create flashcard proposals
      if (flashcards.length > 0) {
        const { error: flashcardsError } = await this.supabase.from("flashcards").insert(
          flashcards.map(({id, ...card}) => ({
            ...card,
            generation_id: generation.id,
            user_id: userId,
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
        flashcards_proposals: flashcards,
      };
    } catch (error) {
      // Log error and rethrow
      await this.logError(error, userId);
      throw error;
    }
  }

  private async callAIService(sourceText: string): Promise<FlashcardProposalDto[]> {
    try {
      const response = await this.openRouter.sendChatPrompt(this.getSystemPrompt(), sourceText, {
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
      });

      logger.info("response:", response);
      const parsedResponse = this.extractAndParseJson(response.message);
      logger.info("Parsed response:", parsedResponse);

      if (!parsedResponse.flashcards || !Array.isArray(parsedResponse.flashcards)) {
        throw new Error("Invalid response format from AI service");
      }

      return parsedResponse.flashcards.map((card: { front: string; back: string }, index: number) => ({
        id: index,
        front: card.front,
        back: card.back,
        source: "ai-full",
      }));
    } catch (error) {
      logger.error("Error calling AI service:", error);
      throw error;
    }
  }

  private calculateHash(text: string): string {
    return createHash("md5").update(text).digest("hex");
  }

  private async logError(error: unknown, userId: string): Promise<void> {
    try {
      await this.supabase.from("generation_error_logs").insert({
        error_code: "GENERATION_ERROR",
        error_message: error instanceof Error ? error.message : "Unknown error",
        model: this.openRouter.modelName,
        source_text_hash: "",
        source_text_length: 0,
        user_id: userId,
      });
    } catch (logError) {
      logger.error("Failed to log error:", logError);
    }
  }

  private extractAndParseJson(text: string) {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);

    let jsonText = "";

    if (match && match[1]) {
      jsonText = match[1];
    } else {
      jsonText = text.trim();
    }

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      logger.error("Failed to parse JSON:", error);
      return null;
    }
  }
}
