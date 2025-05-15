import type { FlashcardResponseDto } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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

interface FlashcardsListProps {
  flashcards: FlashcardResponseDto[];
  onEdit: (flashcard: FlashcardResponseDto) => void;
  onDelete: (id: number) => void;
}

export function FlashcardsList({ flashcards, onEdit, onDelete }: FlashcardsListProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "ai-full":
        return "AI Generated";
      case "ai-edited":
        return "AI Edited";
      case "manual":
        return "Manual";
      default:
        return source;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Front</TableHead>
            <TableHead>Back</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flashcards.map((flashcard) => (
            <TableRow key={flashcard.id}>
              <TableCell className="font-medium max-w-[200px] truncate">{flashcard.front}</TableCell>
              <TableCell className="max-w-[300px] truncate">{flashcard.back}</TableCell>
              <TableCell>{getSourceLabel(flashcard.source)}</TableCell>
              <TableCell>{formatDate(flashcard.created_at)}</TableCell>
              <TableCell>{formatDate(flashcard.updated_at)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(flashcard)} title="Edit flashcard">
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Delete flashcard"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this flashcard? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(flashcard.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
