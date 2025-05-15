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

  async getFlashcards(userId: string): Promise<FlashcardResponseDto[]> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching flashcards:", error);
      throw new Error("Failed to fetch flashcards");
    }

    return data as FlashcardResponseDto[];
  }

  async getFlashcard(userId: string, id: number): Promise<FlashcardResponseDto | null> {
    const { data, error } = await this.supabase.from("flashcards").select().eq("user_id", userId).eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching flashcard:", error);
      throw new Error("Failed to fetch flashcard");
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
      console.error("Error updating flashcard:", error);
      throw new Error("Failed to update flashcard");
    }

    return data as FlashcardResponseDto;
  }

  async deleteFlashcard(userId: string, id: number): Promise<boolean> {
    const { error } = await this.supabase.from("flashcards").delete().eq("user_id", userId).eq("id", id);

    if (error) {
      console.error("Error deleting flashcard:", error);
      throw new Error("Failed to delete flashcard");
    }

    return true;
  }
}
