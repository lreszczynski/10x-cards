import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { FlashcardInputForm } from './FlashcardInputForm';

describe('FlashcardInputForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial empty state', () => {
    render(<FlashcardInputForm onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByPlaceholderText('Enter your text here (1000-10000 characters)...');
    const charCount = screen.getByText('0 characters');
    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });

    expect(textarea).toBeInTheDocument();
    expect(charCount).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('validates text length and shows error messages', async () => {
    const { user } = render(<FlashcardInputForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText('Enter your text here (1000-10000 characters)...');

    // Test too short text
    await user.type(textarea, 'Short text');
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Text must be at least 1000 characters long')).toBeInTheDocument();

    // Clear and test too long text (using a smaller sample for performance)
    await user.clear(textarea);
    const longText = 'a'.repeat(10001);
    fireEvent.change(textarea, { target: { value: longText } });
    expect(screen.getByText('Text cannot exceed 10000 characters')).toBeInTheDocument();
  }, { timeout: 10000 }); // Increased timeout

  it('submits form with valid text', async () => {
    const { user } = render(<FlashcardInputForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText('Enter your text here (1000-10000 characters)...');
    
    const validText = 'a'.repeat(1000);
    fireEvent.change(textarea, { target: { value: validText } });
    
    const submitButton = screen.getByRole('button');
    expect(submitButton).not.toBeDisabled();
    
    await user.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalledWith(validText);
  });

  it('updates character count in real-time', async () => {
    const { user } = render(<FlashcardInputForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText('Enter your text here (1000-10000 characters)...');
    
    await user.type(textarea, 'Hello');
    expect(screen.getByText(/5 characters/)).toBeInTheDocument();
    
    await user.type(textarea, ' World');
    expect(screen.getByText(/11 characters/)).toBeInTheDocument();
  });

  it('clears error when text becomes valid', async () => {
    const { user } = render(<FlashcardInputForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText('Enter your text here (1000-10000 characters)...');
    
    // First make it invalid
    await user.type(textarea, 'Short text');
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Text must be at least 1000 characters long')).toBeInTheDocument();
    
    // Then make it valid
    const validText = 'a'.repeat(1000);
    fireEvent.change(textarea, { target: { value: validText } });
    
    // Error should be gone
    expect(screen.queryByText('Text must be at least 1000 characters long')).not.toBeInTheDocument();
  });
}); 