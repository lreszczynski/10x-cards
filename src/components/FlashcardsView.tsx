import { useState, useEffect } from "react";
import type { FlashcardResponseDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FlashcardsList } from "./FlashcardsList";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import { LoadingSkeleton } from "./LoadingSkeleton";

export function FlashcardsView() {
  const [flashcards, setFlashcards] = useState<FlashcardResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardResponseDto | null>(null);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/flashcards");
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data = await response.json();
      setFlashcards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (flashcard: FlashcardResponseDto) => {
    setEditingFlashcard(flashcard);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      setFlashcards((prev) => prev.filter((f) => f.id !== id));
      toast.success("Flashcard deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete flashcard";
      toast.error(errorMessage);
    }
  };

  const handleEditSubmit = async (id: number, front: string, back: string) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ front, back }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      const updatedFlashcard = await response.json();
      setFlashcards((prev) => prev.map((f) => (f.id === id ? updatedFlashcard : f)));
      setEditingFlashcard(null);
      toast.success("Flashcard updated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update flashcard";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-destructive">{error}</div>
        <Button onClick={fetchFlashcards} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {flashcards.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            You don&apos;t have any flashcards yet.{" "}
            <a href="/generate" className="text-primary hover:underline">
              Generate some now
            </a>
            !
          </p>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              {flashcards.length} flashcard{flashcards.length === 1 ? "" : "s"}
            </p>
            <Button asChild>
              <a href="/generate">Generate More</a>
            </Button>
          </div>

          <FlashcardsList flashcards={flashcards} onEdit={handleEdit} onDelete={handleDelete} />

          <EditFlashcardDialog
            flashcard={editingFlashcard}
            onClose={() => setEditingFlashcard(null)}
            onSubmit={handleEditSubmit}
          />
        </>
      )}
    </div>
  );
}
