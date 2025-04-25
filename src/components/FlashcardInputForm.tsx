import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface FlashcardInputFormProps {
  onSubmit: (text: string) => void;
}

export function FlashcardInputForm({ onSubmit }: FlashcardInputFormProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateText = (text: string) => {
    const length = text.trim().length;
    if (length < 1000) {
      return "Text must be at least 1000 characters long";
    }
    if (length > 10000) {
      return "Text cannot exceed 10000 characters";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateText(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSubmit(text);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    // Only show validation errors while typing if text exceeds max length
    if (newText.length > 10000) {
      setError(validateText(newText));
    } else {
      setError(null);
    }
  };

  const characterCount = text.length;
  const isValid = characterCount >= 1000 && characterCount <= 10000;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter your text here (1000-10000 characters)..."
            className="min-h-[200px] resize-y"
          />
          <div className="mt-2 flex justify-between items-center text-sm">
            <span className={`${error ? "text-destructive" : "text-muted-foreground"}`}>
              {characterCount} characters
            </span>
            {error && <span className="text-destructive">{error}</span>}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            type="submit" 
            disabled={!isValid}
          >
            Generate Flashcards
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 