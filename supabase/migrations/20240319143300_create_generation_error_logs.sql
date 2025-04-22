-- Migration: Create generation error logs table
-- Description: Creates the generation_error_logs table for tracking AI generation errors
-- Author: AI Assistant
-- Date: 2024-03-19

-- Generation error logs table
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Enable RLS on generation_error_logs table
alter table generation_error_logs enable row level security;

-- Create index on generation_error_logs.user_id
create index generation_error_logs_user_id_idx on generation_error_logs(user_id);

-- RLS Policies for generation_error_logs
create policy "Users can view their own error logs" on generation_error_logs
    for select using (auth.uid() = user_id);

create policy "Users can insert their own error logs" on generation_error_logs
    for insert with check (auth.uid() = user_id); 