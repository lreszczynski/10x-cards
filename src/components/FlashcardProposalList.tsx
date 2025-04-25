import type { FlashcardProposalDto } from "@/types";
import { FlashcardProposalItem } from "./FlashcardProposalItem";
import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";

interface FlashcardProposalListProps {
  proposals: FlashcardProposalViewModel[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (id: number, front: string, back: string) => void;
}

export function FlashcardProposalList({
  proposals,
  onAccept,
  onReject,
  onEdit,
}: FlashcardProposalListProps) {
  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <FlashcardProposalItem
          key={proposal.id}
          proposal={proposal}
          onAccept={() => onAccept(proposal.id)}
          onReject={() => onReject(proposal.id)}
          onEdit={(front, back) => onEdit(proposal.id, front, back)}
        />
      ))}
    </div>
  );
} 