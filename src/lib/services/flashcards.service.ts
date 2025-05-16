import type { Database } from "../../db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommandDto, FlashcardResponseDto } from "../../types";
import { logger } from "../../utils/logger";

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
      logger.error("Error creating flashcards:", error);
      throw error;
    }

    return data as FlashcardResponseDto[];
  }

  async getFlashcards(userId: string): Promise<FlashcardResponseDto[]> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching flashcards:", error);
      throw error;
    }

    return data as FlashcardResponseDto[];
  }

  async getFlashcard(userId: string, id: number): Promise<FlashcardResponseDto | null> {
    const { data, error } = await this.supabase.from("flashcards").select().eq("user_id", userId).eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Error fetching flashcard:", error);
      throw error;
    }

    return data as FlashcardResponseDto;
  }

  async updateFlashcard(
    userId: string,
    id: number,
    update: { front: string; back: string }
  ): Promise<FlashcardResponseDto | null> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .update({
        front: update.front,
        back: update.back,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Error updating flashcard:", error);
      throw error;
    }

    return data as FlashcardResponseDto;
  }

  async deleteFlashcard(userId: string, id: number): Promise<boolean> {
    const { error } = await this.supabase.from("flashcards").delete().eq("user_id", userId).eq("id", id);

    if (error) {
      logger.error("Error deleting flashcard:", error);
      throw error;
    }

    return true;
  }
}
