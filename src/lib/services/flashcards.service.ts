import type { Database } from "../../db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommandDto, FlashcardResponseDto } from "../../types";

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createFlashcards(userId: string, flashcards: CreateFlashcardCommandDto[]): Promise<FlashcardResponseDto[]> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .insert(
        flashcards.map((flashcard) => ({
          ...flashcard,
          user_id: userId,
        }))
      )
      .select();

    if (error) {
      console.error("Error creating flashcards:", error);
      throw new Error("Failed to create flashcards");
    }

    return data as FlashcardResponseDto[];
  }
}
