-- Migration: Create flashcards table
-- Description: Creates the flashcards table for storing user's flashcards
-- Author: AI Assistant
-- Date: 2024-03-19

-- Flashcards table
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references generations(id) on delete set null,
    user_id uuid not null references auth.users(id)
);

-- Enable RLS on flashcards table
alter table flashcards enable row level security;

-- Create indexes on flashcards
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);

-- RLS Policies for flashcards
create policy "Users can view their own flashcards" on flashcards
    for select using (auth.uid() = user_id);

create policy "Users can insert their own flashcards" on flashcards
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own flashcards" on flashcards
    for update using (auth.uid() = user_id);

create policy "Users can delete their own flashcards" on flashcards
    for delete using (auth.uid() = user_id);

-- Create trigger for flashcards
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column(); 