-- Migration: Disable all RLS policies
-- Description: Disables Row Level Security on flashcards, generations, and generation_error_logs tables
-- Author: AI Assistant
-- Date: 2024-03-19

-- Disable RLS on all tables
alter table flashcards disable row level security;
alter table generations disable row level security;
alter table generation_error_logs disable row level security; 