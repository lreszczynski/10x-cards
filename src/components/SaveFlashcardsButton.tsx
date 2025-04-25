import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";
import type { CreateFlashcardCommandDto } from "@/types";

interface SaveFlashcardsButtonProps {
  proposals: FlashcardProposalViewModel[];
  generationId: number;
  onSuccess: () => void;
  saveMode: "all" | "accepted";
}

export function SaveFlashcardsButton({
  proposals,
  generationId,
  onSuccess,
  saveMode,
}: SaveFlashcardsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const flashcardsToSave = proposals
        .filter((p) => saveMode === "all" || p.accepted)
        .map((p): CreateFlashcardCommandDto => ({
          front: p.editedFront || p.front,
          back: p.editedBack || p.back,
          source: p.edited ? "ai-edited" : "ai-full",
          generation_id: generationId,
        }));

      if (flashcardsToSave.length === 0) {
        setError(saveMode === "accepted" ? "No flashcards have been accepted" : "No flashcards to save");
        return;
      }

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards: flashcardsToSave }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards. Please try again.");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Saving..." : `Save ${saveMode === "accepted" ? "Accepted" : "All"} Flashcards`}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 