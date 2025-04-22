# Schemat bazy danych dla 10x-cards

## 1. Lista tabel

### a) users

- **id**: UUID PRIMARY KEY
- **email**: VARCHAR(256) NOT NULL UNIQUE
- **encrypted_password**: VARCHAR NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **confirmed_at**: TIMESTAMPTZ

### b) generations

- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **model**: VARCHAR NOT NULL
- **generated_count**: INTEGER NOT NULL
- **accepted_unedited_count**: INTEGER NULLABLE
- **accepted_edited_count**: INTEGER NULLABLE
- **source_text_hash**: VARCHAR NOT NULL
- **source_text_length**: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- **generation_duration**: INTEGER NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

### c) flashcards

- **id**: BIGSERIAL PRIMARY KEY
- **front**: VARCHAR(200) NOT NULL
- **back**: VARCHAR(500) NOT NULL
- **source**: VARCHAR NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **generation_id**: BIGINT REFERENCES generations(id) ON DELETE SET NULL
- **user_id**: UUID NOT NULL REFERENCES users(id)

### d) generation_error_logs

- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **model**: VARCHAR NOT NULL
- **source_text_hash**: VARCHAR NOT NULL
- **source_text_length**: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- **error_code**: VARCHAR(100) NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relacje między tabelami

- W tabeli **flashcards**:
  - `user_id` → `users.id`
  - `generation_id` → `generations.id`

- W tabeli **generations**:
  - `user_id` → `users.id`

- W tabeli **generation_error_logs**:
  - `user_id` → `users.id`

- każda fiszka (flashcards) może opcjonalnie odnosić się do jednej generacji (generations) poprzez generation_id.

## 3. Indeksy

- **flashcards**:
  - Indeks na `user_id`
  - Indeks na `generation_id`

- **generations**:
  - Indeks na `user_id`

- **generation_error_logs**:
  - Indeks na `user_id`

## 4. Zasady RLS (Row-Level Security)

- w tabelach flashcards, generations oraz generation_error_logs wdrożyć polityki RLS, które pozwalają użytkownikowi na dostęp tylko do rekordów, gdzie 'user_id' odpowiada identyfikatorowi użytkownika z Supabase Auth (np. auth.uid() = user_id).

## 5. Dodatkowe uwagi

- Trigger w tabeli flashcards ma automatycznie aktualizować kolumnę 'updated_at' przy każdej modyfikacji rekordu.