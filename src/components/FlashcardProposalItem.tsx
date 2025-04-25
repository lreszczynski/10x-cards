import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FlashcardProposalItemProps {
  proposal: FlashcardProposalViewModel;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (front: string, back: string) => void;
}

export function FlashcardProposalItem({
  proposal,
  onAccept,
  onReject,
  onEdit,
}: FlashcardProposalItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(proposal.editedFront || proposal.front);
  const [back, setBack] = useState(proposal.editedBack || proposal.back);

  const handleSaveEdit = () => {
    if (front.trim() && back.trim()) {
      onEdit(front, back);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setFront(proposal.editedFront || proposal.front);
    setBack(proposal.editedBack || proposal.back);
    setIsEditing(false);
  };

  return (
    <Card className={proposal.accepted ? "border-primary" : undefined}>
      <CardContent className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Front</label>
              <Textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Front side of the flashcard"
                className="resize-none"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Back</label>
              <Textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Back side of the flashcard"
                className="resize-none"
                maxLength={500}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Front</h3>
              <p className="text-muted-foreground">{front}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Back</h3>
              <p className="text-muted-foreground">{back}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={proposal.accepted}
            >
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={proposal.accepted}
                >
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Flashcard</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject this flashcard? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onReject}>
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={onAccept}
              disabled={proposal.accepted}
            >
              Accept
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
} 