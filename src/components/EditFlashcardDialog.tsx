import { useState, useEffect } from "react";
import type { FlashcardResponseDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditFlashcardDialogProps {
  flashcard: FlashcardResponseDto | null;
  onClose: () => void;
  onSubmit: (id: number, front: string, back: string) => void;
}

export function EditFlashcardDialog({ flashcard, onClose, onSubmit }: EditFlashcardDialogProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<{ front?: string; back?: string } | null>(null);

  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front);
      setBack(flashcard.back);
      setError(null);
    }
  }, [flashcard]);

  const validateForm = () => {
    const errors: { front?: string; back?: string } = {};

    if (!front.trim()) {
      errors.front = "Front side cannot be empty";
    } else if (front.length > 200) {
      errors.front = "Front side cannot exceed 200 characters";
    }

    if (!back.trim()) {
      errors.back = "Back side cannot be empty";
    } else if (back.length > 500) {
      errors.back = "Back side cannot exceed 500 characters";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (validationErrors) {
      setError(validationErrors);
      return;
    }

    if (flashcard) {
      onSubmit(flashcard.id, front.trim(), back.trim());
    }
  };

  return (
    <Dialog open={flashcard !== null} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>
              Make changes to your flashcard here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="front" className="text-sm font-medium">
                Front
              </label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Front side of the flashcard"
                className={error?.front ? "border-destructive" : ""}
              />
              {error?.front && <p className="text-sm text-destructive">{error.front}</p>}
              <p className="text-sm text-muted-foreground">{front.length}/200 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="back" className="text-sm font-medium">
                Back
              </label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Back side of the flashcard"
                className={error?.back ? "border-destructive" : ""}
              />
              {error?.back && <p className="text-sm text-destructive">{error.back}</p>}
              <p className="text-sm text-muted-foreground">{back.length}/500 characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
