-- Migration: Create generations table
-- Description: Creates the generations table for tracking AI generation sessions
-- Author: AI Assistant
-- Date: 2024-03-19

-- Generations table
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id),
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS on generations table
alter table generations enable row level security;

-- Create index on generations.user_id
create index generations_user_id_idx on generations(user_id);

-- RLS Policies for generations
create policy "Users can view their own generations" on generations
    for select using (auth.uid() = user_id);

create policy "Users can insert their own generations" on generations
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own generations" on generations
    for update using (auth.uid() = user_id);

create policy "Users can delete their own generations" on generations
    for delete using (auth.uid() = user_id);

-- Create trigger function for updating updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for generations
create trigger update_generations_updated_at
    before update on generations
    for each row
    execute function update_updated_at_column(); 