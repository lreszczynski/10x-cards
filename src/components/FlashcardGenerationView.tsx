import { useState } from "react";
import type { FlashcardProposalDto, GenerationResponseDto } from "@/types";
import { FlashcardInputForm } from "./FlashcardInputForm";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { FlashcardProposalList } from "./FlashcardProposalList";
import { SaveFlashcardsButton } from "./SaveFlashcardsButton";
import { toast } from "sonner";

export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  accepted: boolean;
  edited: boolean;
  editedFront?: string;
  editedBack?: string;
}

export function FlashcardGenerationView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcardProposals, setFlashcardProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const handleGenerateFlashcards = async (text: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source_text: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards. Please try again.");
      }

      const data: GenerationResponseDto = await response.json();
      setGenerationId(data.id);

      // Transform API response to view model
      const proposals: FlashcardProposalViewModel[] = data.flashcards_proposals.map((proposal) => ({
        ...proposal,
        accepted: false,
        edited: false,
      }));

      setFlashcardProposals(proposals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFlashcard = (id: number) => {
    setFlashcardProposals((prev) =>
      prev.map((proposal) => (proposal.id === id ? { ...proposal, accepted: true } : proposal))
    );
  };

  const handleRejectFlashcard = (id: number) => {
    setFlashcardProposals((prev) => prev.filter((proposal) => proposal.id !== id));
  };

  const handleEditFlashcard = (id: number, front: string, back: string) => {
    setFlashcardProposals((prev) =>
      prev.map((proposal) =>
        proposal.id === id
          ? {
              ...proposal,
              edited: true,
              editedFront: front,
              editedBack: back,
            }
          : proposal
      )
    );
  };

  const handleSaveSuccess = () => {
    toast.success("Flashcards have been saved successfully");
    // Reset the view
    setFlashcardProposals([]);
    setGenerationId(null);
  };

  return (
    <div className="space-y-8">
      <FlashcardInputForm onSubmit={handleGenerateFlashcards} />

      {error && <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">{error}</div>}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        flashcardProposals.length > 0 &&
        generationId && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{flashcardProposals.length} flashcards generated</p>
              <div className="flex space-x-2">
                <SaveFlashcardsButton
                  proposals={flashcardProposals}
                  generationId={generationId}
                  onSuccess={handleSaveSuccess}
                  saveMode="accepted"
                />
                <SaveFlashcardsButton
                  proposals={flashcardProposals}
                  generationId={generationId}
                  onSuccess={handleSaveSuccess}
                  saveMode="all"
                />
              </div>
            </div>
            <FlashcardProposalList
              proposals={flashcardProposals}
              onAccept={handleAcceptFlashcard}
              onReject={handleRejectFlashcard}
              onEdit={handleEditFlashcard}
            />
          </div>
        )
      )}
    </div>
  );
}
